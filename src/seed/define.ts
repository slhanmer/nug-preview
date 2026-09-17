/**
 * What a mock is, as data.
 *
 * A demo used to be two hundred lines of TypeScript — an image upsert helper, a
 * menu upsert, a page find-or-create — with about fifty lines of actual content
 * buried in the middle. At ten prospects a week that plumbing is the job.
 *
 * Everything here is plain data. No Payload imports, no generated types (a demo
 * may enable modules whose types are not generated for the next demo — same
 * rule as src/modules/commerce/shape.ts), and no knowledge of how any of it
 * reaches the database. src/seed/run.ts does that once, for every demo.
 */

/**
 * Image key → alt text. The file is `<key>` in the demo's assets folder, with
 * the first of `.png`, `.jpg`, `.jpeg`, `.webp` that exists — PNG first, so a
 * cut-out beats a boxed version of the same picture.
 */
export type DemoImages = Record<string, string>

export type MenuSeed = {
  slug: string
  title: string
  standfirst?: string
  footnote?: string
  sections: {
    heading: string
    note?: string
    /*
     * `dietary` takes the collection's own codes (see modules/menu/collections).
     * Left out of the seed type originally, which meant a venue that had already
     * done the work of coding every dish lost it the moment its menu came
     * through a demo — and on at least one prospect that coding IS the pitch.
     */
    items: {
      name: string
      description?: string
      price?: string
      dietary?: string[]
    }[]
  }[]
}

export type ProductSeed = {
  name: string
  price: number
  description?: string
  /** Image key, resolved to a media id. */
  image?: string
  available?: boolean
  sortOrder?: number
}

/**
 * Ids the content needs but cannot know until the seed has run.
 *
 * Throwing on a miss rather than returning undefined is deliberate: a typo in
 * an image key should stop the seed with the key in the message, not render a
 * hero with no photograph and let you find out in front of a prospect.
 */
export type DemoRefs = {
  image: (key: string) => number
  menu: (slug: string) => number
  product: (name: string) => number
}

/**
 * A block as a seed writes it: a blockType plus whatever that block's schema
 * takes.
 *
 * NOT `BlockData`. That type is deliberately narrow — three fields, no index
 * signature — so an object literal carrying `heading` fails excess-property
 * checking and every line of every demo lights up red. It is also not the
 * generated union, because a demo may enable modules the next demo does not.
 *
 * Loose on purpose, and safe because Payload validates on write: a bad field
 * fails the seed naming the collection and the field, which is a better error
 * than the type system was going to give here anyway.
 */
export type SeedBlock = { blockType: string } & Record<string, unknown>

export type DemoPage = {
  title: string
  /** "home" is the front page. Everything else is a real route. */
  slug: string
  blocks: (refs: DemoRefs) => SeedBlock[]
}

export type Demo = {
  /** Must match the `key` in this demo's config, or the pages land on another site. */
  site: string
  images?: DemoImages
  menus?: MenuSeed[]
  products?: ProductSeed[]
  pages: DemoPage[]
}

export function defineDemo(demo: Demo): Demo {
  return demo
}
