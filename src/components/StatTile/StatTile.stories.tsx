import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatTile } from './StatTile';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/StatTile',
  component: StatTile,
  args: { label: 'Open requests', value: '7', meta: '3 awaiting approval' },
  parameters: { design: figma('261:1038') },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { decorators: [(Story) => <div style={{ maxWidth: 220 }}><Story /></div>] };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      <StatTile label="Open requests" value="7" meta="3 awaiting approval" />
      <StatTile label="Occupied units" value="42 / 45" meta="93% occupancy" />
      <StatTile label="Spend this month" value="$4,820" meta="12% under budget" />
      <StatTile label="Avg. time to fix" value="2.4 days" />
    </div>
  ),
};
