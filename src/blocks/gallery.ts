import type { Block } from 'payload'

import { isAdminField } from '@/lib/access'

/*
 * Photographs.
 *
 * A CORE block, not a module. Photos are not a capability the way a menu or a
 * checkout is — a barber, a cafe, a physio and a roaster all have an Instagram
 * and all need somewhere to put it. Anything every skin must be able to draw
 * belongs in the core set, and the mapped type on SkinManifest['core'] then
 * makes a missing renderer a compile error rather than a blank space.
 *
 * `aspect` is the field that earns its keep. Instagram crops vary, and a grid
 * of mixed ratios reads as a mistake even when every photograph in it is good.
 * Forcing one ratio across the set is the single decision that makes a client's
 * own camera roll look deliberate.
 */
export const gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },

    /*
     * Arrangement and crop are ours, not theirs — same reasoning as
     * featureGrid. The structural lock stops an editor adding or reordering
     * blocks, but a select is a field value and would slip straight past it.
     */
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid — fits as many as will fit', value: 'grid' },
        { label: 'Bento — varied sizes, filled rows', value: 'bento' },
        { label: 'Rail — scrolls sideways', value: 'rail' },
        /*
         * For a set that is the SAME FRAME with one thing changed — three
         * bottles in the same hand against the same wall, one dish plated three
         * ways. A grid of those reads as a mistake, because the eye is told to
         * compare things it can already see are identical. Held in one place
         * and crossfaded, the difference is the only thing that moves, and it
         * becomes the subject.
         *
         * A skin that does not implement it falls through to its grid, which is
         * the right failure: every photograph is still on the page.
         */
        { label: 'Fade — one frame, crossfading', value: 'fade' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: { description: 'How the photographs are arranged. Set by us, not by the client.' },
    },
    {
      name: 'aspect',
      type: 'select',
      defaultValue: 'square',
      options: [
        { label: 'Square — 1:1, matches Instagram', value: 'square' },
        { label: 'Portrait — 4:5', value: 'portrait' },
        { label: 'Landscape — 3:2', value: 'landscape' },
        { label: 'Wide — 16:9', value: 'wide' },
        { label: 'As shot — no crop, ragged rows', value: 'native' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: {
        description:
          'One crop for the whole set. “As shot” only when the photographs already agree.',
      },
    },

    {
      name: 'items',
      type: 'array',
      minRows: 1,
      /*
       * Twelve, not unlimited. Past a dozen this is a feed, and a feed wants
       * pagination and an API rather than an array field somebody hand-fills.
       */
      maxRows: 12,
      required: true,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'caption',
          type: 'text',
          admin: { description: 'Optional. Alt text lives on the image itself.' },
        },
      ],
    },
  ],
}
