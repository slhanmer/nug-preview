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

export default defineSkin({
  name: 'noir',
  label: 'Noir',
  description:
    'For a dim room sold on how it looks. Near-black ground, a generated wall texture, photographs masked so they dissolve into the page, and one saturated colour spent once per screen.',
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
