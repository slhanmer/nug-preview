import type { Access, CollectionConfig } from 'payload'

export const DIETARY = [
  { label: 'Vegetarian', value: 'v' },
  { label: 'Vegan', value: 'vg' },
  { label: 'Gluten free', value: 'gf' },
  { label: 'Gluten free option', value: 'gfo' },
  { label: 'Dairy free', value: 'df' },
  { label: 'Contains nuts', value: 'n' },
  /*
   * NOT the inverse of `n`, and the distinction is the reason this exists: `n`
   * is a warning the kitchen puts on a dish, `nf` is a guarantee it makes about
   * one. A venue that publishes NF on its own menu has decided it can stand
   * behind that, and mapping it onto "contains nuts" would invert the meaning
   * on the exact line where being wrong is dangerous.
   */
  { label: 'Nut free', value: 'nf' },
  { label: 'Spicy', value: 'spicy' },
] as const

/*
 * A menu is a collection, not a block.
 *
 * It is edited on its own schedule, printed on its own schedule, and the same
 * menu appears on more than one page. A block that owned its items would make
 * "change the price of the reuben" a page edit.
 */
export const menus: CollectionConfig = {
  slug: 'menus',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'updatedAt'] },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Lowercase letters, numbers and hyphens. No slashes.' },
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === 'string'
              ? value.trim().replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase()
              : value,
        ],
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.length === 0) return 'Required.'
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Lowercase letters, numbers and hyphens only.'
        }
        return true
      },
    },
    {
      name: 'standfirst',
      type: 'text',
      admin: { description: 'The line under the title. Service times, or how the menu works.' },
    },
    {
      name: 'sections',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      labels: { singular: 'Section', plural: 'Sections' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'note', type: 'text', admin: { description: 'Optional line under the heading.' } },
        {
          name: 'items',
          type: 'array',
          required: true,
          minRows: 1,
          maxRows: 40,
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            /*
             * Text, not a number. Menus carry "mkt", "from 18", "22/28" and
             * half-serve prices, and a numeric field forces every one of those
             * into a note field where it prints in the wrong place.
             */
            { name: 'price', type: 'text' },
            { name: 'dietary', type: 'select', hasMany: true, options: [...DIETARY] },
            /*
             * Not a live availability switch, and deliberately not named like
             * one. Nobody updates a website mid-service — a site claiming a
             * dish is available is confidently wrong by 1pm. This is for a dish
             * that has come off the menu, measured in weeks.
             */
            {
              name: 'hidden',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Hidden from the site and from print. For a dish that has come off the menu — not for running out during service.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'footnote',
      type: 'textarea',
      admin: { description: 'Surcharges, allergen wording, card fees.' },
    },
  ],
}

const isStaff: Access = ({ req }) => Boolean(req.user)

/*
 * What is off the print today, shared across every device in the building.
 *
 * A separate collection rather than a field on the menu, because the two have
 * different natures: a menu is content and is versioned, and the day's
 * omissions are operational state. Putting them together would file a new menu
 * version every time somebody ticked a box.
 *
 * The site never reads this. It is print-only by design — see ADR notes: a
 * website nobody updates mid-service must not claim availability.
 */
export const menuDays: CollectionConfig = {
  slug: 'menuDays',
  labels: { singular: 'Menu day', plural: 'Menu days' },
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'menu', 'updatedAt'],
    description: 'Items left off a printed menu on a given day. Written by the print studio.',
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'menu', type: 'relationship', relationTo: 'menus', required: true, index: true },
    {
      name: 'date',
      type: 'text',
      required: true,
      index: true,
      admin: { description: "The venue's local date, YYYY-MM-DD. Not the server's." },
    },
    {
      name: 'offItems',
      type: 'array',
      fields: [{ name: 'itemId', type: 'text', required: true }],
    },
  ],
}
