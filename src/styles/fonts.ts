import { Baloo_2, Jost, Pacifico } from 'next/font/google'

/**
 * Display typefaces a site may choose, by name.
 *
 * A NAME rather than a font stack in site.config, because `next/font` has to be
 * called at module scope to be hashed, preloaded and self-hosted — a stack in
 * config would either load nothing or load a font from Google's CDN on every
 * page view, which is a third-party request and a layout shift.
 *
 * The union is the point: `display: 'scrpt'` is a compile error rather than a
 * site that silently falls back to Times.
 *
 * Nothing is loaded for a site that names none. Each entry's `variable` is only
 * attached to <html> when that site asks for it, so the preload goes out for the
 * one face in use and no others.
 */
const pacifico = Pacifico({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-pacifico',
})

/*
 * Rounded and heavy, for signage painted in fat bubble letterforms — a whole
 * category of small-business identity that no system stack can reach. Variable
 * weight, pinned to 800: below that it stops being signage and starts being a
 * friendly UI font.
 */
const baloo = Baloo_2({
  subsets: ['latin'],
  weight: '800',
  display: 'swap',
  variable: '--font-baloo',
})

/*
 * Geometric, near-monoline, wide apertures — a Futura lineage. Loaded at 300
 * because this face is for type that is SET LARGE AND TRACKED OUT, and at that
 * size a regular weight reads as a system font while a light one reads as a
 * decision. There is no system stack that gets close: every default sans is a
 * humanist or a neo-grotesque, and both have stroke modulation that kills the
 * effect the moment you open the letterspacing.
 */
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  variable: '--font-jost',
})

export const DISPLAY_FONTS = {
  /*
   * Monoline, rounded, one continuous stroke — which is what makes it read as a
   * bent glass tube rather than as a wedding invitation. Chosen for a neon
   * fit-out; a formal script with thick-and-thin strokes cannot be neon,
   * because neon has no thicks and thins.
   */
  script: {
    variable: pacifico.variable,
    stack: "var(--font-pacifico), 'Brush Script MT', cursive",
    /*
     * Metrics travel with the face, because a skin's numbers are tuned for the
     * face it shipped with. Every skin sets tight leading and negative tracking
     * on a heading, which is right for a grotesk and wrong for a script: the
     * ascenders and descenders here are long and they loop, so at 1.06 the
     * descenders of one line cut through the line below.
     */
    leading: '1.25',
    tracking: '0',
  },
  bubble: {
    variable: baloo.variable,
    stack: "var(--font-baloo), 'Trebuchet MS', system-ui, sans-serif",
    /* Heavy rounded caps want air between lines and none between letters — the
       counters are already tight and tracking in closes them up. */
    leading: '1.05',
    tracking: '-0.01em',
  },
  geometric: {
    variable: jost.variable,
    stack: "var(--font-jost), 'Futura', 'Century Gothic', system-ui, sans-serif",
    /*
     * POSITIVE tracking, which no other entry here has and which is the whole
     * reason this one exists. Every skin's heading rule assumes a grotesk and
     * pulls letters together; a geometric set that way closes its round
     * counters and turns into a lump. Opened up instead, it is the shape a
     * luxury identity is usually set in.
     */
    leading: '1.14',
    tracking: '0.02em',
  },
} as const

export type DisplayFont = keyof typeof DISPLAY_FONTS
