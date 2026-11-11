import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { AgentFab } from './AgentFab';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/AgentFab',
  component: AgentFab,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  argTypes: {
    size: { control: 'inline-radio', options: ['compact', 'extended'] },
  },
  parameters: { design: figma('278:3570') },
} satisfies Meta<typeof AgentFab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compact: Story = { args: { size: 'compact', to: '/landlord/agent' }, parameters: { design: figma('278:3563') } };
export const Extended: Story = { args: { size: 'extended', to: '/landlord/agent' }, parameters: { design: figma('278:3566') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <AgentFab size="compact" />
      <AgentFab size="extended" />
    </div>
  ),
};
