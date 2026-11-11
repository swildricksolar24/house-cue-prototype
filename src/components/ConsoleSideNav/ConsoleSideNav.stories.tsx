import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { ConsoleSideNav, consoleNavItems, type ConsoleType } from './ConsoleSideNav';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Navigation/ConsoleSideNav',
  component: ConsoleSideNav,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  argTypes: {
    console: { control: 'inline-radio', options: ['support', 'admin'] },
  },
  parameters: { design: figma('41:589'), layout: 'fullscreen' },
} satisfies Meta<typeof ConsoleSideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Side navs fill their parent's height; Figma frames are 900 tall. */
const frame: Story['decorators'] = [(Story) => <div style={{ height: 900 }}><Story /></div>];

export const Support: Story = { args: { console: 'support', active: 'queue' }, decorators: frame, parameters: { design: figma('41:496') } };
export const Admin: Story = { args: { console: 'admin', active: 'platform' }, decorators: frame, parameters: { design: figma('41:545') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
      {(Object.keys(consoleNavItems) as ConsoleType[]).flatMap((c) =>
        consoleNavItems[c].map((item) => (
          <div key={`${c}-${item.key}`} style={{ height: 900 }}>
            <ConsoleSideNav console={c} active={item.key as never} />
          </div>
        )),
      )}
    </div>
  ),
};
