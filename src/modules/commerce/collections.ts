import type { CollectionConfig } from 'payload'

import { isAdmin, isSignedIn } from '@/lib/access'

/**
 * Products live HERE, not in Stripe.
 *
 * The client edits their three pomades in the admin they already use and never
 * opens a Stripe dashboard. Checkout sessions are built with inline price data
 * from these rows, so there is no product to keep in sync, no price to drift,
 * and no webhook whose job is to copy a name from one system to another.
 *
 * Stripe's only job is taking the money. That is also what makes a mock work
 * with no Stripe account attached at all — the shop renders from these rows,
 * and only the buy button needs a key.
 */
export const products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'price', 'available'] },
  access: { read: () => true, create: isSignedIn, update: isSignedIn, delete: isAdmin },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      /*
       * Dollars, not cents, because the person typing it thinks in dollars and
       * a field that wants 2500 for $25 gets a $2,500 pomade eventually.
       * Converted once, at the checkout call.
       */
      admin: { step: 0.01, description: 'In dollars. 24.95, not 2495.' },
    },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'available',
      type: 'checkbox',
      defaultValue: true,
      /*
       * Hidden rather than deleted, and that is the whole stock model. Anything
       * finer — counts, reservations, back-orders — is state somebody has to
       * maintain, and nobody updates a stock count from the shop floor.
       */
      admin: { description: 'Unchecked hides it from the shop. There is no stock count.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Low numbers first.' },
    },
  ],
}

/**
 * What Stripe told us was paid for.
 *
 * Written by the webhook, never by a person — the client reads this, and the
 * authority on whether money moved is Stripe, not our admin. Deliberately not
 * an order MANAGEMENT system: no fulfilment state machine, no shipping, no
 * refunds. Those live in Stripe's dashboard, which is already better at them
 * than anything we would build this year.
 */
export const orders: CollectionConfig = {
  slug: 'orders',
  admin: { useAsTitle: 'reference', defaultColumns: ['reference', 'email', 'total', 'createdAt'] },
  access: {
    read: isSignedIn,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: 'reference', type: 'text', required: true, index: true },
    { name: 'email', type: 'email' },
    { name: 'customerName', type: 'text' },
    { name: 'total', type: 'number', required: true, admin: { description: 'In dollars.' } },
    { name: 'currency', type: 'text', required: true },
    {
      name: 'lines',
      type: 'array',
      fields: [
        { name: 'description', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'amount', type: 'number', required: true },
      ],
    },
    /* The idempotency key. A webhook that fires twice must not bill twice. */
    { name: 'stripeSessionId', type: 'text', required: true, unique: true, index: true },
  ],
}
