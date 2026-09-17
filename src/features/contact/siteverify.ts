/**
 * Server-side verification of a Turnstile token.
 *
 * The widget in the browser proves nothing on its own — a bot posts straight to
 * the action and never loads the script. The token only means anything once
 * Cloudflare has been asked about it, which is what this does.
 *
 * No SDK: it is one POST. A dependency here would be a supply-chain surface and
 * a version to keep current, for a function that fits on a screen.
 *
 * NAMED for Cloudflare's endpoint rather than for the product, because
 * `turnstile.ts` beside `Turnstile.tsx` is two module specifiers differing only
 * in case. TypeScript refuses that outright, and it would have been a broken
 * build on any case-insensitive filesystem — which is Windows and macOS both.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Cloudflare is a hard dependency of every submission, so it gets a short
 * leash. A hung request must fail the submit quickly enough that the person
 * still sees an error rather than a spinner they give up on.
 */
const TIMEOUT_MS = 5000

export type TurnstileResult = { ok: true } | { ok: false; codes: string[] }

type SiteverifyResponse = {
  success?: boolean
  'error-codes'?: string[]
}

export async function verifyTurnstile(
  secret: string,
  token: string,
  ip?: string,
): Promise<TurnstileResult> {
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)

  let response: Response
  try {
    response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    })
  } catch (error) {
    console.error('[contact] Turnstile siteverify did not answer.', error)
    return { ok: false, codes: ['network-error'] }
  }

  if (!response.ok) {
    console.error(`[contact] Turnstile siteverify returned ${response.status}.`)
    return { ok: false, codes: [`http-${response.status}`] }
  }

  const data = (await response.json()) as SiteverifyResponse
  if (data.success) return { ok: true }

  return { ok: false, codes: data['error-codes'] ?? ['unknown'] }
}
