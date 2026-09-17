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
  Shop,
} from './sections'

/*
 * Named for what it is rather than who buys it.
 *
 * "Trade" was the working name and it mislabels most of the businesses that
 * will wear this: a barber, a physio and a dentist are not trades. What they
 * share with a plumber is the shape of the decision — can I reach you, are you
 * real, what does it cost, when can you come — and that is what the skin is
 * built around.
 *
 * The plumber-only capabilities (service areas, before-and-after, licence
 * numbers, quote requests) belong in a leads MODULE, not in here. Putting a
 * capability inside a skin is the mistake CLAUDE.md warns about.
 */
export default defineSkin({
  name: 'service',
  label: 'Service',
  description:
    'Local service businesses — a barber, a clinic, a trade. Light, dense, phone first.',
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
    commerce: { shop: Shop },
  },
  chrome: { Header, Footer, Page },
})
