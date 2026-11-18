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

/** C08 dashboard (review change): every item listed and numbered (circles, filled when done), status as a tag after the task, Edit on the right, no See all link */
export const Numbered: Story = {
  args: {
    numbered: true,
    metaAsTag: true,
    seeAllLabel: undefined,
    seeAllTo: undefined,
    items: [
      { id: 'systems', label: 'Add systems and appliances', meta: 'Done', done: true, onEdit: () => {} },
      { id: 'prefs', label: 'Set agent preferences', meta: '3 min', onEdit: () => {} },
      { id: 'calendar', label: 'Connect your calendar', meta: '2 min', onEdit: () => {} },
      { id: 'email', label: 'Import receipts from email', meta: '2 min', onEdit: () => {} },
      { id: 'documents', label: 'Upload documents', meta: 'Done', done: true, onEdit: () => {} },
    ],
  },
};

/** C08 dashboard (review change): steps grouped under small headings, numbered 1–9 straight through the groups */
export const Grouped: Story = {
  args: {
    numbered: true,
    metaAsTag: true,
    seeAllLabel: undefined,
    seeAllTo: undefined,
    items: [
      { id: 'systems', group: 'Your home', label: 'Add systems and appliances', meta: 'Done', done: true, onEdit: () => {} },
      { id: 'rooms', group: 'Your home', label: 'Add rooms and materials', meta: '5 min', onEdit: () => {} },
      { id: 'calendar', group: 'Connections', label: 'Connect your calendar', meta: '2 min', onEdit: () => {} },
      { id: 'email', group: 'Connections', label: 'Import receipts from email', meta: '2 min', onEdit: () => {} },
      { id: 'prefs', group: 'Agent and account', label: 'Set agent preferences', meta: '3 min', onEdit: () => {} },
    ],
  },
};
