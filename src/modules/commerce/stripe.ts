import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Stripe over `fetch`, no SDK.
 *
 * Same argument as `lib/email.ts` and the Turnstile call: this is two HTTP
 * requests and one HMAC. The SDK is a dependency to track, a supply-chain
 * surface, and 40-odd transitive packages in a template that gets handed to
 * clients — for code that fits on a screen.
 *
 * THE KEY IS THE CLIENT'S. One repo and one deployment per client means their
 * secret key sits in their own Vercel project and they process their own
 * payments. No Connect, no platform, nothing routed through us. A mock runs on
 * our test key and the only difference between the two is an env var.
 */

const API = 'https://api.stripe.com/v1'
const TIMEOUT_MS = 10000

export type CheckoutLine = {
  name: string
  description?: string
  /** Dollars. Converted here. */
  unitAmount: number
  quantity: number
}

export type CheckoutRequest = {
  secretKey: string
  currency: string
  lines: CheckoutLine[]
  successUrl: string
  cancelUrl: string
}

/*
 * Stripe's API is form-encoded with bracketed paths for nesting, not JSON.
 * Building that by hand is the one genuinely fiddly part of skipping the SDK,
 * so it lives in one function rather than at each call site.
 */
function form(params: Record<string, string | number>): URLSearchParams {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) body.set(key, String(value))
  return body
}

export async function createCheckoutSession(request: CheckoutRequest): Promise<{ url: string }> {
  const { secretKey, currency, lines, successUrl, cancelUrl } = request

  const params: Record<string, string | number> = {
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  }

  lines.forEach((line, i) => {
    params[`line_items[${i}][quantity]`] = line.quantity
    params[`line_items[${i}][price_data][currency]`] = currency
    params[`line_items[${i}][price_data][unit_amount]`] = Math.round(line.unitAmount * 100)
    params[`line_items[${i}][price_data][product_data][name]`] = line.name
    if (line.description) {
      params[`line_items[${i}][price_data][product_data][description]`] = line.description
    }
  })

  const response = await fetch(`${API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secretKey}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: form(params),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Stripe refused the checkout session (${response.status}). ${detail}`.trim())
  }

  const session = (await response.json()) as { url?: string }
  if (!session.url) throw new Error('Stripe returned a session with no URL.')
  return { url: session.url }
}

/**
 * Verifies a webhook actually came from Stripe.
 *
 * Without this the endpoint is an open door that writes rows claiming money
 * arrived. The signature is an HMAC over `timestamp.body` using the webhook
 * secret, and the RAW body matters — parse it first and the bytes change and
 * nothing ever verifies.
 *
 * The timestamp check is not decoration: it is what stops a valid old request
 * being replayed forever.
 */
export function verifyWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300,
): boolean {
  if (!signatureHeader) return false

  const parts = new Map(
    signatureHeader.split(',').map((pair) => {
      const [key, value] = pair.split('=')
      return [key?.trim() ?? '', value?.trim() ?? '']
    }),
  )

  const timestamp = parts.get('t')
  const signature = parts.get('v1')
  if (!timestamp || !signature) return false

  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (!Number.isFinite(age) || age > toleranceSeconds) return false

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(signature, 'utf8')
  // Length check first: timingSafeEqual throws on a mismatch rather than returning false.
  return a.length === b.length && timingSafeEqual(a, b)
}
