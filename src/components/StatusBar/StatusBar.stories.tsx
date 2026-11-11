import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { StatusBar } from './StatusBar';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/StatusBar',
  component: StatusBar,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { design: figma('5:55') },
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <StatusBar />
      <StatusBar time="12:30" status="LTE  ▮▮  64%" />
    </div>
  ),
};
