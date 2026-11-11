import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill, toneForLabel } from './StatusPill';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Feedback/Status Pill',
  component: StatusPill,
  args: { label: 'Active' },
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'info', 'success', 'warning', 'danger'] } },
  parameters: { design: figma('261-1037') },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { tone: 'neutral' } };
export const Info: Story = { args: { tone: 'info' } };
export const Success: Story = { args: { tone: 'success' } };
export const Warning: Story = { args: { tone: 'warning' } };
export const Danger: Story = { args: { tone: 'danger' } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {(['neutral', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
        <StatusPill key={tone} tone={tone} label="Active" />
      ))}
    </div>
  ),
};

const labels = [
  'Paid', 'Booked', 'Verified', 'Connected',
  'Pending review', 'Invite pending', 'Awaiting pro', 'Expiring',
  'Payment failed', 'Overdue', 'Disputed', 'Rejected (Agent: Reject)',
  'Trust 81', 'Revised $335', '3 replied', 'New',
  'Draft', 'Cancelled', 'Co-owner', 'Veteran-owned',
];

/** Tone picked by `toneForLabel` (guidance frame 352:132295) */
export const ToneByLabel: Story = {
  parameters: { design: figma('352-132295') },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: '12px 24px' }}>
      {labels.map((label) => (
        <div key={label} style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
          <StatusPill label={label} />
          <span className="hc-small hc-muted">{toneForLabel(label)}</span>
        </div>
      ))}
    </div>
  ),
};
