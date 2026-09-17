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
  Menu,
  Prose,
  Quote,
} from './sections'

/*
 * Commerce is a MODULE, not part of this skin.
 *
 * The backlog puts the brand skin and commerce stage 1 in one epic, which reads
 * as though a product brand needs a checkout to exist. It does not: this is
 * chrome and ten renderers, exactly the size of the other two, and a roaster
 * with no online shop wears it fine.
 */
export default defineSkin({
  name: 'brand',
  label: 'Brand',
  description: 'Product and lifestyle brands. Colour blocked, centred, large type.',
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
  modules: {
    menu: { menu: Menu },
  },
  chrome: { Header, Footer, Page },
})
