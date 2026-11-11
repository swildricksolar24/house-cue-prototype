import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ChangeOrderCard } from './ChangeOrderCard';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Quotes/ChangeOrderCard',
  component: ChangeOrderCard,
  args: {
    title: 'Replace the run capacitor (+$185)',
    body: 'The capacitor is failing. New total $374. Your payment hold goes up to match, and it still needs your OK.',
    meta: 'From the pro · 10:05 AM',
    onApprove: fn(),
    onDecline: fn(),
  },
  decorators: [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>],
  parameters: { design: figma('29:111') },
} satisfies Meta<typeof ChangeOrderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ChangeOrderCard {...args} />
      <ChangeOrderCard
        {...args}
        title="Add a surge protector (+$95)"
        body="Recommended for a 14-year-old unit. New total $284. Over your $250 spend cap, so it needs your OK."
        meta="From the pro · 10:22 AM"
      />
    </div>
  ),
};
