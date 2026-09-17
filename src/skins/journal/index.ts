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
  name: 'journal',
  label: 'Journal',
  description:
    'Owner-voiced and type-led. A masthead rather than a navbar, words before photographs, and an asymmetric column that runs off the page.',
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
