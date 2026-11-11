import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { SetupChecklist } from './SetupChecklist';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/SetupChecklist',
  component: SetupChecklist,
  args: {
    title: 'Finish setting up your home',
    completed: 3,
    total: 9,
    items: [
      { id: 'systems', label: 'Add systems and appliances', meta: 'Done', done: true },
      { id: 'prefs', label: 'Set agent preferences', meta: '3 min', onClick: () => {} },
      { id: 'calendar', label: 'Connect your calendar', meta: '2 min', onClick: () => {} },
    ],
    seeAllLabel: 'See all 9 items',
    seeAllTo: '/setup',
  },
  decorators: [(Story) => <MemoryRouter><div style={{ maxWidth: 342 }}><Story /></div></MemoryRouter>],
  parameters: { design: figma('19:87') },
} satisfies Meta<typeof SetupChecklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <SetupChecklist {...args} />
      <SetupChecklist
        {...args}
        completed={7}
        items={[
          { id: 'docs', label: 'Upload your warranty documents', meta: '5 min', onClick: () => {} },
          { id: 'pay', label: 'Add a payment method', meta: '1 min', onClick: () => {} },
        ]}
      />
    </div>
  ),
};
