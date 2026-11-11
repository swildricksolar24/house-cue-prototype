import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { WebSideNav } from './WebSideNav';
import { roleNavItems, type AppRole } from '../TabBar/TabBar';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/WebSideNav',
  component: WebSideNav,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  argTypes: {
    role: { control: 'inline-radio', options: ['homeowner', 'landlord', 'tenant'] },
  },
  parameters: { design: figma('92:21097'), layout: 'fullscreen' },
} satisfies Meta<typeof WebSideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Side navs fill their parent's height; Figma frames are 900 tall. */
const frame: Story['decorators'] = [(Story) => <div style={{ height: 900 }}><Story /></div>];

export const Homeowner: Story = { args: { role: 'homeowner', active: 'home' }, decorators: frame, parameters: { design: figma('5:215') } };
export const Landlord: Story = { args: { role: 'landlord', active: 'portfolio' }, decorators: frame, parameters: { design: figma('261:1276') } };
export const Tenant: Story = { args: { role: 'tenant', active: 'home' }, decorators: frame, parameters: { design: figma('261:1466') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
      {(Object.keys(roleNavItems) as AppRole[]).flatMap((role) =>
        roleNavItems[role].map((item) => (
          <div key={`${role}-${item.key}`} style={{ height: 900 }}>
            <WebSideNav role={role} active={item.key as never} />
          </div>
        )),
      )}
    </div>
  ),
};
