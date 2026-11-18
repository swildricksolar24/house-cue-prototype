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

/** Review change: a custom drawing in the tile (C11 Plan uses one per appliance) */
export const CustomIcon: Story = {
  args: {
    title: 'Flush water heater',
    meta: 'Water heater · Due Dec 3',
    tag: 'Pro',
    customIcon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden>
        <rect x='6' y='3' width='12' height='16' rx='3' />
        <path d='M9 21h6M12 8.5c1.2 1.4 2 2.4 2 3.5a2 2 0 0 1-4 0c0-1.1.8-2.1 2-3.5Z' />
      </svg>
    ),
  },
};

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
