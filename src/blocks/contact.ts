import type { Block } from 'payload'

/**
 * The editable half of a contact section: what it says, not what it does.
 *
 * Field labels, validation messages and the send itself stay in code, in
 * src/features/contact. They are shared with the server action, so a CMS-backed
 * version would make rejecting a bad email address depend on the CMS being up —
 * and would hand a client the ability to break their own enquiries.
 */
export const contact: Block = {
  slug: 'contact',
  interfaceName: 'ContactBlock',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
  ],
}
