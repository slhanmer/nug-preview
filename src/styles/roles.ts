/*
 * The contrast contract.
 *
 * A role declares what it is FOR, and its required ratio follows from that.
 * A design system that holds every text token to the same bar ends up either
 * uniformly too dark or quietly failing, so the requirement is part of the
 * role's definition rather than a blanket rule applied afterwards.
 *
 * This module is the single source of truth. The Foundations story renders it
 * and the contrast test suite asserts it — they cannot drift, because there is
 * only one list.
 */

/** WCAG 2.2 AA, body text. */
export const AA_BODY = 4.5
/** WCAG 2.2 AA, large text — 18.66px bold or 24px regular and above. */
export const AA_LARGE = 3
/** WCAG 2.2 AA 1.4.11, non-text contrast for UI boundaries and indicators. */
export const AA_NON_TEXT = 3

export const SURFACES = ['ground', 'surface', 'surface-raised', 'surface-recessed'] as const

export type Requirement = {
  fg: string
  bg: string
  requires: number
  why: string
}

type ForegroundRole = {
  token: string
  requires: number
  why: string
}

/**
 * Foreground roles checked against every surface.
 *
 * `text-muted` is deliberately held to the large-text bar. It exists to be
 * quieter than secondary; darkening it to clear 4.5:1 everywhere would collapse
 * the gap between them and remove the reason it exists. The cost is a real
 * constraint — it may not be used for body copy — and that constraint is
 * recorded here rather than left to discipline.
 */
const ON_EVERY_SURFACE: ForegroundRole[] = [
  { token: 'text-primary', requires: AA_BODY, why: 'Body copy and headings.' },
  { token: 'text-secondary', requires: AA_BODY, why: 'Supporting copy. Still body text.' },
  {
    token: 'text-muted',
    requires: AA_LARGE,
    why: 'Large text, captions and non-essential labels. Never body copy.',
  },
  {
    token: 'emphasis',
    requires: AA_BODY,
    why: 'Brand colour used as text — links, emphasised words. Whichever of the two supplied colours suits this ground, unmodified.',
  },
  {
    token: 'edge-control',
    requires: AA_NON_TEXT,
    why: 'Boundary of an interactive control. Often the only thing identifying an input as an input.',
  },
  {
    token: 'focus-ring',
    requires: AA_NON_TEXT,
    why: 'Keyboard focus indicator. Failing this makes the site unusable by keyboard.',
  },
]

/**
 * Pairs that stand alone rather than being checked against every surface.
 */
const STANDALONE: Requirement[] = [
  {
    fg: 'on-fill',
    bg: 'fill',
    requires: AA_BODY,
    why: 'Label on a primary button.',
  },
  {
    fg: 'on-fill-hover',
    bg: 'fill-hover',
    requires: AA_BODY,
    why: 'The label once hovered. Polarity is decided per state — a label fixed to the resting fill goes wrong as the fill moves.',
  },
  {
    fg: 'on-fill-active',
    bg: 'fill-active',
    requires: AA_BODY,
    why: 'The label while pressed.',
  },
  {
    fg: 'on-fill-alt',
    bg: 'fill-alt',
    requires: AA_BODY,
    why: 'Label on the other brand colour, used for secondary fills and badges.',
  },
  {
    fg: 'on-action',
    bg: 'action',
    requires: AA_BODY,
    why: "Label on a call-to-action in the client's third colour. The third is otherwise draw-only; measuring it here is what makes it typeable.",
  },
  {
    fg: 'on-action-hover',
    bg: 'action-hover',
    requires: AA_BODY,
    why: 'The same label once hovered. Decided per state, for the reason given on on-fill-hover.',
  },
  {
    fg: 'on-action-active',
    bg: 'action-active',
    requires: AA_BODY,
    why: 'The same label while pressed.',
  },
]

/**
 * Roles with no contrast requirement, recorded so their absence is a decision
 * rather than an oversight.
 */
export const EXEMPT: { token: string; why: string }[] = [
  { token: 'edge', why: 'Decorative separator. Carries no information on its own.' },
  {
    token: 'edge-strong',
    why:
      'Emphasis separator. WCAG 1.4.11 applies to boundaries required to IDENTIFY a component; ' +
      'a card already distinguished by its surface is not identified by its outline. Holding this ' +
      'to 3:1 would make every card border near-black. Interactive boundaries use edge-control.',
  },
  {
    token: 'swatch-brand',
    why: 'The primary exactly as supplied, for logo areas and decorative fills where contrast is not at stake.',
  },
  {
    token: 'swatch-accent',
    why: 'The secondary exactly as supplied, same purpose.',
  },
]

export function contrastContract(): Requirement[] {
  const pairs: Requirement[] = []
  for (const bg of SURFACES) {
    for (const role of ON_EVERY_SURFACE) {
      pairs.push({ fg: role.token, bg, requires: role.requires, why: role.why })
    }
  }
  return [...pairs, ...STANDALONE]
}
