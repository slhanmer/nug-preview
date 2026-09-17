import config from '@payload-config'
import siteConfig from '@site-config'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import { fileURLToPath } from 'url'

import type { Media, Menu, Page } from '@/payload-types'

import { richText } from './lexical'

/*
 * Seed content for the venue skin — Jane's Deli, West End.
 *
 * Real copy, real menu, real photography. That is the point: a skin judged
 * against invented content passes too easily, and the three-skin acceptance
 * test compares whatever is seeded here.
 *
 *   pnpm payload run ./src/seed/venue.ts
 *
 * Idempotent. Images come from src/seed/assets/venue and upload through the
 * media collection exactly as a client's would.
 *
 * NOTE: these are a real business's photographs and reviews, used here because
 * they are a prospective client. They are demo assets, not template assets —
 * they do not belong in a client repo that is not Jane's.
 */

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS = path.join(dirname, 'assets', 'venue')

const IMAGES = {
  basket: { file: 'basket.jpg', alt: 'A shopping basket of provisions held against an olive wall' },
  sandwich: { file: 'sandwich.jpg', alt: 'A chicken sandwich cut in half, stacked on a plate' },
  menu: { file: 'menu.jpg', alt: "The printed sandwich menu on Jane's Deli counter" },
  logo: { file: 'logo.jpg', alt: "Jane's Deli scalloped logo" },
} satisfies Record<string, { file: string; alt: string }>

type ImageKey = keyof typeof IMAGES

async function upsertImage(payload: Payload, key: ImageKey): Promise<Media['id']> {
  const spec = IMAGES[key]

  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: spec.alt } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const created = await payload.create({
    collection: 'media',
    data: { alt: spec.alt },
    filePath: path.join(ASSETS, spec.file),
  })
  return created.id
}

/*
 * Annotated, not inferred. An object literal handed to Payload widens every
 * literal it contains — 'published' becomes string, ['v'] becomes string[] —
 * and the mismatch surfaces as an unreadable overload error at the call site
 * rather than at the value that is wrong. Same reason the blocks array below
 * is annotated.
 */
const MENU: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'Sandwich menu',
  slug: 'sandwiches',
  standfirst: 'Dine in & takeaway · 7.30am to 3pm · until sold out',
  footnote:
    'Please tell us about allergies when you order. 15% surcharge on public holidays.',
  sections: [
    {
      heading: 'Sandwiches',
      note: 'All made to order.',
      items: [
        {
          name: 'Hiananese chicken',
          description:
            'Drunken chicken, spring onion ginger sauce, salted cucumber, iceberg, chilli crisp & mayo. Fresh on white.',
          price: '16.5',
          dietary: ['spicy'],
        },
        {
          name: 'Blue cheese reuben',
          description:
            'Slow smoked beef pastrami, sauerkraut & blue cheese russian. On toasted rye.',
          price: '22',
        },
        {
          name: 'Grilled halloumi',
          description:
            'Grilled local halloumi, beetroot relish, green olive salad, pepitas, guindilla & mayo. On toasted ciabatta.',
          price: '21',
          dietary: ['v'],
        },
        {
          name: 'Hot honey cheese toastie',
          description:
            'Mozzarella, gruyere, red leicester, caramelised onion, hot honey & mayo. On toasted rye.',
          price: '15',
          dietary: ['v'],
        },
        {
          name: 'Ham & cheese',
          description: 'Leg ham, mozzarella, gruyere, red leicester & mayo. On toasted rye.',
          price: '15',
        },
        {
          name: 'Salumi baguette',
          description:
            'Borgo mortadella, coppa & sopressa with stracciatella & olive oil. Fresh on sourdough baguette.',
          price: '20',
        },
        {
          name: 'Artichoke & pesto baguette',
          description:
            'Fried artichokes, pesto, radicchio, stracciatella & fig relish. Fresh on sourdough baguette.',
          price: '24',
          dietary: ['v'],
        },
      ],
    },
    {
      heading: 'Plates',
      items: [
        {
          name: 'Winter salad',
          description:
            'Butternut pumpkin, kale, cous cous, roasted pecan, dates, whipped feta, chardonnay vinaigrette.',
          price: '19',
          dietary: ['v', 'n'],
        },
        {
          name: "Jane's continental plate",
          description:
            'Coppa, pickles, marinated olives, tomato, stracciatella, guindilla, labneh, soft boiled egg, served with fresh sourdough baguette. Last order 2.30pm, dine in only.',
          price: '30',
        },
      ],
    },
    {
      heading: 'Sweet',
      items: [
        {
          name: 'Toasted banana bread & butter',
          price: '12',
          dietary: ['v'],
        },
      ],
    },
  ],
  _status: 'published' as const,
}

async function upsertMenu(payload: Payload) {
  const existing = await payload.find({
    collection: 'menus',
    where: { slug: { equals: MENU.slug } },
    limit: 1,
  })

  const doc = existing.docs[0]
  if (doc) {
    await payload.update({ collection: 'menus', id: doc.id, data: MENU })
    return doc.id
  }

  const created = await payload.create({ collection: 'menus', data: MENU })
  return created.id
}

async function seed() {
  const payload = await getPayload({ config })

  const media = {} as Record<ImageKey, Media['id']>
  for (const key of Object.keys(IMAGES) as ImageKey[]) {
    media[key] = await upsertImage(payload, key)
  }

  const menuId = await upsertMenu(payload)

  const blocks: NonNullable<Page['blocks']> = [
    {
      blockType: 'hero',
      eyebrow: 'West End · 7.30am to 3pm · until we sell out',
      heading: 'Changing the sandwich game',
      sub: 'Ten sandwiches, made to order on bread baked that morning. Provisions, coffee and matcha to take with you.',
      image: media.basket,
      primaryCta: { label: 'See the menu', href: '/menu' },
      secondaryCta: { label: 'Find us', href: '/contact' },
    },
    {
      blockType: 'prose',
      body: richText(
        'Jane’s is a counter, a short menu and a room painted the colour of a good olive. We open at half seven and stop when the bread runs out, which on a Friday is earlier than anyone would like.',
        'Everything is built to order. Nothing sits under a light waiting for you.',
      ),
    },
    {
      blockType: 'mediaSplit',
      heading: 'Ten sandwiches, no more',
      body: richText(
        'Hiananese chicken with drunken chicken, spring onion ginger sauce and chilli crisp. A blue cheese reuben with slow smoked pastrami and sauerkraut. Grilled halloumi with beetroot relish, green olive salad and guindilla.',
        'The list changes when the produce does, and the board on the wall is the only version that counts.',
      ),
      cta: { label: 'Read the full menu', href: '/menu' },
      image: media.sandwich,
      side: 'left',
    },
    {
      blockType: 'featureGrid',
      heading: 'How it works',
      intro: 'Three things worth knowing before you join the queue.',
      items: [
        {
          title: 'Dine in or takeaway',
          body: 'Same menu either way. There are a handful of tables and they go quickly between twelve and one.',
        },
        {
          title: 'Sold out means sold out',
          body: 'We bake to a number rather than to a forecast. Come before two if you want the reuben.',
        },
        {
          title: 'Provisions to take home',
          body: 'Olives, pickles, stracciatella, coppa and the bread. If it is in a sandwich, you can usually buy it.',
        },
      ],
    },
    {
      blockType: 'quote',
      quote:
        'Absolutely delightful. Fresh ingredient, organic and tasty. A little slice of heaven just around the corner.',
      attribution: 'Acrane Li',
      role: 'Google review',
    },
    {
      blockType: 'mediaSplit',
      heading: 'The continental plate',
      body: richText(
        'Coppa, pickles, marinated olives, tomato, stracciatella, guindilla, labneh and a soft boiled egg, with a fresh sourdough baguette. Dine in only, last order half past two.',
      ),
      image: media.menu,
      side: 'right',
    },
    {
      blockType: 'faq',
      heading: 'Before you come in',
      items: [
        {
          question: 'Is there parking?',
          answer: richText(
            'Easy street parking in the area, and it is a short walk from the busway.',
          ),
        },
        {
          question: 'Can you do vegetarian?',
          answer: richText(
            'The grilled halloumi, the artichoke and pesto baguette and the winter salad are all vegetarian. Tell us about anything else when you order.',
          ),
        },
        {
          question: 'Do you do coffee?',
          answer: richText('Coffee and matcha, both worth the trip on their own.'),
        },
        {
          question: 'How long is the wait?',
          answer: richText(
            'Usually none. Between twelve and one on a weekday, a few minutes.',
          ),
        },
      ],
    },
    {
      blockType: 'menu',
      menu: menuId,
      showPrintLink: true,
    },
    {
      blockType: 'cta',
      heading: 'Come in before the bread runs out',
      body: 'Open 7.30am to 3pm, dine in and takeaway.',
      primaryCta: { label: 'Order ahead', href: '/order' },
      secondaryCta: { label: 'See the menu', href: '/menu' },
    },
    {
      blockType: 'contact',
      heading: 'Say hello',
      body: 'Catering, large orders, or a question about what is on today.',
    },
  ]

  const data = {
    /* Which site these rows belong to. One database holds every mock. */
    site: siteConfig.key,
    title: 'Home',
    slug: 'home',
    blocks,
    _status: 'published' as const,
  }

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })

  if (existing.docs[0]) {
    await payload.update({ collection: 'pages', id: existing.docs[0].id, data })
    payload.logger.info('Seed: updated the home page with venue content.')
  } else {
    await payload.create({ collection: 'pages', data })
    payload.logger.info('Seed: created the home page with venue content.')
  }
}

await seed()
process.exit(0)
