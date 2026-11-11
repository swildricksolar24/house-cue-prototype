import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListRow } from './ListRow';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/ListRow',
  component: ListRow,
  args: { title: 'Title', description: 'Description' },
  decorators: [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>],
  parameters: { design: figma('6:133') },
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { description: undefined } };

export const AllVariants: Story = {
  render: () => (
    <div>
      <ListRow title="Finds licensed pros" description="Checks licence, insurance and reviews before asking for quotes" />
      <ListRow title="Compares quotes for you" description="Price, earliest date and warranty side by side" />
      <ListRow icon="lock" title="Books only with your OK" description="Nothing is charged until you approve" />
      <ListRow title="No description" />
    </div>
  ),
};
