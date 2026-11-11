import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { MembersLock } from './MembersLock';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Feedback/Members Lock',
  component: MembersLock,
  decorators: [(Story) => <MemoryRouter><div style={{ width: 342 }}><Story /></div></MemoryRouter>],
  parameters: { design: figma('29-132') },
} satisfies Meta<typeof MembersLock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <MembersLock />
      <MembersLock title="Permit lookup" body="See which permits this job needs before you book." actionLabel="See plans" />
    </div>
  ),
};
