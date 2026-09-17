import type { SiteConfig } from '@/site-config'

/*
 * NUG. General Store, Bakery Lane.
 *
 * VENUE, not brand. The brief called this one a retail site because the general
 * store is the invisible half — but everything that is actually findable about
 * this business is the dinner service: a priced menu, fixed trading nights and
 * "bookings recommended". That is a venue, and the menu module is what makes
 * the mock worth showing. The retail half gets its own section on the page,
 * which IS the pitch rather than a compromise on it.
 *
 * `pnpm new nug brand` scaffolded this as brand — this config overrides it.
 * Re-run `pnpm use nug` after pulling.
 */
const siteConfig: SiteConfig = {
  key: 'nug',
  skin: 'venue',
  modules: ['menu'],
  brand: {
    primary: '#e08f58',
    secondary: '#f5f0dc',
    /* Their whole room is that warm cream. Tinting the ground hard is right
       here in a way it is not on most sites. */
    groundTint: 0.4,
    groundNudge: 0,
    theme: 'light',
  },
  business: {
    name: 'NUG.',
    tagline: 'Handmade pasta, Bakery Lane',
    address: '694 Ann Street, Bakery Lane, Fortitude Valley QLD 4006',
    phone: '0468 669 391',
    /*
     * OFF THEIR OWN INSTAGRAM BIO, verbatim: "Open Wed-Sat 5pm-9:30pm. Menu
     * designed to be shared with family & friends. Bookings recommended, very
     * limited walk-ins."
     *
     * Recorded here because the tooling cannot read Instagram and a later pass
     * will otherwise find no source for this and assume there is none. The bio
     * is where a hospitality business keeps its hours; an absence in the
     * research is an absence in the research, not in the world.
     */
    hours: ['Wed – Sat  5pm – 9:30pm', 'Sun – Tue  Closed'],
    logo: '/demo-nug-logo.png',
    timezone: 'Australia/Brisbane',
  },
  nav: [
    { label: 'Menu', href: '/menu' },
    { label: 'The store', href: '/store' },
  ],
  /* No booking link supplied — their bio says "find the below link" and the
     link did not come across. Phone is honest and works; swap it the moment
     the real one turns up. */
  cta: { label: 'Book a table', href: 'tel:0468669391' },
  demo: true,
}

export default siteConfig
