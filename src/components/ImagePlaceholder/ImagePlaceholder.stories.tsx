import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImagePlaceholder } from './ImagePlaceholder';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/ImagePlaceholder',
  component: ImagePlaceholder,
  args: { label: 'Illustration' },
  decorators: [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>],
  parameters: { design: figma('6:126') },
} satisfies Meta<typeof ImagePlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ImagePlaceholder label="Illustration" />
      <ImagePlaceholder label="Photo of the outdoor AC unit" height={120} />
    </div>
  ),
};
