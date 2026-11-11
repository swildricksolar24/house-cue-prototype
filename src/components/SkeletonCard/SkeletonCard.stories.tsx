import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkeletonCard } from './SkeletonCard';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Feedback/Skeleton Card',
  component: SkeletonCard,
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('6-147') },
} satisfies Meta<typeof SkeletonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoAvatar: Story = { args: { avatar: false } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard avatar={false} />
    </div>
  ),
};
