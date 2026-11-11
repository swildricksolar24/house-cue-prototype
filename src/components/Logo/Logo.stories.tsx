import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Foundations/Logo',
  component: Logo,
  argTypes: {
    type: { control: 'inline-radio', options: ['horizontal', 'symbol'] },
    color: { control: 'inline-radio', options: ['auto', 'light', 'dark', 'mono'] },
  },
  parameters: { design: figma('145-472') },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = { args: { type: 'horizontal' } };
export const Symbol: Story = { args: { type: 'symbol' } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['horizontal', 'symbol'] as const).map((type) => (
        <div key={type} style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {(['auto', 'light', 'dark', 'mono'] as const).map((color) => (
            <Logo key={color} type={type} color={color} />
          ))}
        </div>
      ))}
    </div>
  ),
};
