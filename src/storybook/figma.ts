/** Figma file "Claude — House Cue" */
export const FIGMA_FILE = 'https://www.figma.com/design/6kMDFUNggxvrwZN0ccl7FG/Claude--House-Cue';

/** `design` parameter for @storybook/addon-designs, from a node id like "176-2811" or "176:2811" */
export function figma(nodeId: string) {
  return { type: 'figma', url: `${FIGMA_FILE}?node-id=${nodeId.replace(':', '-')}` };
}
