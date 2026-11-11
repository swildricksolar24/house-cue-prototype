import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Upload, type UploadProps } from './Upload';
import { figma } from '../../storybook/figma';

const meta = {
  title: 'Components/Forms/Upload',
  component: Upload,
  argTypes: { state: { control: 'inline-radio', options: ['idle', 'dragging', 'uploading', 'done', 'error'] } },
  decorators: [(Story) => <div style={{ width: 310 }}><Story /></div>],
  parameters: { design: figma('203-978') },
} satisfies Meta<typeof Upload>;

export default meta;
type Story = StoryObj<typeof meta>;

const file = { fileName: 'Water heater warranty.pdf' };

export const Idle: Story = { args: { state: 'idle' }, parameters: { design: figma('203-943') } };
export const Dragging: Story = { args: { state: 'dragging' }, parameters: { design: figma('203-948') } };
export const Uploading: Story = {
  args: { state: 'uploading', ...file, progress: 62, meta: 'Uploading… 62% · 1.4 of 2.3 MB' },
  parameters: { design: figma('203-953') },
};
export const Done: Story = {
  args: { state: 'done', ...file, meta: 'Uploaded · 2.3 MB · Saved to Warranties' },
  parameters: { design: figma('203-962') },
};
export const ErrorState: Story = {
  name: 'Error',
  args: { state: 'error', errorMessage: 'This file is over 25 MB. Try a smaller file or a photo.' },
  parameters: { design: figma('203-970') },
};

export const AllVariants: Story = {
  decorators: [(Story) => <Story />],
  render: () => {
    const all: UploadProps[] = [Idle.args!, Dragging.args!, Uploading.args!, Done.args!, ErrorState.args!];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 310px)', gap: 24 }}>
        {all.map((props, i) => (
          <Upload key={i} {...props} />
        ))}
      </div>
    );
  },
};

/** Drop or browse a file to see Dragging → Uploading → Done (simulated) */
export const Interactive: Story = {
  render: () => {
    const [name, setName] = useState<string>();
    const [progress, setProgress] = useState(0);
    useEffect(() => {
      if (!name || progress >= 100) return;
      const t = setTimeout(() => setProgress((p) => Math.min(100, p + 12)), 200);
      return () => clearTimeout(t);
    }, [name, progress]);
    const state = !name ? 'idle' : progress < 100 ? 'uploading' : 'done';
    return (
      <Upload
        state={state}
        fileName={name}
        progress={progress}
        onFiles={(files) => {
          setName(files[0].name);
          setProgress(0);
        }}
        onCancel={() => setName(undefined)}
        onReplace={() => setName(undefined)}
      />
    );
  },
};
