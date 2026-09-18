import config from '@payload-config'
import { type CollectionSlug, getPayload } from 'payload'

/*
 * Creates the first account on a site, or another one beside it.
 *
 * WHY THIS EXISTS AND WHY IT IS NOT OPTIONAL.
 *
 * Payload serves /admin whether or not anyone has signed up, and with an empty
 * users table that page is CREATE FIRST USER. On a deployed mock that is an
 * open door: the URL is guessable, noindex keeps it out of a search engine and
 * out of nothing else, and whoever walks through it owns the database the
 * prospect's site is being served from. Seeding a user is what shuts it.
 *
 * It is also the demo. The pitch for the menu module is "you change a price
 * yourself and the site says so a second later", and that cannot be shown
 * without an account to show it from.
 *
 * The password is never read from a file, an argument or this repo — it comes
 * from the prompt in scripts/user.mjs and goes straight to Payload, which
 * hashes it. Nothing here writes it anywhere.
 */
const USERS = 'users' as CollectionSlug

const email = process.env.NEW_USER_EMAIL
const password = process.env.NEW_USER_PASSWORD
const role = process.env.NEW_USER_ROLE === 'admin' ? 'admin' : 'editor'

if (!email || !password) {
  console.error('Run this through `pnpm user`, which collects both and passes them in.')
  process.exit(1)
}

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: USERS,
  where: { email: { equals: email } },
  limit: 1,
})

if (docs[0]) {
  payload.logger.info(`User "${email}" already exists — nothing changed.`)
  process.exit(0)
}

try {
  await payload.create({ collection: USERS, data: { email, password, role } as never })
} catch (error) {
  /*
   * Payload's ValidationError prints its `errors` array as [Object], which
   * says a field is invalid and never which value it objected to. Unpacked
   * here because the answer is almost always visible the moment you see the
   * string with its quotes on.
   */
  const detail = (error as { data?: { errors?: unknown[] } })?.data?.errors
  if (detail) {
    console.error('Payload rejected:', JSON.stringify(detail, null, 2))
    console.error('email as received:', JSON.stringify(email))
    console.error('role  as received:', JSON.stringify(role))
    console.error('password length  :', password.length)
    process.exit(1)
  }
  throw error
}
payload.logger.info(`Created ${role} "${email}".`)
process.exit(0)
