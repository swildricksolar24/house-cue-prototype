import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetricRow } from './MetricRow';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Quotes/MetricRow',
  component: MetricRow,
  args: { label: 'Label', value: 'Value' },
  decorators: [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>],
  parameters: { design: figma('191:789') },
} satisfies Meta<typeof MetricRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <MetricRow label="Price" value="15% above the median" />
      <MetricRow label="Start date" value="2 days after the earliest" />
      <MetricRow label="Warranty" value="1 of 4 offer longer · best is 2 years" />
      <MetricRow label="Rank (customer values quality)" value="#3 of 5" />
    </div>
  ),
};
