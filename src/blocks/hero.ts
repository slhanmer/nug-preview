import type { Block } from 'payload'

import { isAdminField } from '@/lib/access'

export const hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'sub', type: 'textarea' },
    /*
     * Optional because it is a skin's decision, not the content's. A venue
     * leads with a photograph; a trade leads with a promise and a phone number.
     * The same page renders in both, so the field exists everywhere and the
     * skin decides whether to draw it.
     */
    { name: 'image', type: 'upload', relationTo: 'media' },

    /*
     * How the photograph is used, not whether there is one.
     *
     * `showcase` wants a wide, sharp, landscape image — it is cropped to a
     * band and scaled up to the full width of the screen, so anything shot
     * portrait on a phone gets its middle third enlarged and goes soft. That
     * is most of what a small business actually has.
     *
     * `split` puts the image in half the width at close to its own shape, so a
     * portrait phone photo is used at or below its native size. When the
     * pictures are ordinary, this is the one that flatters them.
     *
     * `mark` gives the image the full width and puts nothing on top of it —
     * for a business whose signage or logo is the strongest thing it owns,
     * which is more of them than have a good photograph. The type sits in a
     * band underneath, so there is no contrast question at all.
     *
     * `plain` is for when the only photograph available is worse than none.
     *
     * Ours, not theirs — same as featureGrid and gallery. A client changing
     * this would be redesigning the page, not editing it.
     */
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'showcase',
      options: [
        { label: 'Showcase — full width photograph, type over it', value: 'showcase' },
        { label: 'Split — type one side, photograph the other', value: 'split' },
        { label: 'Mark — the image full width on its own, type beneath', value: 'mark' },
        { label: 'Plain — type only, no photograph', value: 'plain' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: {
        description:
          'Showcase needs a wide, sharp photograph. Split suits portrait phone shots, which is most of them.',
      },
    },

    {
      name: 'primaryCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
    {
      name: 'secondaryCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}
