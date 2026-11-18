/**
 * Shared placeholder data for the prototype, taken from the Figma screens (Phoenix/Tucson addresses, invented
 * sample pros — not real Arizona companies). Screen-specific data lives in the screen file; put things here only
 * when several screens show the same record.
 */

export const homeowner = {
  firstName: 'Marty', // Review change: Back to the Future character names for the sample people
  lastName: 'McFly',
  email: 'marty@example.com',
  plan: 'Member' as 'Member' | 'Free',
};

/**
 * Demo account for walking through sign in (prototype only, not in Figma), filled in by the
 * "Use demo account" / "Use demo code" buttons on C02. The code step only accepts this code.
 */
export const demoAccount = {
  email: homeowner.email,
  phone: '(602) 555-0142',
  code: '123456',
};

export type Home = { id: string; address: string; city: string; label: string; role: 'owner' | 'landlord' | 'tenant' };

export const homes: Home[] = [
  { id: 'palm', address: '2218 W Palm Ln', city: 'Phoenix', label: 'Member home', role: 'owner' },
  { id: 'cactus', address: '4410 E Cactus Rd', city: 'Phoenix', label: 'Rental', role: 'landlord' },
  { id: 'speedway', address: '815 E Speedway Blvd', city: 'Tucson', label: 'Rental', role: 'landlord' },
];

export const currentHome = homes[0];

/** The homes on Marty's account, as in C38 Multi-home switcher (Figma 26:3187 … 26:3220). Picked from the header / side nav home picker. */
export type AccountHome = { id: string; address: string; city: string; meta: string; label: string };
export const accountHomes: AccountHome[] = [
  { id: 'palm', address: '2218 W Palm Ln', city: 'Phoenix', meta: 'Owner · Member · 14 items', label: 'Member home' },
  { id: 'saguaro', address: '5530 E Saguaro Dr', city: 'Tucson', meta: 'Owner · Free plan · 6 of 10 items', label: 'Free plan' },
  { id: 'mesa-vista', address: '81 N Mesa Vista', city: 'Tucson', meta: 'Caregiver · Member', label: 'Caregiver' },
  { id: 'pine-ridge', address: '4410 Pine Ridge Rd', city: 'Flagstaff', meta: 'Owner · Free plan · Booking not available here yet', label: 'Free plan' },
];

export type HomeSystem = { id: string; name: string; model: string; age: string };

export const systems: HomeSystem[] = [
  { id: 'ac', name: 'AC / heat pump', model: 'Trane XR14', age: '14 years' },
  { id: 'water-heater', name: 'Water heater', model: 'Rheem', age: '6 years' },
  { id: 'pool-pump', name: 'Pool pump', model: 'Pentair', age: '3 years' },
];

export type MaintenanceTask = { id: string; title: string; system: string; due: string; kind: 'DIY' | 'Pro' };

export const dueSoon: MaintenanceTask[] = [
  { id: 'hvac-filter', title: 'Replace HVAC filter', system: 'AC / heat pump', due: 'Nov 28', kind: 'DIY' },
  { id: 'pool-basket', title: 'Clean pool pump basket', system: 'Pool pump', due: 'Nov 30', kind: 'DIY' },
  { id: 'flush-wh', title: 'Flush water heater', system: 'Water heater', due: 'Dec 3', kind: 'Pro' },
];

/**
 * C08 "Finish setting up your home", numbered 1–9 in this order (review change: the order set in review; the setup
 * flow's steps and tracker follow it). The earlier grouping (Your home / Connections / Agent and account) is dropped.
 */
export const setupChecklist = [
  { id: 'payment', label: 'Add a payment method', meta: 'Done', done: true },
  { id: 'rooms', label: 'Add rooms and materials', meta: '5 min', done: false },
  { id: 'systems', label: 'Add systems and appliances', meta: 'Done', done: true },
  { id: 'devices', label: 'Connect devices', meta: '2 min', done: false },
  // Review change: Upload documents moved from 5 to 7; email and calendar moved up to 5 and 6
  { id: 'email', label: 'Import receipts from email', meta: '2 min', done: false },
  { id: 'calendar', label: 'Connect your calendar', meta: '2 min', done: false },
  { id: 'documents', label: 'Upload documents', meta: 'Done', done: true },
  { id: 'agent-prefs', label: 'Set agent preferences', meta: '3 min', done: false },
  { id: 'household', label: 'Invite household', meta: '1 min', done: false },
];

export const agent = {
  name: 'HouseCue agent',
  spendCap: 300,
  spentThisMonth: 0,
};

export type Vendor = {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  trust: number;
  inNetwork: boolean;
  nearbyJobs: number;
};

/** Invented sample pros (noted in Figma note cards, never real companies) */
export const vendors: Vendor[] = [
  { id: 'desert-air', name: 'Desert Air Comfort', trade: 'HVAC', rating: 4.9, reviews: 128, trust: 92, inNetwork: true, nearbyJobs: 6 },
  { id: 'saguaro', name: 'Saguaro Heating & Cooling', trade: 'HVAC', rating: 4.7, reviews: 86, trust: 88, inNetwork: true, nearbyJobs: 3 },
  { id: 'copper-state', name: 'Copper State Mechanical', trade: 'HVAC', rating: 4.6, reviews: 41, trust: 81, inNetwork: true, nearbyJobs: 2 },
  { id: 'valley-cool', name: 'Valley Cool Pros', trade: 'HVAC', rating: 4.4, reviews: 19, trust: 0, inNetwork: false, nearbyJobs: 1 },
];

export const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

/**
 * Smart-home devices in the home (review change: shared by C46 Connected devices "Devices by room" and C24 Add a
 * document "Linked to"). platform = the account they come through. Invented sample devices.
 */
/** The home's rooms in display order (C63 Rooms and materials): used to group devices on C46 and C42 */
export const roomOrder = ['Kitchen', 'Living room', 'Primary bedroom', 'Hall bath', 'Garage'];

export type HomeDevice = { id: string; name: string; room: string; platform: string; reading: string };
export const homeDevices: HomeDevice[] = [
  { id: 'thermostat', name: 'Thermostat', room: 'Living room', platform: 'Google Home / Nest', reading: '72°F · cooling' },
  { id: 'smoke', name: 'Smoke and CO alarm', room: 'Kitchen', platform: 'Google Home / Nest', reading: 'All clear' },
  { id: 'wh-leak', name: 'Leak sensor · water heater', room: 'Garage', platform: 'Google Home / Nest', reading: 'Dry' },
  { id: 'sink-leak', name: 'Leak sensor · under the sink', room: 'Hall bath', platform: 'Apple Home', reading: 'Dry' },
  { id: 'back-door', name: 'Door sensor · back door', room: 'Kitchen', platform: 'Apple Home', reading: 'Closed' },
  // Review change: more devices per room (account counts on the cards match)
  { id: 'coffee-plug', name: 'Smart plug · coffee maker', room: 'Kitchen', platform: 'Google Home / Nest', reading: 'Off' },
  { id: 'floor-lamp', name: 'Smart light · floor lamp', room: 'Living room', platform: 'Google Home / Nest', reading: 'On · 40%' },
  { id: 'bedroom-smoke', name: 'Smoke and CO alarm', room: 'Primary bedroom', platform: 'Google Home / Nest', reading: 'All clear' },
  { id: 'bath-humidity', name: 'Humidity sensor', room: 'Hall bath', platform: 'Apple Home', reading: '48% humidity' },
  { id: 'garage-door', name: 'Garage door sensor', room: 'Garage', platform: 'Alexa / Ring', reading: 'Closed' },
  { id: 'floodlight', name: 'Floodlight motion sensor', room: 'Garage', platform: 'Alexa / Ring', reading: 'No motion' },
  { id: 'bedroom-temp', name: 'Temperature sensor', room: 'Primary bedroom', platform: 'Alexa / Ring', reading: '70°F' },
];

/**
 * Review change: invites someone can receive (prototype shortcuts → Receive an invite), one per kind of account.
 * Accepting one and signing in adds the account to Choose an account (prototype/accounts.ts). Back to the Future
 * names (fictional); the landlord and tenant invites use the Mesa Verde Holdings portfolio the C79 / C84 screens show.
 */
export type InviteRole = 'homeowner' | 'landlord' | 'tenant';
export type SampleInvite = {
  role: InviteRole;
  /** Who sent it */
  from: string;
  /** Line under "You're invited" */
  description: string;
  /** The home, portfolio or rental, and its second line */
  place: string;
  placeMeta: string;
  /** Your role once you join */
  roleLabel: string;
  can: string[];
  /** Label and items for what someone else decides */
  needsLabel: string;
  needsOk: string[];
  spend: string;
  /** Banner title on Sign in while the invite waits */
  signInTitle: string;
  /** The account it adds to Choose an account */
  account: { id: string; title: string; meta: string };
  /**
   * Every property the account opens, listed on Choose an account (address, city, line under it).  is the
   * screen code it opens; a property without one has no flow in the prototype yet, so its row is disabled.
   */
  properties: { address: string; city: string; meta: string; screen?: string }[];
  /** Homeowner invites also add the home to the home switcher */
  home?: AccountHome;
};

export const sampleInvites: Record<InviteRole, SampleInvite> = {
  homeowner: {
    role: 'homeowner',
    from: 'Emmett Brown',
    description: 'Emmett Brown (owner) invited you to help look after their home on HouseCue.',
    place: '4710 E Camelback Rd, Phoenix',
    placeMeta: 'Your role: Household member · invite sent today · valid for 14 days',
    roleLabel: 'Household member',
    can: ['Ask for repairs and quotes', 'Be the contact for visits'],
    needsLabel: 'Needs Emmett’s OK',
    needsOk: ['Book pros', 'Pay with the home’s payment methods', 'Approve agent actions', 'See documents and valuables'],
    spend: '$0 · everything needs the owner’s OK',
    signInTitle: 'Sign in to join Emmett Brown’s home',
    account: { id: 'camelback', title: 'Emmett Brown’s home', meta: 'Household member · 4710 E Camelback Rd, Phoenix' },
    properties: [{ address: '4710 E Camelback Rd', city: 'Phoenix', meta: 'Household member · Emmett Brown’s home' }],
    home: { id: 'camelback', address: '4710 E Camelback Rd', city: 'Phoenix', meta: 'Household member · Emmett Brown’s home', label: 'Invited home' },
  },
  landlord: {
    role: 'landlord',
    from: 'Biff Tannen',
    description: 'Biff Tannen (owner, Mesa Verde Holdings) invited you to help manage their rentals on HouseCue.',
    place: 'Mesa Verde Holdings',
    placeMeta: 'Your role: Co-manager · 5 properties · 9 doors · valid for 14 days',
    roleLabel: 'Co-manager',
    can: ['See every property, tenant request and job', 'Approve repairs up to $500', 'Message tenants and pros'],
    needsLabel: 'Needs Biff’s OK',
    needsOk: ['Repairs over $500', 'Add or remove properties', 'Change payment methods'],
    spend: '$500 per job',
    signInTitle: 'Sign in to help manage Mesa Verde Holdings',
    account: { id: 'mesa-verde', title: 'Mesa Verde Holdings', meta: 'Co-manager · 5 properties · 9 doors' },
    // The C79 Portfolio dashboard rentals
    properties: [
      { address: '1418 E Roosevelt St', city: 'Phoenix', meta: '2 units · 2 tenants · 2 open', screen: 'C82' },
      { address: '5602 E Pima St', city: 'Tucson', meta: '4 units · 3 tenants · 1 vacant' },
      { address: '2207 N 9th Ave', city: 'Phoenix', meta: '1 unit · Priya H. · 1 open' },
      { address: '812 S 4th Ave', city: 'Tucson', meta: '1 unit · Jonah W. · nothing open' },
      { address: '3315 E Fairmount Ave', city: 'Phoenix', meta: 'Vacant · turnover 2 of 5 done' },
    ],
  },
  tenant: {
    role: 'tenant',
    from: 'Mesa Verde Holdings',
    description: 'Mesa Verde Holdings (your landlord) invited you to HouseCue for your rental.',
    place: '1418 E Roosevelt St, Unit A, Phoenix',
    placeMeta: 'Your role: Tenant · invite sent today · valid for 14 days',
    roleLabel: 'Tenant',
    can: ['Report an issue with photos, video or voice', 'Set when pros can visit', 'Follow your repairs'],
    needsLabel: 'Your landlord handles',
    needsOk: ['Booking and paying pros', 'Approving quotes'],
    spend: '$0 · your landlord pays for repairs',
    signInTitle: 'Sign in to join your rental at 1418 E Roosevelt St',
    account: { id: 'roosevelt-a', title: '1418 E Roosevelt St, Unit A', meta: 'Tenant · Phoenix · managed by Mesa Verde Holdings' },
    properties: [{ address: '1418 E Roosevelt St, Unit A', city: 'Phoenix', meta: 'Tenant · managed by Mesa Verde Holdings', screen: 'C84' }],
  },
};

/**
 * Review change: a home you were a household member of whose access has expired, listed (disabled, "Expired") under
 * Household member on Choose an account. Linda McFly is a fictional Back to the Future name; invented address.
 */
export const expiredHouseholdHome = {
  id: 'thomas-rd',
  address: '1922 E Thomas Rd',
  city: 'Phoenix',
  meta: 'Linda McFly’s home · access ended Oct 31',
  note: 'Ask Linda for a new invite',
};

/**
 * Review change: what C12 Task detail shows for each task on C11 Plan (?task=<id>), so every task opens a page about
 * that task. Kind sets the main action: DIY → Mark done, Pro → Hire a pro, Check-up → Start check-up (C61).
 * Invented models, prices and steps (prototype content).
 */
export type PlanTaskDetail = {
  title: string;
  kind: 'DIY' | 'Pro' | 'Check-up';
  overdue?: boolean;
  item: string;
  due: string;
  time: string;
  cost: string;
  part?: { name: string; price: string };
  steps: string[];
  safety: string;
  /** What the DIY coach's camera shows (C26 opened from this task) */
  camera: string;
};

export const planTaskDetails: Record<string, PlanTaskDetail> = {
  'dryer-vent': {
    title: 'Clean dryer vent',
    camera: 'dryer vent hose',
    kind: 'DIY',
    overdue: true,
    item: 'Dryer · Whirlpool WED5000',
    due: 'Overdue since Nov 1 · every 12 months',
    time: 'About 30 minutes',
    cost: '$0–$20 for a vent brush kit',
    part: { name: 'Dryer vent brush kit, 12 ft', price: 'about $18' },
    steps: [
      'Unplug the dryer, and turn off the gas valve if it’s a gas dryer.',
      'Pull the dryer out and disconnect the vent hose from the back.',
      'Brush out the hose and the wall duct, then vacuum up the lint.',
      'Clean the outside vent flap so it opens freely.',
      'Reconnect the hose, push the dryer back and run it for 10 minutes to check the airflow.',
    ],
    safety: 'Lint is flammable. Unplug the dryer first, and turn off the gas if it’s a gas dryer.',
  },
  'hvac-filter': {
    title: 'Replace HVAC filter',
    camera: 'filter door by the return vent',
    kind: 'DIY',
    item: 'AC / heat pump · Trane XR14',
    due: 'Nov 28 · every 90 days',
    time: 'About 15 minutes',
    cost: '$12–$25 for the filter',
    part: { name: 'Filter 16×25×1, MERV 8', price: 'about $14' },
    steps: [
      'Turn the system off at the thermostat.',
      'Open the filter door by the return vent in the hallway.',
      'Note the airflow arrow, then slide the old filter out.',
      'Slide in the new 16×25×1 filter with the arrow pointing toward the unit, and close the door.',
      'Turn the system back on and mark the task done.',
    ],
    safety: 'Turn the system off at the thermostat before you open the filter door.',
  },
  'pool-basket': {
    title: 'Clean pool pump basket',
    camera: 'pool pump lid',
    kind: 'DIY',
    item: 'Pool pump · Pentair SuperFlo',
    due: 'Nov 30 · every 2 weeks',
    time: 'About 10 minutes',
    cost: 'Free',
    steps: [
      'Turn the pump off at the timer or the breaker.',
      'Close the valves before and after the pump, if you have them.',
      'Unscrew the lid and lift out the basket.',
      'Empty the leaves and rinse the basket with a hose; check it for cracks.',
      'Put it back, check the lid’s O-ring, close the lid and turn the pump back on.',
    ],
    safety: 'Turn the pump off before you open it. A running pump pulls hard on hands and hair.',
  },
  gfci: {
    title: 'Test GFCI outlets',
    camera: 'kitchen GFCI outlet',
    kind: 'Pro',
    item: 'Electrical · 6 GFCI outlets (kitchen, baths, garage, patio)',
    due: 'Nov 30 · every month',
    time: 'About 10 minutes to test',
    cost: 'Free to test · $120–$180 if a pro replaces one',
    steps: [
      'Press TEST on each GFCI outlet; the RESET button should pop out.',
      'Plug in a lamp to check the power is off.',
      'Press RESET; the lamp should come back on.',
      'If an outlet won’t trip or won’t reset, stop using it and book an electrician.',
    ],
    safety: 'Don’t open outlet covers or replace outlets yourself. A faulty GFCI is a job for a licensed electrician.',
  },
  'flush-wh': {
    title: 'Flush water heater',
    camera: 'water heater drain valve',
    kind: 'Pro',
    item: 'Water heater · Rheem 50 gal, 6 years old',
    due: 'Dec 3 · every 12 months',
    time: 'About 1 hour',
    cost: '$120–$180 for a pro',
    steps: [
      'Turn the water heater off: gas to Pilot, or the breaker for an electric heater.',
      'Shut the cold-water valve on top of the tank.',
      'Attach a hose to the drain valve and run it to a drain outside.',
      'Open a hot tap in the house, then open the drain valve and let it run until the water is clear.',
      'Close the drain, refill the tank with the cold valve open, then turn the heater back on.',
    ],
    safety: 'The water comes out scalding. Let the tank cool for a few hours, and never turn on an electric heater when it’s empty.',
  },
  coils: {
    title: 'Clean AC condenser coils',
    camera: 'outdoor AC unit',
    kind: 'Pro',
    item: 'AC / heat pump · Trane XR14, outdoor unit',
    due: 'Dec 10 · every 12 months',
    time: 'About 45 minutes',
    cost: '$90–$150 for a pro, often bundled with a tune-up',
    steps: [
      'Turn the AC off at the thermostat and at the outdoor disconnect.',
      'Clear leaves and debris for 2 feet around the unit.',
      'Spray coil cleaner on the fins and let it soak.',
      'Rinse gently from the inside out with a garden hose; never a pressure washer.',
      'Straighten bent fins with a fin comb, then turn the power back on.',
    ],
    safety: 'Cut the power at the outdoor disconnect before you touch the unit. The fan can start on its own.',
  },
  'roof-check': {
    title: 'Roof line photo check-up',
    camera: 'roof line from the street',
    kind: 'Check-up',
    item: 'Roof · concrete tile, 14 years old',
    due: 'Dec 12 · every 6 months',
    time: 'About 5 minutes',
    cost: 'Free',
    steps: [
      'Stand across the street or in the yard where you can see the whole roof line.',
      'Take 3 photos: the front, the back, and the side that gets the most sun.',
      'Zoom in on cracked or slipped tiles, sagging gutters or dark stains.',
      'Upload them; HouseCue compares them with last time and tells you if anything changed.',
    ],
    safety: 'Stay on the ground. Don’t climb onto the roof; a pro can take a closer look if needed.',
  },
};
