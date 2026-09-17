import type { Block } from 'payload'

export const quote: Block = {
  slug: 'quote',
  interfaceName: 'QuoteBlock',
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'attribution', type: 'text' },
    { name: 'role', type: 'text' },
  ],
}
