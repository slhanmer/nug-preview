import type { Block } from 'payload'

export const cta: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    {
      name: 'primaryCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
    {
      name: 'secondaryCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}
