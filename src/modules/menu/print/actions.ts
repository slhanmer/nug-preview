'use server'

import config from '@payload-config'
import { headers as requestHeaders } from 'next/headers'
import { getPayload } from 'payload'

import type { MenuDay } from '@/payload-types'

import { DATE_PATTERN } from '../day'

/**
 * Save what is off today's print, for every device in the building.
 *
 * Authenticated here as well as on the page. A server action is a public
 * endpoint — the page's own check stops a stranger seeing the tool, and this
 * one stops a stranger writing to it.
 */
export async function saveDayOff(menuId: number, date: string, itemIds: string[]) {
  if (!DATE_PATTERN.test(date)) throw new Error('Bad date.')

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await requestHeaders() })
  if (!user) throw new Error('Sign in to change the printed menu.')

  const offItems = itemIds.slice(0, 200).map((itemId) => ({ itemId }))

  const existing = await payload.find({
    collection: 'menuDays',
    where: { and: [{ menu: { equals: menuId } }, { date: { equals: date } }] },
    limit: 1,
  })

  const doc = existing.docs[0]
  if (doc) {
    await payload.update({ collection: 'menuDays', id: doc.id, data: { offItems } })
    return
  }

  const data: Omit<MenuDay, 'id' | 'createdAt' | 'updatedAt'> = { menu: menuId, date, offItems }
  await payload.create({ collection: 'menuDays', data })
}
