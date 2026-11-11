import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { ConsoleBreadcrumb } from './ConsoleBreadcrumb';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/ConsoleBreadcrumb',
  component: ConsoleBreadcrumb,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { design: figma('239:27269') },
} satisfies Meta<typeof ConsoleBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { parentTo: '/support/queue' } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <ConsoleBreadcrumb parentTo="/support/queue" />
      <ConsoleBreadcrumb parent="People" parentTo="/admin/people" current="Maria Lopez" />
      <ConsoleBreadcrumb parent="Disputes" current="DSP-1042 (not linked)" />
    </div>
  ),
};
