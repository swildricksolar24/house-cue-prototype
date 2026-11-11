import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { TabBar, roleNavItems, type AppRole } from './TabBar';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/TabBar',
  component: TabBar,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  argTypes: {
    role: { control: 'inline-radio', options: ['homeowner', 'landlord', 'tenant'] },
  },
  parameters: { design: figma('5:188') },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Homeowner: Story = { args: { role: 'homeowner', active: 'home' }, parameters: { design: figma('5:68') } };
export const Landlord: Story = { args: { role: 'landlord', active: 'portfolio' }, parameters: { design: figma('261:1042') } };
export const Tenant: Story = { args: { role: 'tenant', active: 'home' }, parameters: { design: figma('261:1172') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(Object.keys(roleNavItems) as AppRole[]).flatMap((role) =>
        roleNavItems[role].map((item) => (
          <TabBar key={`${role}-${item.key}`} role={role} active={item.key as never} />
        )),
      )}
    </div>
  ),
};
