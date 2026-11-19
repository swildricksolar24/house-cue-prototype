import { agent, homeowner, money, planTaskDetails, systems } from '../../data/sample';

/**
 * Review change: the agent on C09 answers what you asked instead of a fixed script. The prototype has no AI behind it
 * (it's a static site), so this picks the topic from keywords and answers from the home's own data: its systems,
 * the care plan (planTaskDetails), the spend cap. When something sounds broken it offers to ask pros for quotes (the
 * ActionCard; Approve continues to C13 as before). Not a screen: the registry only picks up <CODE>-<slug>.tsx files.
 */
export type AgentAnswer = {
  text: string;
  /** "Ask 5 pros…" approval card under the reply */
  quote?: { title: string; body: string };
};

const sys = (id: string) => systems.find((s) => s.id === id)!;
const task = (id: string) => planTaskDetails[id];
const has = (q: string, re: RegExp) => re.test(q);

/** Words that mean something is wrong, not just a question about it */
const PROBLEM = /\b(not|isn'?t|isnt|won'?t|wont|doesn'?t|doesnt|broke\w*|stop\w*|warm air|blowing warm|no hot|cold water|leak\w*|drip\w*|nois\w*|loud|smell\w*|trip\w*|keeps|sparks?|flicker\w*|clog\w*|backed up|crack\w*|damag\w*|missing|fix|repair|help)\b/;

function quoteFor(trade: string, what: string, address: string) {
  return {
    title: `Ask 5 pros for ${what} quotes`,
    body: `I’ll email 5 licensed ${trade} near ${address} and collect quotes by 6 PM. Nothing is booked or paid without your OK.`,
  };
}

/** `firstName`: who the agent greets. Review change: Biff on the landlord view, Marty (the homeowner) otherwise */
export function answerFor(question: string, address: string, firstName: string = homeowner.firstName): AgentAnswer {
  const q = question.toLowerCase().trim();
  const problem = has(q, PROBLEM);

  // Safety first
  if (has(q, /\b(gas smell|smell(s)? (of )?gas|smell gas|fire|smoke|flood(ing)?|burst|sparks?|carbon monoxide|co alarm)\b/)) {
    return {
      text: 'That could be dangerous. If you smell gas, see sparks or smoke, or water is flooding, get everyone out first, then call 911 or your gas company. Use Emergency in the menu and I’ll get a pro to you now.',
    };
  }

  // AC / heating
  if (has(q, /\b(ac|a\/c|air ?con\w*|cooling|cool|warm air|heat pump|hvac|thermostat|furnace|heating|heater not)\b/) && !has(q, /water heater/)) {
    const ac = sys('ac');
    if (has(q, /filter/)) {
      const t = task('hvac-filter');
      return { text: `Your ${ac.model} takes a ${t.part!.name} filter (${t.part!.price}). It’s due ${t.due.split(' · ')[0]}, every 90 days, and takes about 15 minutes. It’s on your plan with the steps.` };
    }
    if (problem) {
      return {
        text: `Sorry about that. Your ${ac.model} is ${ac.age} old, and that usually points to a refrigerant or capacitor issue. That needs a licensed pro.`,
        quote: quoteFor('HVAC pros', 'AC repair', address),
      };
    }
    return { text: `Your ${ac.name.toLowerCase()} is a ${ac.model}, ${ac.age} old. Next on your plan: replace the filter (Nov 28), then clean the condenser coils (Dec 10). Want me to bundle both into one pro visit?` };
  }

  // Water heater
  if (has(q, /water heater|hot water|no hot|rheem/)) {
    const wh = sys('water-heater');
    if (problem) {
      return {
        text: `Your ${wh.model} water heater is ${wh.age} old. No hot water or a leak at the tank usually means the element, thermostat or a valve; a plumber should look at it.`,
        quote: quoteFor('plumbers', 'water heater repair', address),
      };
    }
    const t = task('flush-wh');
    return { text: `Your ${wh.model} water heater is ${wh.age} old. Its yearly flush is due Dec 3 (${t.cost}). Flushing clears sediment so it heats faster and lasts longer.` };
  }

  // Plumbing
  if (has(q, /leak|drip|pipe|toilet|sink|faucet|drain|clog|plumb|shower|disposal/)) {
    if (has(q, /clog\w*|backed up|slow drain|won'?t drain|draining slow/)) {
      return {
        text: 'Try a plunger first, or a hair snake for a shower or bath drain. Skip chemical drain cleaners; they can damage older pipes. If more than one drain is slow, it may be the main line and a plumber should look.',
        quote: quoteFor('plumbers', 'drain cleaning', address),
      };
    }
    return {
      text: 'Turn off the shutoff valve under the fixture (or the main by the meter) to stop the water, and put a towel down. A small drip can wait a day; a steady leak needs a plumber today.',
      quote: quoteFor('plumbers', 'plumbing repair', address),
    };
  }

  // Pool
  if (has(q, /pool|pump basket|pentair|chlorine/)) {
    const p = sys('pool-pump');
    if (problem) {
      return { text: `Your ${p.model} pool pump is ${p.age} old. If it hums but won’t run, it’s often the capacitor; if it runs but won’t pull water, check the basket and the lid seal first.`, quote: quoteFor('pool pros', 'pool pump repair', address) };
    }
    return { text: `Your ${p.model} pool pump basket is due for a clean Nov 30 (every 2 weeks, about 10 minutes, free). Turn the pump off first; the steps are on your plan.` };
  }

  // Dryer
  if (has(q, /dryer|lint|vent/)) {
    return { text: 'Your dryer vent clean is overdue since Nov 1. A clogged vent makes drying slow and is a fire risk. It’s about 30 minutes with a $18 brush kit, or I can find a pro.' };
  }

  // Electrical
  if (has(q, /outlet|gfci|electric|breaker|power|wiring|switch|lights?\b/)) {
    if (problem) {
      return { text: 'If a breaker keeps tripping or an outlet is warm or sparks, stop using it. Don’t open the panel or outlets yourself; that’s a job for a licensed electrician.', quote: quoteFor('electricians', 'electrical repair', address) };
    }
    return { text: 'Your monthly GFCI test is due Nov 30: press TEST on each of the 6 GFCI outlets, then RESET. If one won’t trip or reset, I’ll book an electrician.' };
  }

  // Roof
  if (has(q, /roof|gutter|tile|shingle|attic/)) {
    if (problem) {
      return { text: 'Stay off the roof. Take a few photos from the ground and I’ll compare them with your last check-up; for missing or cracked tiles a roofer should look.', quote: quoteFor('roofers', 'roof repair', address) };
    }
    return { text: 'Your roof line photo check-up is due Dec 12 (every 6 months, about 5 minutes from the ground). I’ll compare the photos with last time and flag anything that changed.' };
  }

  // Costs and spending
  if (has(q, /cost|price|how much|budget|spend|spent|cap|pay|afford|expensive|cheap/)) {
    return { text: `Your booking cap is ${money(agent.spendCap)}: anything over it needs your OK. I’ve spent ${money(agent.spentThisMonth)} this month. Coming up: water heater flush ${task('flush-wh').cost}, AC coil cleaning ${task('coils').cost.split(',')[0]}.` };
  }

  // Plan / what's due
  if (has(q, /due|plan|schedule|maintenance|to.?do|next|upcoming|this month|calendar|tasks?/)) {
    return { text: 'Next up: clean the dryer vent (overdue since Nov 1), replace the HVAC filter (Nov 28), clean the pool pump basket and test the GFCI outlets (Nov 30), then flush the water heater (Dec 3). Want me to book a pro for the water heater?' };
  }

  // Quotes / hiring
  if (has(q, /quote|\bpros?\b|contractor|plumber|electrician|roofer|book|hire|someone/)) {
    return { text: 'Sure. What needs doing? Tell me what’s wrong (for example “the AC is blowing warm air”) and I’ll ask 5 licensed pros nearby for quotes.' };
  }

  // Small talk
  if (has(q, /^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/)) {
    return { text: `Hi ${firstName}! I look after ${address}. Ask me about a repair, what’s due on your plan, or what something will cost.` };
  }
  if (has(q, /thank|thanks|thx|great|perfect|ok\b|okay/)) {
    return { text: 'You’re welcome. I’ll keep an eye on things and check with you before anything is booked.' };
  }

  return { text: `I can help with repairs, your care plan, quotes and costs for ${address}. Try “Why is my AC blowing warm air?”, “What’s due this month?” or “How much will the water heater flush cost?”` };
}
