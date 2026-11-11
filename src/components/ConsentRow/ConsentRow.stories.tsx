import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConsentRow } from './ConsentRow';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Consent Row',
  component: ConsentRow,
  args: { children: 'I agree to the Terms of Service', linkHref: '#terms' },
  decorators: [(Story) => <div style={{ width: 342 }}><Story /></div>],
  parameters: { design: figma('6-81') },
} satisfies Meta<typeof ConsentRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Required: Story = { args: { defaultChecked: true } };
export const Optional: Story = { args: { required: false, children: 'Send me tips and offers by email' } };
export const ErrorState: Story = { name: 'Error', args: { error: 'Agree to the Terms of Service to continue.' } };

export const AllVariants: Story = {
  render: () => (
    <div>
      <ConsentRow defaultChecked linkHref="#terms">I agree to the Terms of Service</ConsentRow>
      <ConsentRow linkHref="#privacy">I have read the Privacy Policy and agree to how HouseCue uses my data</ConsentRow>
      <ConsentRow required={false} linkHref="#marketing">Send me tips and offers by email</ConsentRow>
      <ConsentRow error="Agree to the Terms of Service to continue." linkHref="#terms">I agree to the Terms of Service</ConsentRow>
      <ConsentRow disabled defaultChecked linkHref="#terms">I agree to the Terms of Service</ConsentRow>
    </div>
  ),
};
