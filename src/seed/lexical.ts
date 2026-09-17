import type { ProseBlock } from '@/payload-types'

/*
 * Minimal Lexical documents for seeding.
 *
 * Written by hand rather than converted from markdown: the markdown converter
 * needs a live editor config, which a standalone script does not have. Seed
 * copy is a handful of paragraphs, so the tradeoff is worth it — but this is
 * the file to look at first if a seeded richText field renders empty.
 *
 * The return type comes from the generated block type so the literals below
 * narrow correctly. Lexical's `format` and `direction` are unions of string
 * literals, and an unannotated object literal widens both to `string`.
 */
type RichText = ProseBlock['body']

function text(value: string) {
  return {
    type: 'text',
    text: value,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function paragraph(value: string) {
  return {
    type: 'paragraph',
    children: [text(value)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

export function richText(...paragraphs: string[]): RichText {
  return {
    root: {
      type: 'root',
      children: paragraphs.map(paragraph),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
