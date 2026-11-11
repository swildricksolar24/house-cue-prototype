import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { BottomActions } from './BottomActions';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/BottomActions',
  component: BottomActions,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { design: figma('6:153') },
} satisfies Meta<typeof BottomActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { secondaryLabel: 'Secondary action' } };
export const PrimaryOnly: Story = { args: { primaryLabel: 'Continue' } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <BottomActions secondaryLabel="Secondary action" />
      <BottomActions primaryLabel="Send request" />
      <BottomActions primaryLabel="Continue" primaryDisabled secondaryLabel="Skip for now" />
      <BottomActions primaryLabel="Continue" primaryLoading />
    </div>
  ),
};
