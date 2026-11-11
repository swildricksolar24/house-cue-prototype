import type { Meta, StoryObj } from '@storybook/react-vite';
import { HoldExplainer } from './HoldExplainer';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Quotes/HoldExplainer',
  component: HoldExplainer,
  args: {
    title: 'How your payment is protected',
    steps: [
      'We hold $189 on your card now. Nothing is charged yet.',
      'When you sign off the job, 90% goes to the pro.',
      'The last 10% is held for 30 days in case something goes wrong.',
    ],
  },
  decorators: [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>],
  parameters: { design: figma('29:123') },
} satisfies Meta<typeof HoldExplainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <HoldExplainer {...args} />
      <HoldExplainer
        title="How your payment is protected"
        steps={[
          'We hold $374 on your card now, including the approved change order.',
          'When you sign off the job, all of it goes to the pro. Top performers have no 30-day hold.',
        ]}
      />
    </div>
  ),
};
