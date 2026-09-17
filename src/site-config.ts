import type { DisplayFont } from '@/styles/fonts'
import type { SkinName } from '@/skins/registry'

export type NavItem = { label: string; href: string }

/**
 * ONE SHOP OF SEVERAL, under one name.
 *
 * `business` is deliberately singular — one address, one phone, one set of
 * hours — because almost every client is one shop, and nesting all of them one
 * level deeper would be a tax paid by every site to serve none of them.
 *
 * A second shop is not a bigger version of the same site, though. The reader's
 * first question stops being "what is this" and becomes "which one is near me",
 * and that has to be answerable in the footer of every page rather than behind
 * a Locations tab. A two-shop business with a single-address footer is telling
 * half its customers about the wrong one.
 *
 * Set this and the chrome prints every venue; leave it out and nothing changes
 * anywhere. `business.address` and friends stay as the primary venue, so the
 * print stylesheet and every skin that has not been taught about this keep
 * working exactly as before.
 */
export type Venue = {
  /** How they say it — "Stones Corner", not "WAHO Cafe Stones Corner". */
  name: string
  address: string
  phone?: string
  /**
   * Per venue, because two shops sharing one hours block in the footer is the
   * same lie as two shops sharing one address. Free-form lines, same as
   * `business.hours`.
   */
  hours?: string[]
  /** A maps link, so the address is tappable on the phone it is read on. */
  mapUrl?: string
  /** This venue's own page, when it has one. */
  href?: string
}

/**
 * Which ground is live.
 *
 * `system` follows the device, which is right for most sites and wrong for a
 * demo — the same page reads dark on our laptop and light on the client's. A
 * brand that is one thing pins it.
 */
export type ThemeMode = 'system' | 'light' | 'dark'

/**
 * The shape dials.
 *
 * Same idea as the colour ladder: a few inputs, everything else derived. This
 * is what makes a variant a variant — "service, but denser" is `density: 0.85`
 * rather than a second copy of the skin.
 */
export type SiteStyle = {
  /**
   * The display face, by name from DISPLAY_FONTS. Headings and the logotype;
   * body copy is never this.
   *
   * Unset means the skin's own stack, which is a system-font pairing — right
   * for most of these and wrong for a business whose identity IS its signage.
   */
  display?: DisplayFont
  /** Body size the whole type scale grows from. Default clamps around 1rem. */
  typeBase?: string
  /** How fast it grows. 1.125 tight, 1.25 default, 1.333 dramatic. */
  typeRatio?: number
  /** Multiplies every space step and nothing else. 0.85 brisk, 1.15 unhurried. */
  density?: number
  /** 0 for square. */
  radius?: string
}

export type SiteConfig = {
  /**
   * Who this site is, in one slug.
   *
   * Scopes rows in the database. One Postgres holds every mock at once, so a
   * new demo cannot overwrite the last one and ten of them can be live
   * together. A real client build has its own database and its own repo, where
   * this is just a label.
   */
  key: string
  skin: SkinName
  modules: string[]
  brand: {
    primary: string
    secondary: string
    third?: string
    /**
     * The page ground, stated rather than derived. Overrides `groundTint` and
     * `groundNudge` for the theme in force — light unless `theme` is 'dark'.
     *
     * The derivation exists because most clients want a hint of their brand
     * behind the content, and it deliberately squeezes chroma hard: a light
     * ground caps at 0.04 and a dark one at 0.05, so a page can never
     * accidentally become a wall of the brand colour. That cap is right for
     * almost every site and wrong for the ones whose GROUND IS A BRAND COLOUR
     * — the shop painted that colour, the identity built on it. #fad0e8 needs
     * 0.056 and simply cannot be reached from the dials.
     *
     * Set this and you are taking the ground off the ladder. Everything ELSE
     * still derives from it and the contract still measures against it, so the
     * failure mode is a build error rather than an unreadable page — but add
     * the palette to the contrast suite when you use this, because the usual
     * guarantee that the ground is nearly neutral no longer holds.
     */
    ground?: string
    groundTint: number
    groundNudge: number
    /** Defaults to 'system'. */
    theme?: ThemeMode
  }
  style?: SiteStyle
  business: {
    name: string
    /**
     * What the business IS, in one or two words: `Barbershop`, `Picture
     * framing`, `Italian dining`.
     *
     * For the header lockup when `logo` is set. A wordmark says the name and
     * nothing else, so repeating the name beside it reads as a stutter —
     * "CHOP/SPOT The Chop Spot Barbershop" — while the one fact a stranger
     * actually needs is missing. This supplies that fact instead. Without a
     * logo the chrome falls back to `name` and this is unused.
     */
    descriptor?: string
    tagline?: string
    /**
     * The sentence Google prints under the link. Falls back to `tagline`.
     *
     * Separate from tagline because they are written for different readers: a
     * tagline is for someone already on the page, a description is for someone
     * deciding whether to click. 150-160 characters, and it should say what the
     * business is and where, because half the people reading it are searching
     * for a category rather than a name.
     */
    description?: string
    address?: string
    phone?: string
    email?: string
    /**
     * Opening hours, one line per row, already written the way they say them:
     * `['Mon – Sat  9am – 7pm', 'Sun  10am – 6pm']`.
     *
     * Lines rather than days-and-times, because the shape real businesses use
     * does not fit a week of open/close pairs — "seven days, 7 till 1", "closed
     * Tuesdays", "kitchen till 9, bar till late", "public holidays: see
     * Instagram". A structured version can be derived later for schema.org
     * markup; a structured version imposed now means every second site fights
     * the type.
     *
     * Here rather than in content because it is the most-searched fact a local
     * business has, it belongs in the footer of every page, and typing it into
     * page content twice per site is how it ends up disagreeing with itself.
     */
    hours?: string[]
    /**
     * Every shop, when there is more than one. See the Venue type above.
     *
     * `address`, `phone` and `hours` above stay set to the primary venue — this
     * is additive, never a replacement, so nothing that reads them has to know
     * this field exists.
     */
    venues?: Venue[]
    /** Path under public/, which is client-owned. Used by chrome and by print. */
    logo?: string
    /*
     * IANA zone. The server runs UTC; a venue does not. Anything that means
     * "today" to staff — the day's print omissions, later opening hours — has
     * to be computed here or it rolls over mid-service.
     */
    timezone?: string
  }
  /*
   * Nav lives in code, not the CMS — ADR 0003. Only we create pages, so every
   * target is known at build time and there is nothing for a client to break.
   */
  nav?: NavItem[]
  /** The single action the chrome puts in front of everyone. */
  cta?: NavItem
  /**
   * A speculative demo built for a business that has not agreed to anything.
   *
   * Puts `noindex, nofollow` on every page. Two reasons, and the second is the
   * one that matters: the photographs are still theirs, and a demo of someone's
   * business outranking their own site for their own name is a bad way to
   * introduce yourself.
   *
   * Turn it off the day they sign, not before.
   */
  demo?: boolean
}
