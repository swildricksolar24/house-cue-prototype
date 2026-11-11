import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserBubble } from './UserBubble';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/UserBubble',
  component: UserBubble,
  args: { children: 'The AC is blowing warm air upstairs.' },
  decorators: [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>],
  parameters: { design: figma('19:119') },
} satisfies Meta<typeof UserBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UserBubble>Yes</UserBubble>
      <UserBubble>The AC is blowing warm air upstairs.</UserBubble>
      <UserBubble>It started yesterday afternoon. The downstairs is fine but the bedrooms are 82°F even with the thermostat at 72.</UserBubble>
    </div>
  ),
};
