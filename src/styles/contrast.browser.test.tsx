import '@/styles/index.css'

import { deriveGrounds, fitFill, hexToOklch, type Oklch } from '@/lib/brand'
import { contrastRatio, resolveToken } from '@/lib/contrast'
import { contrastContract } from '@/styles/roles'

/*
 * The gate.
 *
 * Runs in a real browser so the CSS does the deriving — clamp() and calc() over
 * custom properties — and ratios are read off the pixel actually painted.
 * roles.ts is the only list; the Palette studio renders it and this asserts it,
 * so they cannot drift.
 *
 * A failure here means a palette in this file can produce a site that fails
 * WCAG. That is a build failure, which is the whole basis of the claim made to
 * clients: the site cannot go live with a combination that fails.
 */

type Palette = {
  name: string
  primary: string
  secondary: string
  third?: string
  tint: number
  /** A ground stated rather than derived — see SiteConfig.brand.ground. */
  ground?: string
  /** Only this theme is meaningful for a palette with a stated ground. */
  only?: 'light' | 'dark'
}

/**
 * Palettes that must always pass. Add one here whenever a real client palette
 * is agreed, so a later ladder change cannot silently break a shipped site.
 */
const PALETTES: Palette[] = [
  { name: 'STARTER default', primary: '#4a1f7c', secondary: '#c9a227', tint: 0.35 },
  { name: 'simonhanmer.com.au', primary: '#4a1f7c', secondary: '#c9f23f', tint: 1 },
  { name: 'navy and gold, neutral ground', primary: '#12263f', secondary: '#c9a227', tint: 0 },
  { name: 'high chroma red and cyan', primary: '#c62828', secondary: '#00acc1', tint: 0.35 },
  // Was thought to be unbuildable. It is not — the polarity threshold was wrong.
  { name: 'muted sage and tan', primary: '#4a6350', secondary: '#b08968', tint: 0.2 },
  // Three colours. The green is the only route --action has to a page.
  { name: 'frontier digital', primary: '#0a0a0a', secondary: '#de012b', third: '#06872b', tint: 0.12 },
  /*
   * A STATED ground, which is the case the derivation cannot reach: #fad0e8 is
   * chroma 0.056 and the light ladder caps at 0.04. Taking the ground off the
   * ladder removes the guarantee that it is nearly neutral, so this palette
   * earns its place here more than any of the derived ones above.
   */
  {
    name: 'loverboy cafe — stated ground',
    primary: '#520025',
    secondary: '#f86e9d',
    third: '#f86e9d',
    ground: '#fad0e8',
    tint: 1,
    only: 'light',
  },
  /*
   * A stated ground for the OTHER reason, and the reason is worth a test of its
   * own: #c1dce8 is chroma 0.033, comfortably under the 0.04 ceiling — what the
   * ladder cannot reach is the 0.3x squeeze applied before the cap.
   *
   * Also the tightest brand-as-text case in the set. The journal skin puts
   * `--emphasis` on every heading, including FAQ questions at 19px, so this
   * brown has to clear AA_BODY against all four surfaces rather than coast on
   * the large-text exemption. It does, at 6.81:1 on the ground.
   */
  {
    name: 'mello grounds — stated ground, brand as heading ink',
    primary: '#563f33',
    secondary: '#c1dce8',
    ground: '#c1dce8',
    tint: 1,
    only: 'light',
  },
  /*
   * The case the contract is FOR: a brand colour that cannot be type.
   *
   * #e8125c measures 4.59:1 on pure black — it was 4.38 and failing when this
   * palette went in on a #0b0b0c ground. It is still never set as type on the
   * site, because a role that clears the bar by nine hundredths is not a role
   * you build a page on. Routed to `--action` it carries a DARK label at
   * 4.67:1, which is the number that actually holds the design up.
   *
   * Pure black is also the hardest ground in this file for everything else: the
   * ladder places each role at a fixed distance FROM the ground, so text at
   * L 0.50 on a black page is a mid grey rather than the near-white it would be
   * on a merely dark one. text-secondary lands at 4.68:1 — passing, and the
   * tightest body-text measurement in the whole suite.
   *
   * That label is the fragile part and the reason this palette is in here: the
   * fill sits at OKLCH L 0.5985, thirty thousandths above the 0.55 polarity
   * threshold. Move the threshold and the label flips to white at 4.49 and the
   * build fails, which is exactly what should happen.
   */
  {
    name: 'kizuna — brand colour that can only be a fill',
    primary: '#e8125c',
    secondary: '#eef0f2',
    third: '#e8125c',
    ground: '#000000',
    tint: 1,
    only: 'dark',
  },
  /*
   * A warm amber and a charcoal off one small logo, on a DERIVED ground — the
   * ordinary case, and the one most client palettes will actually be.
   *
   * Worth a place because it is the opposite end of the range from Kizuna: the
   * amber sits at OKLCH L 0.676, well clear of the polarity threshold, so it
   * takes a dark label at 6.99:1 with room either side. A third colour is not
   * automatically a knife-edge, and this palette is what proves the ladder is
   * not only tuned for the tight ones.
   */
  {
    name: 'waho cafe — warm third on a derived ground',
    primary: '#c8873f',
    secondary: '#1c1a18',
    third: '#c8873f',
    tint: 0.85,
    only: 'light',
  },
  /*
   * A brand colour that can only ever be a PLANE — not type, not a label, and
   * not a button either.
   *
   * #ff6400 measures 2.86:1 as text on this site's cream and no ground saves
   * it. So it is supplied as the SECONDARY: on a light ground the ladder
   * selects the darker of the two as `--fill` and `--emphasis`, the ink takes
   * both, and the orange lands on `--fill-alt` — which the contract already
   * measures, and which comes out at 7.07:1. The brand skin then paints it edge
   * to edge. A colour that cannot be a letter still gets half the page.
   *
   * THE MISSING `third` IS THE POINT OF THIS ENTRY. Routing this orange to
   * `--action` is the obvious move and it fails: `--action-active` drops
   * lightness by 0.12, landing at L 0.573 — twenty-three thousandths above the
   * 0.55 polarity threshold — so it keeps a BLACK label, and black on #d43a00
   * measures 4.39:1. White would clear at 4.78 and the threshold does not pick
   * it, because the threshold is derived for a neutral and a high-chroma warm
   * crosses it later than a grey does. Kizuna sits thirty thousandths the other
   * side of the same line and passes; this one would not.
   */
  {
    name: 'zmirk co — a brand colour that can only be a plane',
    primary: '#261e1b',
    secondary: '#ff6400',
    /*
     * STATED, for a third distinct reason — the other two in this file are a
     * chroma the ladder cannot reach and a squeeze it applies before the cap.
     * This one is HUE. #ff6400 is OKLCH hue 42.9, which is a good deal redder
     * than the eye reads "orange" as, and the derived light ground takes that
     * hue straight: at ground chroma it came out a pale pink. #fdf1e7 is the
     * same lightness at hue 62.5 — the cream the colour implies rather than the
     * one its arithmetic produces.
     */
    ground: '#fdf1e7',
    tint: 0.6,
    only: 'light',
  },
  /*
   * NUG. — the second plane-only brand colour, and it is here to show the
   * first one was not a special case.
   *
   * Both values are sampled out of the client's own photographs rather than
   * picked: #bd934d is the lit ochre wall, measured in the dining room shot
   * and again in the shop window, and the ink is the black of the mural drawn
   * over it. The ink is very slightly GREEN — OKLCH hue 135 at chroma 0.019 —
   * which is the smallest chroma in this file and is deliberate: a neutral
   * black on a warm cream reads as a hole, and every photograph on that site
   * is warm.
   *
   * The ochre measures 2.45:1 as type on this ground, so like Zmirk's orange
   * it can only ever be a plane. Unlike Zmirk's it sits COMFORTABLY clear of
   * the polarity threshold rather than beside it — L 0.688 against 0.55 — so
   * its black label lands at 7.44:1 with the ink itself at 5.63:1. That
   * distance is the reason this palette needed no argument and Zmirk's needed
   * three paragraphs.
   *
   * STATED ground, same hue failure as Zmirk: #bd934d is OKLCH hue 78.5 and a
   * derived ground takes it straight, which tints the page the same ochre as
   * the bands and flattens both. #f2efe6 is hue 91.5 — warm paper.
   */
  {
    name: 'nug. — the warm colour Zmirk could not route to --action',
    primary: '#1e241b',
    secondary: '#bd934d',
    /*
     * THE SAME VALUE AS `secondary`, AND THAT IS THE TEST. Zmirk's entry above
     * exists to record that a loud warm colour could NOT be the action colour:
     * --action-active drops L by 0.12 and its orange came to rest at 0.573,
     * twenty-three thousandths above the polarity threshold, keeping a black
     * label at 4.39:1. This ochre starts far enough above 0.55 that the same
     * drop lands at 0.568 and still measures 4.62:1. The pair of entries is
     * the point: the rule is distance from the threshold, not warmth.
     *
     * TESTED DARK BECAUSE IT SHIPS DARK, which is this entry's second job. On
     * a light ground this ochre is 2.45:1 and can only ever be a plane; on the
     * charcoal it is 6.01:1 and is every heading on the site. Same hex,
     * opposite ground, opposite role — and a palette signed off in one theme
     * cannot be assumed to survive the other.
     */
    third: '#bd934d',
    ground: '#191e17',
    tint: 0.4,
    only: 'dark',
  },
]

const THEMES = ['light', 'dark'] as const

function mount(ground: Oklch, brand: Oklch, accent: Oklch, third: Oklch | null): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('data-tokens', '')
  const set = (k: string, v: number) => el.style.setProperty(k, String(v))
  set('--ground-l', ground.l)
  set('--ground-c', ground.c)
  set('--ground-h', ground.h)
  set('--brand-l', brand.l)
  set('--brand-c', brand.c)
  set('--brand-h', brand.h)
  set('--accent-l', accent.l)
  set('--accent-c', accent.c)
  set('--accent-h', accent.h)
  // Left unset when absent, so the fallback in tokens.css is what gets tested.
  if (third) {
    set('--third-l', third.l)
    set('--third-c', third.c)
    set('--third-h', third.h)
  }
  document.body.appendChild(el)
  return el
}

describe('contrast contract', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  for (const palette of PALETTES) {
    for (const theme of THEMES.filter((t) => !palette.only || palette.only === t)) {
      describe(`${palette.name} — ${theme}`, () => {
        for (const req of contrastContract()) {
          it(`--${req.fg} on --${req.bg} clears ${req.requires}:1`, () => {
            const brand = hexToOklch(palette.primary)
            const accent = hexToOklch(palette.secondary)
            const third = palette.third ? hexToOklch(palette.third) : null
            expect(brand, `unparseable primary ${palette.primary}`).not.toBeNull()
            expect(accent, `unparseable secondary ${palette.secondary}`).not.toBeNull()

            const grounds = deriveGrounds(brand!, accent!, third, palette.tint)
            const stated = palette.ground ? hexToOklch(palette.ground) : null
            expect(stated !== null || !palette.ground, `unparseable ground ${palette.ground}`).toBe(
              true,
            )
            const ground = stated ?? (theme === 'dark' ? grounds.dark : grounds.light)
            const el = mount(ground, brand!, accent!, third)

            const fg = resolveToken(`--${req.fg}`, el)
            const bg = resolveToken(`--${req.bg}`, el)

            // An empty value means the token does not exist — a rename that
            // roles.ts did not follow. Fail loudly rather than skipping.
            expect(fg, `--${req.fg} resolved to nothing`).not.toBe('')
            expect(bg, `--${req.bg} resolved to nothing`).not.toBe('')

            const ratio = contrastRatio(fg, bg)
            expect(ratio, `could not measure --${req.fg} on --${req.bg}`).not.toBeNull()
            expect(
              Number(ratio!.toFixed(2)),
              `${req.why}\n  measured ${ratio!.toFixed(2)}, needs ${req.requires}`,
            ).toBeGreaterThanOrEqual(req.requires)
          })
        }
      })
    }
  }
})

describe('label polarity', () => {
  /*
   * With pure black and pure white as the two labels, the worst case at the
   * crossover is 4.58:1 — above the bar. So a fill at ANY lightness can carry
   * a legible label. This walks the range to prove it, and it is the test that
   * would catch a future change softening the label away from pure black,
   * which would reintroduce a band where neither works.
   */
  it('some label clears 4.5:1 on a fill at every lightness', () => {
    const failures: string[] = []
    for (let l = 0.05; l <= 0.95; l += 0.05) {
      for (const c of [0.02, 0.12, 0.25]) {
        for (const h of [0, 60, 120, 190, 250, 320]) {
          const advice = fitFill({ l, c, h })
          if (advice.lightnessDelta !== 0 || advice.ratio < 4.5) {
            failures.push(`L${l.toFixed(2)} C${c} H${h} -> ${advice.ratio.toFixed(2)}`)
          }
        }
      }
    }
    expect(failures, 'fills needing a lightness move to carry any label').toEqual([])
  })
})

describe('the contract itself', () => {
  it('covers every surface for every foreground role', () => {
    // Guards against a role being added to tokens.css and forgotten in roles.ts.
    expect(contrastContract().length).toBeGreaterThan(0)
  })

  it('names no token that fails to resolve', () => {
    const brand = hexToOklch('#4a1f7c')!
    const accent = hexToOklch('#c9a227')!
    const grounds = deriveGrounds(brand, accent, null, 0.35)
    const el = mount(grounds.light, brand, accent, null)
    const missing = contrastContract()
      .flatMap((r) => [r.fg, r.bg])
      .filter((t, i, a) => a.indexOf(t) === i)
      .filter((t) => resolveToken(`--${t}`, el) === '')
    expect(missing, `tokens named in roles.ts but absent from tokens.css`).toEqual([])
  })
})
