import type { CollectionSlug, Payload } from 'payload'

import type { OrderInput, ProductRow } from './shape'

/**
 * The one place that reaches past Payload's generated slug union.
 *
 * `CollectionSlug` is generated from the active site's config, so it does not
 * contain "products" or "orders" unless this module is enabled — see shape.ts.
 * Every cast that costs is in this file, behind functions that return the
 * module's own types, so nothing else in commerce has to know.
 *
 * The moment a site enables commerce these strings ARE in the union and the
 * casts become no-ops. They are here so the template compiles for the sites
 * that do not.
 */
const PRODUCTS = 'products' as unknown as CollectionSlug
const ORDERS = 'orders' as unknown as CollectionSlug

export async function findProduct(payload: Payload, id: string): Promise<ProductRow | null> {
  try {
    const doc = await payload.findByID({ collection: PRODUCTS, id })
    return doc as unknown as ProductRow
  } catch {
    // Payload throws NotFound rather than returning null.
    return null
  }
}

/** True when this session has already been recorded. Stripe retries; we must not double-write. */
export async function orderExists(payload: Payload, stripeSessionId: string): Promise<boolean> {
  const { docs } = await payload.find({
    collection: ORDERS,
    where: { stripeSessionId: { equals: stripeSessionId } },
    limit: 1,
  })
  return docs.length > 0
}

export async function recordOrder(payload: Payload, order: OrderInput): Promise<void> {
  await payload.create({
    collection: ORDERS,
    data: order as unknown as Record<string, unknown>,
  })
}
