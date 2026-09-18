import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import siteConfig from './site.config'
import { blocksForSite, collectionsForSite } from './src/blocks/for-site'
import {
  isAdmin,
  isAdminField,
  isAdminOrSelf,
  isSignedIn,
  lockBlockStructure,
  ROLES,
} from './src/lib/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Skins and modules are lazily imported, so both can only be resolved async.
// Legal because the project is ESM — see package.json "type": "module".
const blocks = await blocksForSite(siteConfig)
const moduleCollections = await collectionsForSite(siteConfig)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL || '' } }),
  editor: lexicalEditor(),
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'email' },
      /*
       * read and update are scoped to self for anyone who is not an admin.
       * Left at Payload's default they permit any signed-in user, which lets an
       * editor open the other accounts on the site.
       */
      access: {
        create: isAdmin,
        delete: isAdmin,
        read: isAdminOrSelf,
        update: isAdminOrSelf,
      },
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          defaultValue: 'editor',
          options: [...ROLES],
          // Self-update would otherwise be a promotion route.
          access: { create: isAdminField, update: isAdminField },
          admin: {
            description:
              'admin composes pages and sections. editor changes copy and images only.',
          },
        },
      ],
    },
    {
      slug: 'media',
      access: { read: () => true },
      /*
       * SERVE UPLOADS OFF THE CDN, NOT THROUGH A FUNCTION.
       *
       * Payload addresses an upload as /api/media/file/<name>, which is a
       * route: every photograph on a page is a serverless invocation that
       * reads the file off disk and streams it back. Measured on the Nug
       * deployment, warm, same bytes: 1172ms through the route against 430ms
       * for /media/<name> straight off Vercel's edge. A page with eight
       * photographs pays that eight times, and a cold start pays more.
       *
       * The files are already in public/media and are committed, so the static
       * path exists and is cached. This rewrites what Payload hands the page —
       * the original and every generated size — to use it.
       *
       * ⚠️ Only sound while uploads are seeded at build time, which is what a
       * mock is. A live client uploading through the admin on a read-only
       * serverless filesystem is already broken for other reasons; the day
       * that has to work, this collection moves to object storage and this
       * hook comes out with it.
       */
      hooks: {
        afterRead: [
          ({ doc }) => {
            const staticUrl = (url: unknown) =>
              typeof url === 'string' ? url.replace(/^\/api\/media\/file\//, '/media/') : url

            doc.url = staticUrl(doc.url)
            for (const size of Object.values(doc.sizes ?? {})) {
              if (size && typeof size === 'object') {
                ;(size as { url?: unknown }).url = staticUrl((size as { url?: unknown }).url)
              }
            }
            return doc
          },
        ],
      },
      upload: {
        staticDir: path.resolve(dirname, 'public/media'),
        mimeTypes: ['image/*'],
        imageSizes: [
          { name: 'thumb', width: 400 },
          { name: 'card', width: 900 },
          { name: 'wide', width: 1800 },
        ],
      },
      fields: [{ name: 'alt', type: 'text', required: true }],
    },
    {
      slug: 'pages',
      admin: { useAsTitle: 'title' },
      versions: { drafts: true },
      /*
       * Composition is ours, content is theirs. Creating and deleting pages is
       * admin-only; editors update the pages that exist. The structural lock in
       * beforeChange is the other half — without it an editor could not create
       * a page but could still rebuild one.
       */
      access: { create: isAdmin, delete: isAdmin, update: isSignedIn },
      hooks: { beforeChange: [lockBlockStructure] },
      fields: [
        {
          /*
           * Which site this row belongs to. Defaulted and hidden: it is set
           * from site.config by the seeds, never chosen by a person.
           *
           * Exists so one database can hold every mock at once — at ten
           * prospects a week, a seed that overwrites the last one is a seed
           * that makes the previous demo unshowable.
           */
          name: 'site',
          type: 'text',
          required: true,
          index: true,
          defaultValue: () => siteConfig.key,
          admin: { hidden: true },
        },
        { name: 'title', type: 'text', required: true },
        {
          name: 'slug',
          type: 'text',
          required: true,
          index: true,
          admin: {
            description:
              'Lowercase letters, numbers and hyphens. One level of nesting allowed, e.g. services/canvas.',
          },
          hooks: {
            beforeValidate: [
              ({ value }) =>
                typeof value === 'string'
                  ? value.trim().replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase()
                  : value,
            ],
          },
          /*
           * One level of nesting, and no more.
           *
           * Flat was right until a business had six services. A page per
           * service is how a local trade gets found for the service rather
           * than only for its own name, and "services/canvas" is the slug that
           * says so — the alternative, a flat "canvas", would be reachable at
           * BOTH /canvas and /services/canvas, which is the duplicate-page
           * problem the service pages exist to solve.
           *
           * Capped at two segments on purpose. Deeper trees need a parent
           * relationship and breadcrumbs, and nothing here has earned that.
           * Only admins create pages (ADR 0003), so this is a guard against a
           * slip rather than against a client.
           */
          validate: (value: unknown) => {
            if (typeof value !== 'string' || value.length === 0) return 'Required.'
            const segment = '[a-z0-9]+(?:-[a-z0-9]+)*'
            if (!new RegExp(`^${segment}(?:/${segment})?$`).test(value)) {
              return 'Lowercase letters, numbers and hyphens, with at most one slash — e.g. services/canvas.'
            }
            return true
          },
        },
        /*
         * The publish window. Both optional; a page with neither is permanent.
         * Set by us, not by clients — a timed promo page is a care-plan
         * deliverable, so there is no governance surface to build around it.
         */
        {
          name: 'launchesAt',
          type: 'date',
          admin: { position: 'sidebar', description: 'Hidden until this moment. Optional.' },
        },
        {
          name: 'expiresAt',
          type: 'date',
          admin: { position: 'sidebar', description: 'Hidden from this moment. Optional.' },
        },
        { name: 'blocks', type: 'blocks', blocks },
      ],
    },
    ...moduleCollections,
  ],
  admin: { user: 'users' },
  typescript: { outputFile: path.resolve(dirname, 'src/payload-types.ts') },
  sharp,
  cors: {
    origins: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
  },
})
