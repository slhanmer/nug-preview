import config from '@payload-config'
import siteConfig from '@site-config'
import { stat } from 'fs/promises'
import path from 'path'
import { type CollectionSlug, getPayload, type Payload, type Where } from 'payload'
import { pathToFileURL } from 'url'

import type { Demo, DemoRefs, MenuSeed, ProductSeed } from './define'

/*
 * The one seed runner.
 *
 *   pnpm seed chopspot
 *
 * Reads demos/<slug>/content.ts, resolves media and relationships, and upserts
 * every page. Idempotent — run it as often as you like.
 *
 * Collection slugs are cast for the same reason src/modules/commerce/store.ts
 * casts: `menus` and `products` belong to modules, and the generated union only
 * contains them on sites that enable those modules. This runner has to compile
 * for all of them.
 */
const MEDIA = 'media' as CollectionSlug
const PAGES = 'pages' as CollectionSlug
const MENUS = 'menus' as unknown as CollectionSlug
const PRODUCTS = 'products' as unknown as CollectionSlug

type Row = { id: number }

async function findOne(payload: Payload, collection: CollectionSlug, where: Where) {
  const { docs } = await payload.find({ collection, where, limit: 1 })
  return (docs[0] as Row | undefined) ?? null
}

/*
 * Re-uploads when the file on disk no longer matches the stored one.
 *
 * The row is still found by `alt`, but "found" used to mean "done" — so
 * re-cropping an asset and re-seeding left the OLD file serving, and the page
 * looked unchanged with a green seed log. Every other upsert here writes; this
 * one silently did not.
 *
 * Size is the comparison because it is already on the row and a re-export that
 * changes the picture always changes the byte count. It cannot catch an edit
 * that happens to land on the same size, which is a trade for not hashing
 * every asset on every seed.
 */
/*
 * JPEG was the only extension the seed would look for, which quietly ruled out
 * every cut-out: a mascot, a logotype, anything that has to sit on a colour
 * rather than in a box. PNG is checked first for exactly that reason — when
 * both exist the transparent one is the deliberate file.
 */
const ASSET_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

async function assetPath(assetsDir: string, key: string): Promise<string> {
  for (const ext of ASSET_EXTENSIONS) {
    const candidate = path.join(assetsDir, `${key}.${ext}`)
    try {
      await stat(candidate)
      return candidate
    } catch {
      /* next extension */
    }
  }
  throw new Error(
    `Seed: no asset for "${key}" in ${assetsDir} — looked for ${ASSET_EXTENSIONS.map((e) => `${key}.${e}`).join(', ')}`,
  )
}

async function upsertImage(
  payload: Payload,
  key: string,
  alt: string,
  assetsDir: string,
): Promise<number> {
  const filePath = await assetPath(assetsDir, key)
  const { docs } = await payload.find({
    collection: MEDIA,
    where: { alt: { equals: alt } },
    limit: 1,
  })
  const existing = docs[0] as (Row & { filesize?: number | null }) | undefined

  if (existing) {
    const onDisk = (await stat(filePath)).size
    if (existing.filesize === onDisk) return existing.id

    await payload.update({ collection: MEDIA, id: existing.id, data: { alt } as never, filePath })
    payload.logger.info(`Seed: replaced image "${key}" (${existing.filesize} -> ${onDisk} bytes)`)
    return existing.id
  }

  const created = await payload.create({
    collection: MEDIA,
    data: { alt } as never,
    filePath,
  })
  return (created as unknown as Row).id
}

async function upsertMenu(payload: Payload, menu: MenuSeed): Promise<number> {
  const data = { ...menu, _status: 'published' } as never
  const existing = await findOne(payload, MENUS, { slug: { equals: menu.slug } })

  if (existing) {
    await payload.update({ collection: MENUS, id: existing.id, data })
    return existing.id
  }
  const created = await payload.create({ collection: MENUS, data })
  return (created as unknown as Row).id
}

async function upsertProduct(
  payload: Payload,
  product: ProductSeed,
  imageId: number | undefined,
): Promise<number> {
  const data = { ...product, image: imageId } as never
  const existing = await findOne(payload, PRODUCTS, { name: { equals: product.name } })

  if (existing) {
    await payload.update({ collection: PRODUCTS, id: existing.id, data })
    return existing.id
  }
  const created = await payload.create({ collection: PRODUCTS, data })
  return (created as unknown as Row).id
}

function refs(
  images: Map<string, number>,
  menus: Map<string, number>,
  products: Map<string, number>,
): DemoRefs {
  const look = (kind: string, map: Map<string, number>) => (key: string) => {
    const id = map.get(key)
    /*
     * Loud on a miss. A typo in an image key should stop the seed with the key
     * in the message, not quietly render a hero with no photograph that you
     * discover in front of a prospect.
     */
    if (id === undefined) {
      throw new Error(
        `Seed: no ${kind} named "${key}". Declared: ${[...map.keys()].join(', ') || '(none)'}`,
      )
    }
    return id
  }
  return { image: look('image', images), menu: look('menu', menus), product: look('product', products) }
}

async function main() {
  const slug = process.env.SEED
  if (!slug) throw new Error('Seed: set SEED=<slug>, or run `pnpm seed <slug>`.')

  const dir = path.resolve(process.cwd(), 'demos', slug)
  const module_ = (await import(pathToFileURL(path.join(dir, 'content.ts')).href)) as {
    default: Demo
  }
  const demo = module_.default

  /*
   * The demo declares which site it writes to and the active config says which
   * site is being served. Seeding chopspot's pages while reference is active
   * writes rows nothing will ever render, which is a confusing ten minutes.
   */
  if (demo.site !== siteConfig.key) {
    throw new Error(
      `Seed: "${slug}" writes site "${demo.site}" but site.config.ts is "${siteConfig.key}". ` +
        `Run \`pnpm use ${slug}\` first.`,
    )
  }

  const payload = await getPayload({ config })

  const images = new Map<string, number>()
  for (const [key, alt] of Object.entries(demo.images ?? {})) {
    images.set(key, await upsertImage(payload, key, alt, path.join(dir, 'assets')))
  }

  const menus = new Map<string, number>()
  for (const menu of demo.menus ?? []) menus.set(menu.slug, await upsertMenu(payload, menu))

  const products = new Map<string, number>()
  for (const product of demo.products ?? []) {
    const imageId = product.image ? images.get(product.image) : undefined
    products.set(product.name, await upsertProduct(payload, product, imageId))
  }

  const resolved = refs(images, menus, products)

  for (const page of demo.pages) {
    const data = {
      site: demo.site,
      title: page.title,
      slug: page.slug,
      blocks: page.blocks(resolved),
      _status: 'published',
    } as never

    const existing = await payload.find({
      collection: PAGES,
      where: { and: [{ site: { equals: demo.site } }, { slug: { equals: page.slug } }] },
      limit: 1,
    })

    const doc = existing.docs[0] as Row | undefined
    if (doc) {
      await payload.update({ collection: PAGES, id: doc.id, data })
      payload.logger.info(`Seed: updated /${page.slug === 'home' ? '' : page.slug}`)
    } else {
      await payload.create({ collection: PAGES, data })
      payload.logger.info(`Seed: created /${page.slug === 'home' ? '' : page.slug}`)
    }
  }

  payload.logger.info(`Seed: ${slug} done — ${demo.pages.length} page(s).`)
}

await main()
process.exit(0)
