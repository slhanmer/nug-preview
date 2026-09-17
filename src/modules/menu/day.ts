import siteConfig from '@site-config'

/**
 * The venue's local date, not the server's.
 *
 * Vercel runs UTC. A day computed there rolls over at 10am in Brisbane, which
 * is the middle of service and the worst possible moment for today's omissions
 * to vanish. One venue has one timezone, so it belongs in site.config.
 */
export function venueDate(now: Date = new Date()): string {
  const timeZone = siteConfig.business.timezone ?? 'Australia/Brisbane'
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
