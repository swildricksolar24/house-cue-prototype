import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { fn } from 'storybook/test';
import { CreditsMeter } from './CreditsMeter';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Quotes/CreditsMeter',
  component: CreditsMeter,
  args: { balance: '180 credits', level: 0.6, onAction: fn() },
  argTypes: {
    plan: { control: 'inline-radio', options: ['member', 'free'] },
    size: { control: 'inline-radio', options: ['full', 'compact'] },
  },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { design: figma('93:376') },
} satisfies Meta<typeof CreditsMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

const column: Story['decorators'] = [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>];

export const MemberFull: Story = { args: { plan: 'member', size: 'full' }, decorators: column };
export const FreeFull: Story = { args: { plan: 'free', size: 'full', level: 0.7 }, decorators: column };
export const MemberCompact: Story = { args: { plan: 'member', size: 'compact' }, decorators: column };
export const FreeCompact: Story = { args: { plan: 'free', size: 'compact' }, decorators: column };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ width: 342 }}>
        <CreditsMeter plan="member" balance="180 credits" level={0.6} onAction={() => {}} />
      </div>
      <div style={{ width: 342 }}>
        <CreditsMeter plan="free" balance="180 credits" level={0.7} onAction={() => {}} />
      </div>
      <CreditsMeter plan="member" size="compact" balance="180 credits" onAction={() => {}} />
      <CreditsMeter plan="free" size="compact" balance="180 credits" />
    </div>
  ),
};
