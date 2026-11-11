import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { AppBar } from './AppBar';
import { Button } from '../Button/Button';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/AppBar',
  component: AppBar,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { design: figma('5:58') },
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma default: back, empty title, "2 of 7", fill 111/390 */
export const Onboarding: Story = { args: { step: '2 of 7', progress: 2 / 7 } };
export const SubPage: Story = { args: { title: 'Water heater', backTo: '/home' } };
export const WithAction: Story = {
  args: { title: 'Edit home', action: <Button variant="link">Save</Button> },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <AppBar step="2 of 7" progress={2 / 7} />
      <AppBar title="Your home" step="5 of 7" progress={5 / 7} />
      <AppBar title="Water heater" />
      <AppBar title="Edit home" action={<Button variant="link">Save</Button>} />
      <AppBar title="No back" showBack={false} />
    </div>
  ),
};
