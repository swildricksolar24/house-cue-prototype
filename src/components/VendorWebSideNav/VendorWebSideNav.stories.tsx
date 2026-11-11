import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { VendorWebSideNav } from './VendorWebSideNav';
import { vendorNavItems } from '../VendorTabBar/VendorTabBar';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/VendorWebSideNav',
  component: VendorWebSideNav,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  argTypes: {
    active: { control: 'inline-radio', options: vendorNavItems.map((i) => i.key) },
  },
  parameters: { design: figma('76:510'), layout: 'fullscreen' },
} satisfies Meta<typeof VendorWebSideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Side navs fill their parent's height; Figma frames are 900 tall. */
const frame: Story['decorators'] = [(Story) => <div style={{ height: 900 }}><Story /></div>];

export const Today: Story = { args: { active: 'today' }, decorators: frame, parameters: { design: figma('41:459') } };
export const Requests: Story = { args: { active: 'requests' }, decorators: frame, parameters: { design: figma('76:382') } };
export const Jobs: Story = { args: { active: 'jobs' }, decorators: frame, parameters: { design: figma('76:406') } };
export const Earnings: Story = { args: { active: 'earnings' }, decorators: frame, parameters: { design: figma('76:430') } };
export const Account: Story = { args: { active: 'account' }, decorators: frame, parameters: { design: figma('76:454') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
      {vendorNavItems.map((item) => (
        <div key={item.key} style={{ height: 900 }}>
          <VendorWebSideNav active={item.key} />
        </div>
      ))}
    </div>
  ),
};
