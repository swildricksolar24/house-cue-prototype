import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { PushCard } from './PushCard';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/PushCard',
  component: PushCard,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { design: figma('6:140') },
} satisfies Meta<typeof PushCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <PushCard />
      <PushCard title="Your plumber is on the way" body="Copperwick Pipe Co. arrives between 2 and 4 pm today." />
      <PushCard
        meta="HouseCue · hace 2 min"
        title="Su plomero está en camino"
        body="Copperwick Pipe Co. llega entre las 2 y las 4 pm de hoy. Toque para ver los detalles del trabajo."
      />
    </div>
  ),
};
