import config from '@payload-config'
import { getPayload } from 'payload'

import { fromMinorUnits } from '@/modules/commerce/money'
import { orderExists, recordOrder } from '@/modules/commerce/store'
import { verifyWebhook } from '@/modules/commerce/stripe'

/*
 * Outside the (payload) and (frontend) route groups on purpose: (payload) owns
 * a catch-all at /api/[...slug] and would swallow anything put under /api.
 */
export const dynamic = 'force-dynamic'

type Session = {
  id: string
  amount_total?: number
  currency?: string
  customer_details?: { email?: string | null; name?: string | null }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error(
      '[commerce] NOT CONFIGURED — missing STRIPE_WEBHOOK_SECRET. Orders are not being recorded.',
    )
    // 200, deliberately: a 500 makes Stripe retry for days over something no
    // retry can fix. The log is the alarm.
    return new Response('not configured', { status: 200 })
  }

  /*
   * The RAW body. Parsing first changes the bytes and nothing ever verifies —
   * which is the single most common way this endpoint ends up accepting
   * anything at all.
   */
  const raw = await request.text()

  if (!verifyWebhook(raw, request.headers.get('stripe-signature'), secret)) {
    console.warn('[commerce] Rejected a webhook with a bad or stale signature.')
    return new Response('bad signature', { status: 400 })
  }

  const event = JSON.parse(raw) as { type: string; data: { object: Session } }
  if (event.type !== 'checkout.session.completed') return new Response('ignored', { status: 200 })

  const session = event.data.object
  const payload = await getPayload({ config })

  /*
   * Stripe retries until it gets a 2xx, so the same session arrives more than
   * once as a matter of course. This is what turns a retry into a no-op.
   */
  if (await orderExists(payload, session.id)) {
    return new Response('already recorded', { status: 200 })
  }

  await recordOrder(payload, {
    reference: session.id.slice(-12).toUpperCase(),
    email: session.customer_details?.email ?? undefined,
    customerName: session.customer_details?.name ?? undefined,
    total: fromMinorUnits(session.amount_total ?? 0),
    currency: (session.currency ?? 'aud').toUpperCase(),
    stripeSessionId: session.id,
  })

  return new Response('recorded', { status: 200 })
}
