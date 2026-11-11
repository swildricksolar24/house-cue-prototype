import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Button } from './Button';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Button',
  component: Button,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  args: { children: 'Send quote' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'tertiary', 'destructive', 'link'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
  },
  parameters: { design: figma('176-2811') },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Remove' } };
export const LinkButton: Story = { name: 'Link', args: { variant: 'link', children: 'See all' } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size={size}>Primary</Button>
          <Button size={size} variant="secondary">Secondary</Button>
          <Button size={size} variant="tertiary">Tertiary</Button>
          <Button size={size} variant="destructive">Destructive</Button>
          <Button size={size} variant="link">Link</Button>
          <Button size={size} leadingIcon="plus">Leading</Button>
          <Button size={size} variant="secondary" trailingIcon="calendar">Trailing</Button>
          <Button size={size} icon="search" aria-label="Search" />
          <Button size={size} disabled>Disabled</Button>
          <Button size={size} loading>Loading</Button>
        </div>
      ))}
    </div>
  ),
};

export const FullWidth: Story = { args: { fullWidth: true, size: 'large', children: 'Continue' } };
