import type { Meta, StoryObj } from '@storybook/react-vite';
import { StateBlock } from './StateBlock';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Feedback/State Block',
  component: StateBlock,
  args: { title: 'Nothing here yet', body: 'When something arrives, it shows up here.', onAction: () => {} },
  argTypes: { kind: { control: 'inline-radio', options: ['empty', 'error'] } },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('108-372') },
} satisfies Meta<typeof StateBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { kind: 'empty' }, parameters: { design: figma('108-356') } };
export const ErrorKind: Story = { name: 'Error', args: { kind: 'error' }, parameters: { design: figma('108-364') } };
export const NoAction: Story = { args: { onAction: undefined } };

export const AllVariants: Story = {
  decorators: [(Story) => <Story />],
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 342px)', gap: 24 }}>
      <StateBlock {...args} kind="empty" />
      <StateBlock {...args} kind="error" />
    </div>
  ),
};
