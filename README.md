# nug — preview

A mock built for a business that has agreed to nothing. **Private repo,
noindexed deployment, delete it when the answer is no.**

Ejected from the studio template. It does not track the template — see the
comment at the top of `scripts/eject.mjs` for why.

## Set it up, in this order

The order matters, and **run one line at a time and read each one's output.**
Step 3 is the one that can be skipped without anything looking wrong until the
site is deployed and blank.

`public/media` is not carried across from the template, because files there are
named after their source and collide between demos — six businesses currently
share a `room.jpg`. This repo re-seeds from `demos/nug/assets/`, which is
unambiguous.

1. **A database of its own.** A Neon branch is fine. Put `DATABASE_URL` and
   `PAYLOAD_SECRET` in `.env.local`. Do not point this at the studio database —
   it holds every prospect's mock.
2. `pnpm install`
3. `pnpm seed nug`, then `ls public/media` and confirm it has files in it.
   If it is empty or absent, stop — nothing after this is worth doing.
4. `pnpm build`. This is the gate: if it builds here it will build on Vercel.
5. `git init && git add -A && git commit -m "nug preview"`, then push to a
   **private** repo. Run `git status` before pushing and confirm `public/media`
   is in the commit.
6. Import on Vercel. Name the project so the URL reads as a draft —
   `nug-preview` — because `nug.vercel.app` reads like a live site
   claiming to be theirs.
7. Environment variables:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | The same database you seeded |
   | `PAYLOAD_SECRET` | Any long random string |
   | `NEXT_PUBLIC_SITE_URL` | The deployment's own URL |
   | `RESEND_API_KEY` | **This site has a contact form** — without it the form refuses every submission and shows the phone number instead |
   | `CONTACT_FROM` | An address on a domain verified in that Resend account |
   | `CONTACT_TO` | Where the enquiry lands. Falls back to `business.email` if that is set |

   **No Turnstile keys while `demo: true`.** The mock renders no widget and
   skips the check on purpose — that is what stops the form erroring the one
   time somebody presses Send in front of a prospect. The keys become required
   the day the demo flag comes off.

   **Do not set `ALLOW_INDEXING`.** Unset means noindexed, which is what a mock
   must be. Three layers enforce it: the meta tag, /robots.txt, and an
   `X-Robots-Tag` header that also covers the images.

## Before you send the link

- Open every page on a phone. Tap every link, including the footer.
- **Submit the contact form on the deployed URL.** It is the one thing that can throw in front of them.
- Check every photograph is this business and not another one.
- `ls public` — every `demo-*` file in there should be theirs. The eject
  filters the rest out, but look anyway.
- Check the tab icon is theirs and not the studio's.
- Open the URL in an incognito window and look for anything you did not expect.
