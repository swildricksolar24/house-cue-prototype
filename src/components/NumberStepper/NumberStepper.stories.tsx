import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberStepper } from './NumberStepper';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Number Stepper',
  component: NumberStepper,
  args: {
    title: 'Quotes per request',
    helper: '3–10 · default 5. Your agent contacts twice this many pros.',
    min: 3,
    max: 10,
    defaultValue: 5,
  },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('101-356') },
} satisfies Meta<typeof NumberStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AtMinimum: Story = { args: { defaultValue: 3 } };
export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <NumberStepper {...args} />
      <NumberStepper {...args} defaultValue={3} />
      <NumberStepper {...args} defaultValue={10} />
      <NumberStepper {...args} disabled />
    </div>
  ),
};
