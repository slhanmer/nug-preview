import type { Block, CollectionSlug } from 'payload'

/**
 * A row of things for sale.
 *
 * Points at products rather than containing them, so the same pomade can be on
 * the home page and the shop page and be priced once.
 */
export const shop: Block = {
  slug: 'shop',
  interfaceName: 'ShopBlock',
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'products',
      type: 'relationship',
      /*
       * Cast for the same reason store.ts casts: CollectionSlug is generated
       * from the active site, and "products" is only in it once a site enables
       * this module. See shape.ts.
       */
      relationTo: 'products' as unknown as CollectionSlug,
      hasMany: true,
      required: true,
      admin: { description: 'Order here wins over each product’s own sort order.' },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid — fits as many as will fit', value: 'grid' },
        { label: 'Columns — a fixed count', value: 'columns' },
        { label: 'Rail — scrolls sideways', value: 'rail' },
      ],
      admin: { description: 'How the products are arranged.' },
    },
  ],
}
