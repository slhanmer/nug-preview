import config from '@payload-config'
import siteConfig from '@site-config'
import { mkdtemp, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import type { Media, Menu, Page } from '@/payload-types'

import { richText } from './lexical'

/*
 * Seed content for the service skin.
 *
 * Ridgeline Barbers is invented — no such business. It exists so the skin can
 * be judged against content that fits it: reviewing a service layout against a
 * deli menu tells you nothing except that the words are wrong.
 *
 *   pnpm payload run ./src/seed/service.ts
 *
 * Idempotent.
 */

type Placeholder = { alt: string; width: number; height: number; rgb: [number, number, number] }

const PLACEHOLDERS = {
  shopfront: { alt: 'Placeholder hero image, the shop from the street', width: 2400, height: 1400, rgb: [40, 54, 76] },
  chair: { alt: 'Placeholder image, a barber chair by the window', width: 1600, height: 1200, rgb: [64, 74, 92] },
} satisfies Record<string, Placeholder>

type PlaceholderKey = keyof typeof PLACEHOLDERS

async function upsertImage(payload: Payload, key: PlaceholderKey, dir: string): Promise<Media['id']> {
  const spec = PLACEHOLDERS[key]

  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: spec.alt } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const file = path.join(dir, `${key}.png`)
  const [r, g, b] = spec.rgb
  await writeFile(
    file,
    await sharp({
      create: { width: spec.width, height: spec.height, channels: 3, background: { r, g, b } },
    })
      .png()
      .toBuffer(),
  )

  const created = await payload.create({ collection: 'media', data: { alt: spec.alt }, filePath: file })
  return created.id
}

const PRICES: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'Prices',
  slug: 'prices',
  standfirst: 'Tue to Sat · Walk-ins before ten · Cash and card',
  footnote: 'Card payments have no surcharge. Concession rates on Tuesdays.',
  sections: [
    {
      heading: 'Cuts',
      items: [
        { name: 'Skin fade', description: 'Clippers through to the skin, blended, finished with a razor.', price: '55' },
        { name: 'Scissor cut', description: 'Dry cut, styled. Wash on request.', price: '50' },
        { name: 'Cut and beard', description: 'Any cut with a beard trim and hot towel.', price: '75' },
        { name: 'Clipper cut', description: 'One length all over, neckline tidied.', price: '35' },
        { name: "Kids' cut", description: 'Twelve and under. Weekdays only.', price: '30' },
      ],
    },
    {
      heading: 'Beard',
      items: [
        { name: 'Beard trim', description: 'Shaped and lined out.', price: '30' },
        { name: 'Hot towel shave', description: 'Traditional, straight razor, forty minutes.', price: '60' },
        { name: 'Tidy up', description: 'Neck and cheeks between appointments.', price: '15' },
      ],
    },
    {
      heading: 'Other',
      items: [
        { name: 'Grey blending', description: 'Softens rather than covers. Twenty minutes on top of a cut.', price: '40' },
        { name: 'Head shave', description: 'Razor finish, balm.', price: '45' },
      ],
    },
  ],
  _status: 'published',
}

async function upsertPrices(payload: Payload) {
  const existing = await payload.find({
    collection: 'menus',
    where: { slug: { equals: PRICES.slug } },
    limit: 1,
  })

  const doc = existing.docs[0]
  if (doc) {
    await payload.update({ collection: 'menus', id: doc.id, data: PRICES })
    return doc.id
  }

  const created = await payload.create({ collection: 'menus', data: PRICES })
  return created.id
}

async function seed() {
  const payload = await getPayload({ config })
  const dir = await mkdtemp(path.join(tmpdir(), 'starter-service-'))

  const media = {} as Record<PlaceholderKey, Media['id']>
  for (const key of Object.keys(PLACEHOLDERS) as PlaceholderKey[]) {
    media[key] = await upsertImage(payload, key, dir)
  }

  const pricesId = await upsertPrices(payload)

  const blocks: NonNullable<Page['blocks']> = [
    {
      blockType: 'hero',
      eyebrow: 'Paddington · Since 2016',
      heading: 'A proper haircut, booked in ten seconds',
      sub: 'Four chairs, no queue system, no upselling. Walk in before ten or book a slot that actually starts on time.',
      image: media.shopfront,
      primaryCta: { label: 'Book a chair', href: '/book' },
      secondaryCta: { label: 'See prices', href: '/prices' },
    },
    {
      blockType: 'featureGrid',
      heading: 'What you can count on',
      intro: 'The three things people ring up to ask.',
      items: [
        {
          title: 'We run to time',
          body: 'Appointments are forty minutes and we do not double-book. If we are running late you get a message, not a waiting room.',
        },
        {
          title: 'The price is the price',
          body: 'What is on the list is what you pay. No product push, no surcharge on card, no weekend rate.',
        },
        {
          title: 'Same barber every time',
          body: 'Book the person, not the shop. If they are away we will tell you before you turn up.',
        },
      ],
    },
    {
      blockType: 'mediaSplit',
      heading: 'Twenty years between the four of us',
      body: richText(
        'We opened in 2016 with two chairs and a card reader that never worked. Four chairs now, the card reader is fine, and three of the original regulars still come in on Thursdays.',
        'Every barber here cuts every kind of hair. If you want a specific person, book them; if you do not mind, take whoever is free and you will get the same cut.',
      ),
      cta: { label: 'Meet the team', href: '/about' },
      image: media.chair,
      side: 'right',
    },
    {
      blockType: 'menu',
      menu: pricesId,
      heading: 'Prices',
      showPrintLink: true,
    },
    {
      blockType: 'quote',
      quote:
        'First place in years where I have not had to explain what I want twice. In and out in forty minutes and it grew out properly.',
      attribution: 'Dan M.',
      role: 'Google review',
    },
    {
      blockType: 'faq',
      heading: 'Before you come in',
      items: [
        {
          question: 'Do you take walk-ins?',
          answer: richText('Before ten every day we trade, and after that if a chair is free. Saturdays are booked out most weeks.'),
        },
        {
          question: 'Where do I park?',
          answer: richText('Two-hour street parking either side of the shop, and the car park behind the bakery is free on weekends.'),
        },
        {
          question: 'Can I bring my kids?',
          answer: richText('Yes. Under twelves are a lower rate on weekdays, and there is a booster for the chair.'),
        },
        {
          question: 'What if I do not like it?',
          answer: richText('Come back within a week and we will fix it, no charge and no argument.'),
        },
      ],
    },
    {
      blockType: 'prose',
      body: richText(
        'Open Tuesday to Saturday. Closed Sundays, Mondays and the week after Christmas.',
      ),
    },
    {
      blockType: 'cta',
      heading: 'Book a chair',
      body: 'Pick a barber and a time, or call the shop and we will sort it out.',
      primaryCta: { label: 'Book online', href: '/book' },
      secondaryCta: { label: 'Call the shop', href: 'tel:0700000000' },
    },
    {
      blockType: 'contact',
      heading: 'Ask us anything',
      body: 'Group bookings, weddings, or a question about what will actually suit you.',
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

  const doc = existing.docs[0]
  if (doc) {
    await payload.update({ collection: 'pages', id: doc.id, data })
    payload.logger.info('Seed: home page now carries the service content.')
  } else {
    await payload.create({ collection: 'pages', data })
    payload.logger.info('Seed: created the home page with service content.')
  }
}

await seed()
process.exit(0)
