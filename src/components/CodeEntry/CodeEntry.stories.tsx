import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeEntry } from './CodeEntry';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Code Entry',
  component: CodeEntry,
  decorators: [(Story) => <div style={{ width: 328 }}><Story /></div>],
  parameters: { design: figma('92-22977') },
} satisfies Meta<typeof CodeEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: '482913' } };
export const ErrorState: Story = { name: 'Error', args: { defaultValue: '482910', error: 'That code doesn’t match. Check the email and try again.' } };
export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <CodeEntry />
      <CodeEntry defaultValue="482913" />
      <CodeEntry defaultValue="482910" error="That code doesn’t match. Check the email and try again." />
      <CodeEntry disabled />
    </div>
  ),
};
