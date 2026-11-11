import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input, type InputType } from './Input';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Input',
  component: Input,
  args: { label: 'Label', placeholder: 'Placeholder' },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'phone', 'number', 'code', 'search', 'multiline'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
  },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('177-1592') },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = { parameters: { design: figma('177-740') } };
export const Email: Story = { args: { type: 'email', label: 'Email', placeholder: 'you@example.com' }, parameters: { design: figma('177-860') } };
export const Phone: Story = { args: { type: 'phone', label: 'Mobile number', placeholder: '(555) 555-0100' }, parameters: { design: figma('177-980') } };
export const NumberType: Story = { name: 'Number', args: { type: 'number', label: 'Budget', placeholder: '0' }, parameters: { design: figma('177-1112') } };
export const PasswordlessCode: Story = {
  name: 'Password-less code',
  args: { type: 'code', label: 'Code', placeholder: '• • • • • •', helper: '6 digits · expires in 10 minutes', maxLength: 6 },
  parameters: { design: figma('177-1232') },
};
export const Search: Story = { args: { type: 'search', label: 'Search', defaultValue: 'Plumber' }, parameters: { design: figma('177-1372') } };
export const Multiline: Story = { args: { type: 'multiline', label: 'Notes' }, parameters: { design: figma('177-1472') } };
export const Filled: Story = { args: { defaultValue: 'Placeholder' }, parameters: { design: figma('177-760') } };
export const ErrorState: Story = { name: 'Error', args: { defaultValue: 'Placeholder', error: 'Error message' }, parameters: { design: figma('177-770') } };
export const Disabled: Story = { args: { disabled: true }, parameters: { design: figma('177-780') } };
export const ReadOnly: Story = { name: 'Read-only', args: { readOnly: true, defaultValue: 'Placeholder' }, parameters: { design: figma('177-790') } };
export const Large: Story = { args: { size: 'large' }, parameters: { design: figma('177-800') } };

const types: InputType[] = ['text', 'email', 'phone', 'number', 'code', 'search', 'multiline'];

export const AllVariants: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {types.flatMap((type) =>
        (['medium', 'large'] as const).map((size) => (
          <div key={`${type}-${size}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 240px)', gap: 24, alignItems: 'start' }}>
            <Input type={type} size={size} label="Label" placeholder="Placeholder" />
            <Input type={type} size={size} label="Label" placeholder="Placeholder" autoFocus={type === 'text' && size === 'medium'} />
            <Input type={type} size={size} label="Label" defaultValue="Placeholder" />
            <Input type={type} size={size} label="Label" defaultValue="Placeholder" error="Error message" />
            <Input type={type} size={size} label="Label" placeholder="Placeholder" disabled />
            <Input type={type} size={size} label="Label" defaultValue="Placeholder" readOnly />
          </div>
        )),
      )}
    </div>
  ),
};
