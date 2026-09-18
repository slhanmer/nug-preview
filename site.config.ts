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
    timezone: 'Australia/Brisbane',
  },
  nav: [
    { label: 'Menu', href: '/menu' },
    { label: 'The store', href: '/store' },
  ],
  /*
   * THE BOOKING LINK IS REAL AND IT IS NOW BOOK IT. An earlier pass could not
   * follow their bio link and fell back to the phone number, which on a laptop
   * is a dead control — the one thing a mock cannot have.
   *
   * Tracking parameters stripped: utm_source, utm_medium, utm_content and an
   * fbclid. Those belong to whoever clicked their bio, not to this site.
   *
   * ⚠️ NO `logo`. Theirs is a 150x150 Instagram avatar with no alpha channel
   * and a cream tile baked in, so on the orange bar it showed as a pale square
   * and the letters inside it were roughly forty pixels wide. There is no
   * header height that rescues that. Their wordmark is plain caps — the same
   * letterforms etched on their own window — so the name is set as TYPE in the
   * display face instead: sharp at any size, and legible. Put a logo back the
   * day somebody sends a real file.
   */
  cta: { label: 'Book a table', href: 'https://bookings.nowbookit.com/?accountid=8236eb6d-20b8-404f-9bf2-3173b106a232&venueid=13685&theme=light&colors=hex%2Ce0d4ac' },
  demo: true,
}

export default siteConfig
