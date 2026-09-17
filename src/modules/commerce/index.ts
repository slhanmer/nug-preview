import { defineModule } from '@/modules/types'

import { shop } from './blocks'
import { orders, products } from './collections'

export default defineModule({
  name: 'commerce',
  label: 'Commerce',
  description:
    'Products priced in the CMS, paid for through the client’s own Stripe. No cart, no stock counts, no fulfilment — Stripe keeps what it is better at.',
  collections: [products, orders],
  blocks: { shop },
  routes: ['/order/complete', '/webhooks/stripe'],
})
