import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';

/** No Figma frame yet (review change: built for the Tenants & access dialog's Move-in date) */
const meta = {
  title: 'Components/Forms/Date Picker',
  component: DatePicker,
  args: { label: 'Move-in date', today: new Date(2026, 10, 20) },
  decorators: [(Story) => <div style={{ width: 342, minHeight: 420 }}><Story /></div>],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controlled, so picking a day shows it in the field */
function Controlled(args: Parameters<typeof DatePicker>[0]) {
  const [value, setValue] = useState(args.value ?? '');
  return <DatePicker {...args} value={value} onValueChange={setValue} />;
}

export const Default: Story = { render: (args) => <Controlled {...args} /> };
export const Filled: Story = { args: { value: '2026-12-01' }, render: (args) => <Controlled {...args} /> };
export const WithHelper: Story = { args: { helper: 'When their lease starts.' }, render: (args) => <Controlled {...args} /> };
export const ErrorState: Story = { name: 'Error', args: { error: 'Choose a move-in date' }, render: (args) => <Controlled {...args} /> };
export const Disabled: Story = { args: { disabled: true, value: '2026-03-01' } };
