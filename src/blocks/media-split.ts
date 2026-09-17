import type { Block } from 'payload'

export const mediaSplit: Block = {
  slug: 'mediaSplit',
  interfaceName: 'MediaSplitBlock',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'richText', required: true },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    // A hint, not a layout instruction. A skin that stacks on mobile or always
    // leads with the image is free to ignore it — content stays portable.
    {
      name: 'side',
      type: 'select',
      required: true,
      defaultValue: 'left',
      options: [
        { label: 'Image left', value: 'left' },
        { label: 'Image right', value: 'right' },
      ],
    },
  ],
}
