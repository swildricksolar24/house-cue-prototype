import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { TaskRow } from './TaskRow';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/TaskRow',
  component: TaskRow,
  args: { title: 'Replace HVAC filter', meta: 'AC / heat pump · Due Nov 28', tag: 'DIY' },
  decorators: [(Story) => <MemoryRouter><div style={{ maxWidth: 342 }}><Story /></div></MemoryRouter>],
  parameters: { design: figma('19:62') },
} satisfies Meta<typeof TaskRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DIY: Story = {};
export const Pro: Story = { args: { title: 'Annual AC tune-up', meta: 'AC / heat pump · Due Apr 1', tag: 'Pro', to: '/tasks/ac-tune-up' } };

export const AllVariants: Story = {
  render: () => (
    <div>
      <TaskRow title="Replace HVAC filter" meta="AC / heat pump · Due Nov 28" tag="DIY" to="/tasks/filter" />
      <TaskRow title="Annual AC tune-up" meta="AC / heat pump · Due Apr 1" tag="Pro" to="/tasks/tune-up" />
      <TaskRow icon="caution" title="Test smoke alarms" meta="Safety · Overdue 3 days" tag="DIY" tagTone="warning" onClick={() => {}} />
      <TaskRow title="Flush water heater" meta="Water heater · Due Jan 15" />
    </div>
  ),
};
