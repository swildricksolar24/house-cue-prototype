import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OptionCard } from './OptionCard';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Content/OptionCard',
  component: OptionCard,
  args: { title: 'Option title', description: 'Short supporting description', icon: 'home' },
  parameters: { design: figma('6:80') },
} satisfies Meta<typeof OptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { selected: false } };
export const Selected: Story = { args: { selected: true } };
export const TitleOnly: Story = { args: { description: undefined, icon: undefined } };

const choices = [
  { id: 'me', title: 'Just me', description: 'I own and live in this home', icon: 'home' as const },
  { id: 'family', title: 'My family', description: 'Shared with people I live with', icon: 'users' as const },
  { id: 'rental', title: 'A rental', description: 'I manage it for tenants', icon: 'account' as const },
];

export const AllVariants: Story = {
  render: () => {
    const [value, setValue] = useState('me');
    return (
      <div role="radiogroup" aria-label="Who is the home for" style={{ display: 'grid', gap: 12, maxWidth: 342 }}>
        {choices.map((c) => (
          <OptionCard key={c.id} {...c} selected={value === c.id} onClick={() => setValue(c.id)} />
        ))}
      </div>
    );
  },
};
