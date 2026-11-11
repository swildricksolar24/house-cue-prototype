import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Switch',
  component: Switch,
  args: { 'aria-label': 'Notify me by text' },
  argTypes: { switchPosition: { control: 'inline-radio', options: ['start', 'end'] } },
  parameters: { design: figma('203-928') },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = { args: { defaultChecked: true }, parameters: { design: figma('203-872') } };
export const Off: Story = { parameters: { design: figma('203-876') } };
export const DisabledOff: Story = { name: 'Disabled off', args: { disabled: true }, parameters: { design: figma('203-880') } };
export const DisabledOn: Story = { name: 'Disabled on', args: { disabled: true, defaultChecked: true }, parameters: { design: figma('203-884') } };
export const LabelLeft: Story = {
  name: 'Label left (switch first)',
  args: { label: 'Notify me by text', switchPosition: 'start', defaultChecked: true },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('203-888') },
};
export const LabelRight: Story = {
  name: 'Label right (switch at end)',
  args: { label: 'Notify me by text', switchPosition: 'end', defaultChecked: true },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('203-908') },
};

const states = [
  { checked: true, disabled: false },
  { checked: false, disabled: false },
  { checked: false, disabled: true },
  { checked: true, disabled: true },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', gap: 32 }}>
        {states.map((s, i) => (
          <Switch key={i} aria-label="Notify me by text" defaultChecked={s.checked} disabled={s.disabled} />
        ))}
      </div>
      {(['start', 'end'] as const).map((pos) => (
        <div key={pos} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 342px)', gap: '8px 32px' }}>
          {states.map((s, i) => (
            <Switch key={i} label="Notify me by text" switchPosition={pos} defaultChecked={s.checked} disabled={s.disabled} />
          ))}
        </div>
      ))}
    </div>
  ),
};
