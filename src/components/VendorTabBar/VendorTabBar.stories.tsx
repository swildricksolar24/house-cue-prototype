import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { VendorTabBar, vendorNavItems } from './VendorTabBar';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/VendorTabBar',
  component: VendorTabBar,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  argTypes: {
    active: { control: 'inline-radio', options: vendorNavItems.map((i) => i.key) },
  },
  parameters: { design: figma('41:458') },
} satisfies Meta<typeof VendorTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Today: Story = { args: { active: 'today' }, parameters: { design: figma('41:323') } };
export const Requests: Story = { args: { active: 'requests' }, parameters: { design: figma('41:350') } };
export const Jobs: Story = { args: { active: 'jobs' }, parameters: { design: figma('41:404') } };
export const Earnings: Story = { args: { active: 'earnings' }, parameters: { design: figma('41:377') } };
export const Account: Story = { args: { active: 'account' }, parameters: { design: figma('41:431') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {vendorNavItems.map((item) => (
        <VendorTabBar key={item.key} active={item.key} />
      ))}
    </div>
  ),
};
