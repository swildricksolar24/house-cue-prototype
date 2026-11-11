import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from './Banner';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Feedback/Banner',
  component: Banner,
  args: { title: 'Info title', children: 'One short sentence that says what happened and what to do.' },
  argTypes: { tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'error'] } },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('6-125') },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { tone: 'info' }, parameters: { design: figma('6-101') } };
export const Success: Story = { args: { tone: 'success' }, parameters: { design: figma('6-107') } };
export const Warning: Story = { args: { tone: 'warning' }, parameters: { design: figma('6-113') } };
export const ErrorTone: Story = { name: 'Error', args: { tone: 'error' }, parameters: { design: figma('6-119') } };
export const NoTitle: Story = { args: { title: undefined } };

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['info', 'success', 'warning', 'error'] as const).map((tone) => (
        <Banner key={tone} {...args} tone={tone} />
      ))}
    </div>
  ),
};
