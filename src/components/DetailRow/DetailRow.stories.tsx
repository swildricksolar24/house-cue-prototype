import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { fn } from 'storybook/test';
import { DetailRow } from './DetailRow';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/DetailRow',
  component: DetailRow,
  args: { label: 'Label', value: 'Value', onAction: fn() },
  decorators: [(Story) => <MemoryRouter><div style={{ maxWidth: 342 }}><Story /></div></MemoryRouter>],
  parameters: { design: figma('6:128') },
} satisfies Meta<typeof DetailRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAction: Story = {};
export const ReadOnly: Story = { args: { onAction: undefined } };

export const AllVariants: Story = {
  render: () => (
    <div>
      <DetailRow label="Address" value="2218 W Palm Ln, Phoenix AZ 85009" onAction={() => {}} />
      <DetailRow label="Year built · from county records" value="1998" onAction={() => {}} />
      <DetailRow label="Square feet" value="1,840" actionTo="/home/details/size" />
      <DetailRow label="Home type" value="Single-family" />
    </div>
  ),
};
