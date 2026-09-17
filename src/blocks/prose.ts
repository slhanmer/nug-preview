import type { Block } from 'payload'

export const prose: Block = {
  slug: 'prose',
  interfaceName: 'ProseBlock',
  fields: [
    { name: 'body', type: 'richText', required: true, },
  ],
}
