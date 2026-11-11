import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';
import { figma } from '../../storybook/figma';

const options = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'Heating and cooling' },
  { value: 'roofing', label: 'Roofing' },
];

const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  args: { label: 'Service type', options },
  argTypes: { size: { control: 'inline-radio', options: ['medium', 'large'] } },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('92-27131') },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'hvac' } };
export const ErrorState: Story = { name: 'Error', args: { error: 'Choose a service type' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'roofing' } };
export const Large: Story = { args: { size: 'large' } };

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Select {...args} />
      <Select {...args} defaultValue="hvac" />
      <Select {...args} error="Choose a service type" />
      <Select {...args} disabled defaultValue="roofing" />
      <Select {...args} size="large" helper="We match you with pros for this trade." />
    </div>
  ),
};
