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
    /*
     * SAMPLED OUT OF THEIR OWN PHOTOGRAPHS, not chosen.
     *
     * The first palette was #e08f58 on #f5f0dc — a muted peach on cream. It
     * was the mildest thing anyone could have taken from that room, and next
     * to their actual photographs the page read as a template with their
     * pictures dropped into it.
     *
     * What is really in the room: a lit ochre wall that measures #bd934d in
     * both the dining shot and the shop window, a black mural squiggle over
     * it, and green — green plates under two of the three dishes, greenery in
     * the window. The ink is that mural black, and it is very slightly GREEN
     * (OKLCH hue 135 at chroma 0.019) rather than neutral, because every
     * photograph on this site is warm and a true black on cream reads as a
     * hole punched in the page.
     *
     * The ochre is `secondary` and it has to be. On this ground it measures
     * 2.45:1 as type — it cannot be a letter at any size. On a light ground
     * the ladder selects the darker of the two as `--fill`, so the ink takes
     * the headings at 13.8:1 and the ochre lands on `--fill-alt`, where it
     * gets whole bands of the page. Its OKLCH lightness is 0.688, above the
     * 0.55 polarity threshold, so its label comes out black at 7.44:1.
     *
     * `third` IS THE OCHRE AGAIN, and this is the case Zmirk could not have.
     * Sending a loud warm colour to `--action` is exactly the move that failed
     * there: `--action-active` drops OKLCH lightness by 0.12, and Zmirk's
     * orange landed at L 0.573 — twenty-three thousandths the wrong side of
     * the 0.55 polarity threshold — so it kept a black label at 4.39:1
     * against a 4.5 bar. This ochre starts at L 0.688, so the same drop lands
     * at 0.568 and measures: 7.44 at rest, 5.91 hovered, 4.62 pressed, all
     * with the black label the threshold picks. Distance from the threshold is
     * the entire difference between the two.
     *
     * Setting it is what puts the colour back. Unset, the ochre only ever
     * appeared on `--fill-alt` bands, the masthead took the ink, and the site
     * came out black and white with a warm tint. Now the masthead is the ink
     * — the venue chrome was changed to take `--fill` rather than `--action`
     * for exactly this — and every button on every page is their wall colour.
     */
    primary: '#1e241b',
    secondary: '#bd934d',
    third: '#bd934d',
    /*
     * ⚠️ STATED, for the reason Zmirk's is stated. #bd934d is OKLCH hue 78.5,
     * and a ground derived from it comes out visibly orange — the page then
     * competes with the bands instead of carrying them. #f2efe6 is hue 91.5 at
     * L 0.952: warm paper rather than tinted ochre, and everything measured
     * against it keeps its margin.
     */
    /*
     * DARK, AND THE YELLOW IS THE REASON. #bd934d measures 2.82:1 on pure
     * white and 2.45:1 on the cream this site used to run — under even the 3.0
     * large-text bar, so their own wall colour could never be a heading on a
     * light page. On this charcoal it measures 6.01:1 and clears the body bar,
     * which means it can be every heading at any size. There is no light
     * ground on which that is true.
     *
     * It also suits the room. The venue skin says in its own header that it is
     * built for somewhere "dark, narrow and slow", every photograph they own
     * is a warm lit interior, and the hero is a window — which is a thing you
     * look through from a dark street into a lit room.
     *
     * #191e17 rather than the ink itself: the ink is `primary` and still has
     * to be usable as a plane against this, and a ground identical to a brand
     * colour leaves that plane invisible.
     */
    ground: '#191e17',
    groundTint: 0.4,
    groundNudge: 0,
    theme: 'dark',
  },
  style: {
    /*
     * Their own wordmark is thin geometric caps tracked wide open — it is
     * etched on the shop window and it is in store.jpg. `geometric` is Jost at
     * 300 with POSITIVE tracking, which is that letterform. The skin's default
     * is a Palatino-lineage serif, which is a different restaurant entirely.
     */
    display: 'geometric',
    /*
     * The hand on the window. Used by the `window` hero and nowhere else — the
     * rest of the site stays geometric, which is what keeps this a signature
     * rather than a theme.
     */
    signage: 'painted',
  },
  business: {
    name: 'NUG.',
    /*
     * The mark already spells the name and says HANDMADE PASTA under it, so
     * the descriptor carries the half of the business the mark cannot mention
     * — which is also the half this whole pitch is about.
     */
    descriptor: 'General store',
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
    /*
     * A DIFFERENT FILE FROM THE SUPPLIED ONE. Their avatar is 150x150 with no
     * alpha: an ivory disc floating on a #e08f58 square, which is the OLD
     * palette. On any bar that is not that exact peach it showed its own
     * square, and that pale block in the header was it.
     *
     * This is the same artwork with the square masked away on an antialiased
     * circle and cropped to the disc, so the mark fills its box instead of
     * floating in one — 116px of disc rather than 150px of mostly-square. On
     * the ink masthead it reads as a plate, which for a pasta room is a good
     * accident. Replace it the day somebody sends a real file.
     */
    logo: '/demo-nug-mark.png',
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
   */
  cta: { label: 'Book a table', href: 'https://bookings.nowbookit.com/?accountid=8236eb6d-20b8-404f-9bf2-3173b106a232&venueid=13685&theme=light&colors=hex%2Ce0d4ac' },
  demo: true,
}

export default siteConfig
