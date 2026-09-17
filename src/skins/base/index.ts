import { defineSkin } from '@/skins/types'

import { Footer, Header, Page } from './chrome'
import {
  Contact,
  Cta,
  Faq,
  FeatureGrid,
  Gallery,
  Hero,
  LogoStrip,
  MediaSplit,
  Prose,
  Quote,
} from './sections'

/**
 * The reference skin. Plain by design — it exists to prove the seam and to be
 * the baseline other skins are compared against, not to be shipped to a client.
 */
export default defineSkin({
  name: 'base',
  label: 'Base',
  description: 'Reference implementation. Every core block, no opinions.',
  core: {
    hero: Hero,
    prose: Prose,
    featureGrid: FeatureGrid,
    mediaSplit: MediaSplit,
    gallery: Gallery,
    quote: Quote,
    logoStrip: LogoStrip,
    cta: Cta,
    faq: Faq,
    contact: Contact,
  },
  chrome: { Header, Footer, Page },
})
