import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { WebTopBar } from './WebTopBar';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/WebTopBar',
  component: WebTopBar,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  argTypes: {
    type: { control: 'inline-radio', options: ['onboarding', 'marketing'] },
  },
  parameters: { design: figma('5:214'), layout: 'fullscreen' },
} satisfies Meta<typeof WebTopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Onboarding: Story = { args: { type: 'onboarding' }, parameters: { design: figma('5:189') } };
export const Marketing: Story = { args: { type: 'marketing' }, parameters: { design: figma('5:199') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <WebTopBar type="onboarding" />
      <WebTopBar type="marketing" />
    </div>
  ),
};
