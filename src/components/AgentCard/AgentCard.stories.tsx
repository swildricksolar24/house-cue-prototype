import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentCard } from './AgentCard';
import { UserBubble } from '../UserBubble/UserBubble';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/AgentCard',
  component: AgentCard,
  args: { children: 'Hi! I can find pros, compare quotes and book them, always with your OK.' },
  decorators: [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>],
  parameters: { design: figma('6:95') },
} satisfies Meta<typeof AgentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** C08 home dashboard prompt */
export const HomePrompt: Story = {
  args: { children: 'Your AC is 14 years old. Want me to get tune-up quotes before summer?' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <AgentCard>Hi! I can find pros, compare quotes and book them, always with your OK.</AgentCard>
      <UserBubble>The AC is blowing warm air upstairs.</UserBubble>
      <AgentCard>
        Sorry to hear that. Is the outdoor unit running? If it is, it may be low on refrigerant or the capacitor may be
        failing. I can ask 5 licensed HVAC pros for quotes.
      </AgentCard>
    </div>
  ),
};
