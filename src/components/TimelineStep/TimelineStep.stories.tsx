import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimelineStep } from './TimelineStep';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Quotes/TimelineStep',
  component: TimelineStep,
  args: { state: 'done', title: 'Vendor on the way', meta: 'ETA 9:40 AM · 12 min away' },
  argTypes: { state: { control: 'inline-radio', options: ['done', 'current', 'upcoming'] } },
  decorators: [(Story) => <ol style={{ maxWidth: 342, margin: 0, padding: 0 }}><Story /></ol>],
  parameters: { design: figma('29:110') },
} satisfies Meta<typeof TimelineStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Done: Story = {};
export const Current: Story = { args: { state: 'current' } };
export const Upcoming: Story = { args: { state: 'upcoming' } };

export const AllVariants: Story = {
  render: () => (
    <>
      <TimelineStep state="done" title="Booked" meta="Mon, Nov 10 · 4:12 PM" />
      <TimelineStep state="done" title="Vendor on the way" meta="ETA 9:40 AM · 12 min away" />
      <TimelineStep state="current" title="Arrived" meta="9:38 AM · Marco from Zephyrline HVAC" />
      <TimelineStep state="upcoming" title="In progress" meta="Usually 1–2 hours" />
      <TimelineStep state="upcoming" title="Completed" meta="You sign off, then 90% is released" />
    </>
  ),
};
