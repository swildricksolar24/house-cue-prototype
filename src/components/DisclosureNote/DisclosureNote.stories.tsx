import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DisclosureNote } from './DisclosureNote';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Feedback/Disclosure Note',
  component: DisclosureNote,
  argTypes: { variant: { control: 'inline-radio', options: ['note', 'info-icon'] } },
  parameters: { design: figma('206-1020') },
} satisfies Meta<typeof DisclosureNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Note: Story = {
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('206-1003') },
};
export const InfoIcon: Story = { name: 'Info icon', args: { variant: 'info-icon' }, parameters: { design: figma('206-1015') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
      <div style={{ width: 342 }}>
        <DisclosureNote />
      </div>
      <DisclosureNote variant="info-icon" />
    </div>
  ),
};

/** Dismiss the note, then reopen it from the Info icon beside the heading */
export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ width: 342, display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="hc-h4">Quotes</h2>
          {!open && <DisclosureNote variant="info-icon" onOpen={() => setOpen(true)} />}
        </div>
        {open && <DisclosureNote onDismiss={() => setOpen(false)} />}
      </div>
    );
  },
};
