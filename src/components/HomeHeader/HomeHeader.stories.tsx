import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { HomeHeader } from './HomeHeader';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/HomeHeader',
  component: HomeHeader,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { design: figma('5:248') },
} satisfies Meta<typeof HomeHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <HomeHeader />
      <HomeHeader label="Tenant · Unit A" address="1418 E Roosevelt St, Phoenix" />
      <HomeHeader label="Hogar" address="2218 W Palm Ln, Phoenix, AZ 85015 — a very long address" />
    </div>
  ),
};
