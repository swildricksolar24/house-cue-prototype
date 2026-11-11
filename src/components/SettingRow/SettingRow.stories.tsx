import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingRow } from './SettingRow';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Setting Row',
  component: SettingRow,
  args: { title: 'Setting title', description: 'One line that explains what this changes.' },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('76-169') },
} satisfies Meta<typeof SettingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = { args: { defaultChecked: true }, parameters: { design: figma('19-112') } };
export const Off: Story = { parameters: { design: figma('76-151') } };
export const DisabledOff: Story = { name: 'Disabled off', args: { disabled: true }, parameters: { design: figma('76-157') } };
export const DisabledOn: Story = { name: 'Disabled on', args: { disabled: true, defaultChecked: true }, parameters: { design: figma('76-163') } };

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      <SettingRow {...args} defaultChecked />
      <SettingRow {...args} />
      <SettingRow {...args} disabled />
      <SettingRow {...args} disabled defaultChecked />
      <SettingRow title="Text me when a pro replies" />
    </div>
  ),
};
