import type { Block } from 'payload'

import { isAdminField } from '@/lib/access'

export const featureGrid: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
    /*
     * One picture for the whole set, beside it rather than in it.
     *
     * A stack of linked cards is a list of ways into the site, and a list on
     * its own has nothing to look at. This is the section's picture, not a
     * card's — a skin that draws it puts the set in one column and the
     * photograph in the other, which is also the arrangement that lets a small
     * business's 1000px photograph sit at close to its native size.
     */
    { name: 'image', type: 'upload', relationTo: 'media' },
    /*
     * Arrangement, not content — so it is ours, not theirs.
     *
     * The structural lock stops an editor adding or reordering blocks, but a
     * select is a field value and would slip straight past it. Field-level
     * access is the same machinery the users collection uses for `role`.
     */
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid — fits as many as will fit', value: 'grid' },
        { label: 'Columns — a fixed count', value: 'columns' },
        { label: 'Bento — varied sizes, filled rows', value: 'bento' },
        { label: 'Rail — scrolls sideways', value: 'rail' },
        { label: 'Stack — one column', value: 'stack' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: { description: 'How the items are arranged. Set by us, not by the client.' },
    },
    /*
     * How a card's picture is presented, when it has one.
     *
     * `mat` mounts it the way a framer would — board around the picture, a
     * rebate line, and the shadow of something hanging slightly off the wall.
     * It exists because a bento of text cards is a wall of paragraphs, and the
     * businesses that most want a bento are the ones whose work is visual.
     *
     * Deliberately a mount and not a drawn moulding: a moulding in CSS is a
     * texture pretending to be wood and it reads as clip art at any size. A
     * mount is flat board and a shadow, which is a real thing CSS can be
     * honest about.
     *
     * Ours, not theirs — same argument as `layout`.
     */
    {
      name: 'frame',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None — the picture sits flush', value: 'none' },
        { label: 'Mat — mounted, as a framer would', value: 'mat' },
        /*
         * The picture cut to a circle on a coloured disc, a different colour
         * per card, taken from the decorative pop wheel in tokens.css.
         *
         * For the identity that is already several colours — a mascot on a
         * yellow disc one week and a green one the next. A row of those reads
         * as the brand rather than as a row of cards, and it is the one
         * arrangement where colour does the work a border or a shadow does
         * everywhere else.
         *
         * The disc never carries type. It sits behind a picture and the words
         * go under it on the band, where the ladder still applies.
         */
        { label: 'Disc — the picture on a coloured disc', value: 'disc' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: { description: 'Only affects items that have a picture.' },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      required: true,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        /*
         * Where the picture sits relative to the words.
         *
         * Per item, because in a bento the cells are different shapes: a wide
         * cell wants the picture beside the text and a narrow one wants it
         * above. One setting for the whole block makes half the cards wrong.
         */
        {
          name: 'media',
          type: 'select',
          defaultValue: 'top',
          options: [
            { label: 'Top', value: 'top' },
            { label: 'Bottom', value: 'bottom' },
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
          access: { create: isAdminField, update: isAdminField },
        },
        /*
         * Which of the client's own colours washes this card.
         *
         * A NAME, never a value. The temptation with a bento is to eyedropper
         * a few pretty colours out of a photograph and paste them in — and
         * then the site's palette is made of somebody's stock, and it changes
         * when their supplier changes. These three are the colours the client
         * actually owns, so a card can be coloured without inventing anything.
         */
        {
          name: 'tone',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None — paper', value: 'none' },
            { label: 'Accent — the second brand colour', value: 'accent' },
            { label: 'Third — the third brand colour', value: 'third' },
            { label: 'Brand — the first, usually the ink', value: 'brand' },
          ],
          access: { create: isAdminField, update: isAdminField },
        },
        /*
         * The card's own page.
         *
         * A service that cannot be linked to cannot be ranked for. Six
         * services described on one page is one page competing for six
         * different searches, which is the complaint that put most of these
         * businesses on the prospect list in the first place.
         */
        { name: 'href', type: 'text' },
        {
          name: 'linkLabel',
          type: 'text',
          defaultValue: 'Learn more',
          admin: { condition: (_, siblings) => Boolean(siblings?.href) },
        },
      ],
    },
  ],
}
