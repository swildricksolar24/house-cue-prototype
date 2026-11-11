import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ActionCard } from './ActionCard';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/ActionCard',
  component: ActionCard,
  args: {
    title: 'Ask 5 pros for AC repair quotes',
    body: 'I’ll email 5 licensed HVAC pros near 2218 W Palm Ln. No cost to you until you book.',
    meta: 'Agent · 2 min ago',
    onApprove: fn(),
    onEdit: fn(),
    onReject: fn(),
  },
  decorators: [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>],
  parameters: { design: figma('19:73') },
} satisfies Meta<typeof ActionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ActionCard {...args} />
      <ActionCard
        {...args}
        title="Book Zephyrline HVAC for Thu, Nov 13"
        body="$189 held on your card ending 4242. Nothing is charged until you sign off the job."
        meta="Agent · just now"
      />
    </div>
  ),
};
