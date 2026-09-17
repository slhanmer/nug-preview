/**
 * The commerce module's own row and block shapes.
 *
 * NOT imported from `@/payload-types`, and that is the whole point. Generated
 * types are produced from the collections and blocks the ACTIVE site enables,
 * so `Product`, `Order` and `ShopBlock` simply do not exist in them unless
 * `commerce` is in that site's modules. A module that imports its own generated
 * types only compiles on the sites that happen to use it, which means the
 * template stops type-checking depending on which config is swapped in.
 *
 * Same rule, and the same reason, as `BlockData` not being the generated block
 * union: anything that varies per site cannot be depended on by code that has
 * to compile for every site.
 *
 * (`src/modules/menu` has the identical latent problem — it imports `MenuBlock`
 * and gets away with it only because every config so far enables the menu.)
 */

export type ProductRow = {
  id: string | number
  name: string
  price: number
  description?: string | null
  available?: boolean | null
  image?: { url?: string | null; alt?: string | null } | string | number | null
  sortOrder?: number | null
}

/** A relationship comes back as an id when query depth did not reach it. */
export type ProductRef = ProductRow | string | number

export type ShopBlockData = {
  heading?: string | null
  intro?: string | null
  products?: ProductRef[] | null
  layout?: 'grid' | 'columns' | 'rail' | null
}

export type OrderInput = {
  reference: string
  email?: string
  customerName?: string
  total: number
  currency: string
  stripeSessionId: string
}

export function asProduct(value: ProductRef | null | undefined): ProductRow | null {
  return value && typeof value === 'object' && 'name' in value ? value : null
}

export function productImage(product: ProductRow): { url: string; alt: string } | null {
  const image = product.image
  if (!image || typeof image !== 'object' || !image.url) return null
  return { url: image.url, alt: image.alt ?? '' }
}
