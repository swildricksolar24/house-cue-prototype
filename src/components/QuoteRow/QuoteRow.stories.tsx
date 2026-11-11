import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { QuoteRow } from './QuoteRow';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Quotes/QuoteRow',
  component: QuoteRow,
  args: {
    vendor: 'Zephyrline HVAC',
    price: '$189',
    trustScore: 92,
    rating: '★ 4.8 (126) · Licensed · Insured',
    reviews: 'HouseCue job reviews ★ 4.8 · 126 jobs',
    nearby: '3 recent jobs within 2 miles',
    details: 'Earliest Thu, Nov 13 · 1-year workmanship warranty',
    onNearbyClick: fn(),
    onChoose: fn(),
    onProfile: fn(),
  },
  argTypes: { network: { control: 'inline-radio', options: ['in-network', 'out-of-network'] } },
  decorators: [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>],
  parameters: { design: figma('99:370') },
} satisfies Meta<typeof QuoteRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InNetwork: Story = { args: { network: 'in-network' } };
export const OutOfNetwork: Story = { args: { network: 'out-of-network' } };
export const Updated: Story = { args: { updated: true, price: '$174' } };
export const WithoutNearby: Story = { args: { nearby: undefined } };

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <QuoteRow {...args} network="in-network" />
      <QuoteRow {...args} network="out-of-network" />
      <QuoteRow {...args} network="in-network" updated price="$174" nearby={undefined} />
    </div>
  ),
};
