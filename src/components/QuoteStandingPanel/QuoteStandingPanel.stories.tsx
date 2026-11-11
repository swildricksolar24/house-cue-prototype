import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { QuoteStandingPanel, type QuoteStandingPanelProps } from './QuoteStandingPanel';
import { figma } from '../../storybook/figma';

const engagement = [
  { label: 'Last viewed your quote', value: 'Today, 9:42 AM' },
  { label: 'Views', value: '3 (average 2.4 across quotes)' },
  { label: 'Messages and questions', value: '2 exchanged' },
  { label: 'Estimate visit', value: 'Not requested' },
];
const reviseNote = 'Revise as often as you like while the window is open. The homeowner is notified of each change.';

const examples: Record<string, Omit<QuoteStandingPanelProps, 'onRevise' | 'onUpgrade'>> = {
  standing: {
    state: 'standing',
    summary: "Compared with 4 other quotes · updates live · other pros' names and exact figures stay private",
    metrics: [
      { label: 'Price', value: '15% above the median' },
      { label: 'Start date', value: '2 days after the earliest' },
      { label: 'Completion', value: 'Same day as the earliest' },
      { label: 'Warranty', value: '1 of 4 offer longer · best is 2 years' },
      { label: 'Parts in stock', value: '3 of 4 others have the part' },
      { label: 'Rank (customer values quality)', value: '#3 of 5' },
    ],
    engagementTier: 'In the mix',
    engagement,
    footnote: reviseNote,
  },
  belowFloor: {
    state: 'below-floor',
    summary: 'Standing appears once 3 other pros have quoted. 1 other quote so far.',
    engagementTier: 'In the mix',
    engagement,
    footnote: reviseNote,
  },
  locked: {
    state: 'locked',
    metrics: ['Price', 'Start date', 'Warranty', 'Rank', 'Homeowner engagement'].map((label) => ({ label, value: '' })),
    upsellTitle: 'Pro vendors see how they rank',
    upsellBody: 'See your price against the median, dates, warranty and rank, and how engaged the homeowner is. Updated live.',
    upsellFinePrint: '$25/month · 2.5% fee on completed jobs · 3-month minimum',
  },
  finalLost: {
    state: 'final-lost',
    summary: 'Lost: 12.4% above winner; customer prefers price',
    metrics: [
      { label: 'Final rank', value: '#2 of 5' },
      { label: 'Price vs winner', value: '12.4% higher' },
      { label: 'Start date', value: '1 day after the winner' },
      { label: 'Warranty', value: 'Same as the winner' },
      { label: 'Deciding factor', value: 'Price' },
    ],
    engagement: [
      { label: 'Homeowner views of your quote', value: '4' },
      { label: 'Messages and questions', value: '3 exchanged' },
    ],
    footnote:
      "The winning pro is not named. Price vs the winner is exact, not rounded. The deciding factor is the part of the homeowner's ranking that made the biggest difference.",
  },
  finalWon: {
    state: 'final-won',
    summary: 'Won: best warranty; customer prefers quality',
    metrics: [
      { label: 'Final rank', value: '#1 of 5' },
      { label: 'Price vs runner-up', value: '3.8% higher' },
      { label: 'Start date', value: 'Same as the runner-up' },
      { label: 'Warranty', value: '2 years longer than the runner-up' },
      { label: 'Deciding factor', value: 'Warranty' },
    ],
    engagement: [
      { label: 'Homeowner views of your quote', value: '9' },
      { label: 'Messages and questions', value: '5 exchanged' },
    ],
    footnote:
      "The runner-up is not named. Price vs the runner-up is exact, not rounded. The deciding factor is the part of the homeowner's ranking that made the biggest difference.",
  },
};

const meta = {
  title: 'Components/Quotes/QuoteStandingPanel',
  component: QuoteStandingPanel,
  args: { state: 'standing', onRevise: fn(), onUpgrade: fn() },
  argTypes: { state: { control: 'select', options: ['standing', 'below-floor', 'locked', 'final-lost', 'final-won'] } },
  parameters: { design: figma('191:936') },
} satisfies Meta<typeof QuoteStandingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const column: Story['decorators'] = [(Story) => <div style={{ maxWidth: 342 }}><Story /></div>];

export const Standing: Story = { args: examples.standing, decorators: column };
export const BelowFloor: Story = { args: examples.belowFloor, decorators: column };
export const Locked: Story = { args: examples.locked, decorators: column };
export const FinalLost: Story = { args: examples.finalLost, decorators: column };
export const FinalWon: Story = { args: examples.finalWon, decorators: column };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 342px)', gap: 16, alignItems: 'start' }}>
      {Object.entries(examples).map(([key, props]) => (
        <QuoteStandingPanel key={key} {...props} />
      ))}
    </div>
  ),
};
