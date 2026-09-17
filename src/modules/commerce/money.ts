/**
 * Money, in the two shapes it has to exist in.
 *
 * Products are priced in dollars because that is what a person types. Stripe
 * wants the smallest currency unit. This is the only place that conversion
 * happens, and it rounds rather than truncates so 24.95 does not become 2494
 * on a machine that stores it as 24.949999999999996.
 */
export function toMinorUnits(dollars: number): number {
  return Math.round(dollars * 100)
}

export function fromMinorUnits(minor: number): number {
  return minor / 100
}

/** Formatted for display. Server and client both call this, so it takes no locale from the environment. */
export function formatMoney(dollars: number, currency = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency.toUpperCase(),
    // Whole dollars stay whole: $25, not $25.00. Cents show when there are any.
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
  }).format(dollars)
}
