import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, iconNames } from '../components/Icon/Icon';
import { figma } from './figma';

const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded', design: figma('7-74') },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const colorRoles: [string, string][] = [
  ['page', 'Page background'],
  ['card', 'Card / sheet'],
  ['tint', 'Inset / bubble'],
  ['text', 'Text primary'],
  ['text-muted', 'Text secondary'],
  ['border', 'Divider / card stroke'],
  ['border-strong', 'Input outline'],
  ['fill-weak', 'Track / skeleton'],
  ['primary', 'Primary action'],
  ['primary-hover', 'Primary hover'],
  ['on-primary', 'Label on primary'],
  ['accent', 'Accent (Sky)'],
  ['selected', 'Selected background'],
  ['link', 'Link / selected text'],
  ['danger', 'Error text'],
  ['danger-bg', 'Error background'],
  ['success', 'Success text'],
  ['success-bg', 'Success background'],
  ['warning', 'Warning text'],
  ['warning-bg', 'Warning background'],
  ['info', 'Info text'],
  ['info-bg', 'Info background'],
];

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
      {colorRoles.map(([token, label]) => (
        <div key={token} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: `var(--hc-${token})`, border: '1px solid var(--hc-border)' }} />
          <div>
            <p className="hc-medium-semibold">{label}</p>
            <p className="hc-small hc-muted">--hc-{token}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

const typeStyles: [string, string, string][] = [
  ['hc-h1', 'Heading 1 · 40/48 ExtraBold', 'Heading — Web hero only'],
  ['hc-h2', 'Heading 2 · 32/40 ExtraBold', 'Heading — Web page title'],
  ['hc-h3', 'Heading 3 · 24/32 ExtraBold', 'Heading — Mobile screen title'],
  ['hc-h4', 'Heading 4 · 20/28 ExtraBold', 'Heading — Section title'],
  ['hc-large-bold', 'Large/Bold · 16/24', 'Large/Bold — Card title, app bar'],
  ['hc-large', 'Large/Regular · 16/24', 'Large/Regular — Lead paragraph'],
  ['hc-medium-semibold', 'Medium/Semi-Bold · 14/20', 'Medium/Semi-Bold — Labels, links'],
  ['hc-medium', 'Medium/Regular · 14/20', 'Medium/Regular — Body (min. body size)'],
  ['hc-small', 'Small/Regular · 12/18', 'Small/Regular — Helper text, captions'],
];

export const Typography: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {typeStyles.map(([cls, spec, sample]) => (
        <div key={cls}>
          <p className={cls}>{sample}</p>
          <p className="hc-small hc-muted">.{cls} — HouseCue/{spec}</p>
        </div>
      ))}
    </div>
  ),
};

export const Icons: Story = {
  parameters: { design: figma('329-1762') },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
      {iconNames.map((name) => (
        <div key={name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Icon name={name} />
          <span className="hc-small">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="hc-small hc-muted" style={{ width: 120 }}>--hc-space-{n}</span>
          <div style={{ height: 16, width: `var(--hc-space-${n})`, background: 'var(--hc-accent)', borderRadius: 2 }} />
        </div>
      ))}
    </div>
  ),
};
