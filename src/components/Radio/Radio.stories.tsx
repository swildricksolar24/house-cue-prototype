import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './Radio';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Radio',
  component: Radio,
  args: { label: 'Label', name: 'demo' },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('178-798') },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { parameters: { design: figma('178-781') } };
export const Checked: Story = { args: { defaultChecked: true }, parameters: { design: figma('178-785') } };
export const Disabled: Story = { args: { disabled: true }, parameters: { design: figma('178-790') } };
export const ErrorState: Story = { name: 'Error', args: { error: true }, parameters: { design: figma('178-794') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Radio label="Label" name="a" />
      <Radio label="Label" name="b" defaultChecked />
      <Radio label="Label" name="c" disabled />
      <Radio label="Label" name="d" error />
    </div>
  ),
};

/** A group: preselect a sensible default, stack vertically, one message for the group */
export const Group: Story = {
  render: () => (
    <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
      <legend className="hc-medium-semibold">When should the pro arrive?</legend>
      <Radio name="when" value="morning" label="Morning (8–12)" defaultChecked />
      <Radio name="when" value="afternoon" label="Afternoon (12–5)" />
      <Radio name="when" value="evening" label="Evening (5–8)" />
    </fieldset>
  ),
};
