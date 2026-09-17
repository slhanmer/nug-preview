import type { Access, CollectionBeforeChangeHook, FieldAccess } from 'payload'
import { APIError } from 'payload'

export const ROLES = ['admin', 'editor'] as const
export type Role = (typeof ROLES)[number]

/*
 * Read off req.user structurally rather than from the generated User type.
 * payload-types is generated FROM this config, so typing against it here is a
 * chicken-and-egg problem every time the users collection changes.
 */
function roleOf(user: unknown): Role | null {
  if (user && typeof user === 'object' && 'role' in user) {
    const role = (user as { role?: unknown }).role
    if (role === 'admin' || role === 'editor') return role
  }
  return null
}

function idOf(user: unknown): string | number | null {
  if (user && typeof user === 'object' && 'id' in user) {
    const id = (user as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return id
  }
  return null
}

export const isAdmin: Access = ({ req }) => roleOf(req.user) === 'admin'
export const isSignedIn: Access = ({ req }) => Boolean(req.user)

/** Field-level access takes a different signature to collection-level. */
export const isAdminField: FieldAccess = ({ req }) => roleOf(req.user) === 'admin'

/*
 * Admins see every user. Everyone else sees exactly one row: themselves.
 *
 * Returning a query rather than false is the point — an editor keeps the
 * ability to change their own password without gaining any view of, or reach
 * over, the other accounts on the site.
 */
export const isAdminOrSelf: Access = ({ req }) => {
  if (roleOf(req.user) === 'admin') return true
  const id = idOf(req.user)
  if (id === null) return false
  return { id: { equals: id } }
}

/*
 * The shape of a page: which blocks, in which order. Values are excluded on
 * purpose — an editor changing a heading must pass, an editor adding a section
 * must not.
 */
function shapeOf(blocks: unknown): string {
  if (!Array.isArray(blocks)) return ''
  return blocks.map((row) => String((row as { blockType?: unknown })?.blockType ?? '?')).join('|')
}

/*
 * Composition is a paid act, editing is not.
 *
 * Field-level access cannot express this: locking the blocks field would stop
 * an editor changing copy as well, and every word on the site lives in blocks.
 * So the rule is enforced on the structure rather than the field.
 */
export const lockBlockStructure: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  /*
   * No user means the Local API — a seed, a migration, a server action. Access
   * control is skipped for those callers but hooks are NOT, so the trusted path
   * has to be allowed here explicitly. Nothing unauthenticated reaches this:
   * pages.update already requires a signed-in user.
   */
  if (!req.user) return data
  if (roleOf(req.user) === 'admin') return data
  if (!originalDoc || data.blocks === undefined) return data

  if (shapeOf(data.blocks) !== shapeOf(originalDoc.blocks)) {
    throw new APIError(
      'Sections cannot be added, removed or reordered on this plan. ' +
        'Get in touch and we will set it up for you.',
      403,
    )
  }
  return data
}
