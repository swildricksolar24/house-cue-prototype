import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from './Checkbox';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  args: { label: 'Label' },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('178-780') },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { parameters: { design: figma('178-756') } };
export const Checked: Story = { args: { defaultChecked: true }, parameters: { design: figma('178-760') } };
export const Indeterminate: Story = { args: { indeterminate: true }, parameters: { design: figma('178-766') } };
export const Disabled: Story = { args: { disabled: true }, parameters: { design: figma('178-772') } };
export const ErrorState: Story = { name: 'Error', args: { error: true }, parameters: { design: figma('178-776') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Checkbox label="Label" />
      <Checkbox label="Label" defaultChecked />
      <Checkbox label="Label" indeterminate />
      <Checkbox label="Label" disabled />
      <Checkbox label="Label" error />
    </div>
  ),
};

/** Parent "select all" drives Indeterminate */
export const SelectAll: Story = {
  render: () => {
    const items = ['Kitchen', 'Bathroom', 'Garage'];
    const [picked, setPicked] = useState<string[]>(['Kitchen']);
    const all = picked.length === items.length;
    return (
      <div>
        <Checkbox
          label="All rooms"
          checked={all}
          indeterminate={!all && picked.length > 0}
          onChange={() => setPicked(all ? [] : items)}
        />
        <div style={{ paddingLeft: 28 }}>
          {items.map((item) => (
            <Checkbox
              key={item}
              label={item}
              checked={picked.includes(item)}
              onChange={() => setPicked((p) => (p.includes(item) ? p.filter((x) => x !== item) : [...p, item]))}
            />
          ))}
        </div>
      </div>
    );
  },
};
