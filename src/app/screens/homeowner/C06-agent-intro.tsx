import { AgentCard } from '../../../components/AgentCard/AgentCard';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import type { IconName } from '../../../components/Icon/Icon';
import { ListRow } from '../../../components/ListRow/ListRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { WebCard, WebStepHeader } from './_onboarding';

const GREETING = 'Hi, I’m your HouseCue agent. I keep track of your home and handle the legwork with pros.';

const abilities = (mobile: boolean): { title: string; description: string; icon: IconName }[] => [
  { title: 'Finds pros and asks for quotes', description: 'I email pros first, and text or call once they reply.', icon: 'search' },
  { title: 'Schedules estimates and jobs', description: 'Around the times you tell me you’re free.', icon: 'calendar' },
  { title: 'Books and pays only with your OK', description: 'You set my spending limit next.', icon: 'shield' },
  {
    title: 'Here when you need me',
    description: mobile ? 'Chat or talk to me from the Agent tab.' : 'Chat with me from the Agent menu.',
    icon: 'chat',
  },
];

/** C06 Agent intro and permissions — Figma mobile 215:12102, web 215:14669 (J1 Onboarding step 8) */
export default function AgentIntro(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const mobile = device === 'mobile';

  const list = (
    <div>
      {abilities(mobile).map((a) => (
        <ListRow key={a.title} title={a.title} description={a.description} icon={a.icon} />
      ))}
    </div>
  );

  if (mobile) {
    return (
      <MobileShell
        className="hc-onb-mobile"
        header={{ title: 'Your agent', step: '5 of 6', progress: 5 / 6 }}
        bottom={<BottomActions primaryLabel="Sounds good" onPrimary={flow.goNext} />}
      >
        <AgentCard>{GREETING}</AgentCard>
        {list}
        <p className="hc-small hc-muted">I’ll ask for camera, location or microphone access only when a feature needs it.</p>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <WebStepHeader step={5} />
        <AgentCard>{GREETING}</AgentCard>
        {list}
        <div className="hc-onb-actions">
          <Button fullWidth onClick={flow.goNext}>
            Sounds good
          </Button>
        </div>
      </WebCard>
    </WebShell>
  );
}
