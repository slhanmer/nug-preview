'use server'

import config from '@payload-config'
import siteConfig from '@site-config'
import { getPayload } from 'payload'

import type { ProductRow } from './shape'
import { findProduct } from './store'
import { createCheckoutSession } from './stripe'
import type { CheckoutState } from './types'

/**
 * Prices are read from the database HERE, never taken from the form.
 *
 * The buy button posts a product id and a quantity and nothing else. A price
 * that arrives from the browser is a price the customer chose, and that is the
 * entire class of bug where somebody buys a $400 clipper set for one cent.
 */
function lineFor(product: ProductRow, quantity: number) {
  return {
    name: product.name,
    description: product.description ?? undefined,
    unitAmount: product.price,
    quantity,
  }
}

export async function startCheckout(
  _previous: CheckoutState,
  form: FormData,
): Promise<CheckoutState> {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!secretKey || !siteUrl) {
    const missing = [secretKey ? '' : 'STRIPE_SECRET_KEY', siteUrl ? '' : 'NEXT_PUBLIC_SITE_URL']
      .filter(Boolean)
      .join(', ')
    console.error(
      `[commerce] NOT CONFIGURED — missing ${missing}. The shop renders but cannot take a payment.`,
    )
    return { status: 'error', message: reachUsInstead() }
  }

  const id = form.get('productId')
  const quantity = Math.min(Math.max(Number(form.get('quantity') ?? 1) || 1, 1), 20)
  if (typeof id !== 'string' || !id) return { status: 'error', message: 'Pick something first.' }

  const payload = await getPayload({ config })
  const product = await findProduct(payload, id)

  if (!product) return { status: 'error', message: 'That item is no longer listed.' }
  if (!product.available) return { status: 'error', message: 'That one has sold out.' }

  let url: string
  try {
    const session = await createCheckoutSession({
      secretKey,
      currency: process.env.STRIPE_CURRENCY ?? 'aud',
      lines: [lineFor(product, quantity)],
      /*
       * Stripe hands the session id back on the success URL. The page uses it
       * only to say thank you — whether money actually moved is settled by the
       * webhook, because a customer who closes the tab still paid and a
       * customer who forges this URL did not.
       */
      successUrl: `${siteUrl}/order/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/`,
    })
    url = session.url
  } catch (error) {
    console.error('[commerce] Checkout session failed.', error)
    return { status: 'error', message: reachUsInstead() }
  }

  /*
   * Returned rather than redirected. `redirect()` throws to unwind, which in a
   * form action is caught by the boundary and reported as a failed submission —
   * the button spins, the customer sees nothing, and the logs say it worked.
   */
  return { status: 'redirect', url }
}

function reachUsInstead(): string {
  const { phone, email } = siteConfig.business
  const reach = [phone, email].filter(Boolean).join(' or ')
  return reach
    ? `Sorry — we could not start the payment. Please call or email us on ${reach}.`
    : 'Sorry — we could not start the payment. Please try again shortly.'
}
