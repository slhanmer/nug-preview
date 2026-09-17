import type { Block } from 'payload'

import { contact } from './contact'
import { cta } from './cta'
import { faq } from './faq'
import { featureGrid } from './feature-grid'
import { gallery } from './gallery'
import { hero } from './hero'
import { logoStrip } from './logo-strip'
import { mediaSplit } from './media-split'
import { prose } from './prose'
import { quote } from './quote'

/**
 * Block schemas are template-owned and defined once. Skins supply renderers,
 * never schemas — two skins defining `hero` differently would stop content
 * being portable between them, which kills re-skinning and the three-skin test.
 */
export const BLOCK_SCHEMAS: Record<string, Block> = {
  hero,
  prose,
  featureGrid,
  mediaSplit,
  gallery,
  quote,
  logoStrip,
  cta,
  faq,
  contact,
}

export function hasSchema(name: string): boolean {
  return name in BLOCK_SCHEMAS
}
