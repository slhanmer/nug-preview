import config from '@payload-config'
import siteConfig from '@site-config'
import type { Metadata } from 'next'
import { headers as requestHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { venueDate } from '@/modules/menu/day'
import { PrintStudio } from '@/modules/menu/print/PrintStudio'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `Print a menu — ${siteConfig.business.name}`,
  robots: { index: false, follow: false },
}

export default async function MenuPrintPage() {
  const payload = await getPayload({ config })

  /*
   * Staff only. What is off today is shared across every device in the
   * building, which makes this page a write surface — and an unauthenticated
   * write surface is somebody else's menu.
   */
  const { user } = await payload.auth({ headers: await requestHeaders() })
  if (!user) redirect('/admin/login?redirect=/menu/print')

  const date = venueDate()

  const { docs: menus } = await payload.find({ collection: 'menus', limit: 25, sort: 'title' })
  const { docs: days } = await payload.find({
    collection: 'menuDays',
    where: { date: { equals: date } },
    limit: 25,
  })

  const offByMenu: Record<string, string[]> = {}
  for (const day of days) {
    const menuId = typeof day.menu === 'object' ? day.menu.id : day.menu
    offByMenu[String(menuId)] = (day.offItems ?? [])
      .map((row) => row.itemId)
      .filter((id): id is string => Boolean(id))
  }

  return (
    <PrintStudio
      menus={menus}
      date={date}
      offByMenu={offByMenu}
      business={{ name: siteConfig.business.name, logo: siteConfig.business.logo }}
    />
  )
}
