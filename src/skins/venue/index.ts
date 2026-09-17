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
  name: 'venue',
  label: 'Venue',
  description: 'Counter service and dining rooms. Photography first, one measure, tight type.',
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
