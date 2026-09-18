'use server'

import siteConfig from '@site-config'
import { headers as requestHeaders } from 'next/headers'

import { sendMail } from '@/lib/email'

import { verifyTurnstile } from './siteverify'
import {
  type ContactState,
  hasErrors,
  HONEYPOT,
  readValues,
  TURNSTILE_FIELD,
  validate,
} from './validate'

type ContactEnv = {
  resendKey: string
  from: string
  to: string
  turnstileSecret: string
}

/**
 * Everything the form needs from the environment, read in one place so a
 * half-configured deployment says so in a single line rather than failing
 * further down with a provider's error message.
 *
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is checked here even though the server never
 * uses it, because it is inlined at BUILD time. If it was absent when the
 * bundle was built the widget never renders, no token is ever posted, and every
 * submission fails a check the visitor cannot see. Naming it turns that into a
 * log line instead of a mystery.
 */
function readEnv(): { env: ContactEnv } | { missing: string[] } {
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM
  /*
   * A DEMO NEVER FALLS BACK TO THE BUSINESS. `business.email` is the right
   * default for a live site and the wrong one for a mock: the business has
   * agreed to nothing, and the first they would hear of this site is an
   * enquiry from it landing in their inbox. On a demo the address has to be
   * ours, stated in CONTACT_TO, or the form refuses and shows the phone
   * number — which is a visible failure rather than a silent one.
   */
  const to = siteConfig.demo
    ? process.env.CONTACT_TO
    : (process.env.CONTACT_TO ?? siteConfig.business.email)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  /*
   * A demo does not run the spam check, so it does not need the keys for one —
   * see the guard in submitContact and the widget in ContactForm.tsx. Demanding
   * them here would put "NOT CONFIGURED" in the log of every mock.
   */
  const needsTurnstile = !siteConfig.demo

  if (resendKey && from && to && (!needsTurnstile || (turnstileSecret && siteKey))) {
    return { env: { resendKey, from, to, turnstileSecret: turnstileSecret ?? '' } }
  }

  const missing = [
    resendKey ? '' : 'RESEND_API_KEY',
    from ? '' : 'CONTACT_FROM',
    to
      ? ''
      : siteConfig.demo
        ? 'CONTACT_TO (required on a demo — it must not reach the business)'
        : 'CONTACT_TO (or business.email in site.config.ts)',
    needsTurnstile && !turnstileSecret ? 'TURNSTILE_SECRET_KEY' : '',
    needsTurnstile && !siteKey ? 'NEXT_PUBLIC_TURNSTILE_SITE_KEY' : '',
  ].filter(Boolean)

  return { missing }
}

/**
 * How to reach the business when the form cannot.
 *
 * A dead contact form on a small business's site costs them a booking. Better
 * to hand over the phone number than to apologise.
 */
function fallback(): string {
  const { phone, email } = siteConfig.business
  const reach = [phone, email].filter(Boolean).join(' or ')
  return reach
    ? `Sorry — we could not send that just now. Please call or email us on ${reach}.`
    : 'Sorry — we could not send that just now. Please try again in a few minutes.'
}

async function clientIp(): Promise<string | undefined> {
  const headers = await requestHeaders()
  // First hop in x-forwarded-for is the client; everything after it is proxies.
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return headers.get('cf-connecting-ip') ?? forwarded ?? undefined
}

export async function submitContact(
  previous: ContactState,
  form: FormData,
): Promise<ContactState> {
  const attempt = previous.attempt + 1

  /*
   * Honeypot first, and it lies. A bot told it failed learns to leave the field
   * alone next time; a bot told it succeeded goes away satisfied. Either way
   * nothing is sent and nobody is asked to prove anything.
   */
  if (form.get(HONEYPOT)) {
    console.warn('[contact] Honeypot filled — submission dropped.')
    return { status: 'sent', attempt }
  }

  const config = readEnv()
  if ('missing' in config) {
    console.error(
      `[contact] NOT CONFIGURED — missing ${config.missing.join(', ')}. ` +
        'Every submission is being refused. Set these in the environment and REDEPLOY: ' +
        'NEXT_PUBLIC_TURNSTILE_SITE_KEY has to be present at build time, not only at runtime.',
    )
    return { status: 'error', attempt, values: readValues(form), message: fallback() }
  }
  const { env } = config

  const values = readValues(form)
  const errors = validate(values)
  if (hasErrors(errors)) return { status: 'error', attempt, values, errors }

  /*
   * The spam check, unless this is a mock.
   *
   * A demo renders no widget, so there is no token to post and nothing to
   * verify. Skipping it here is what stops the form erroring the one time
   * somebody actually presses Send in front of a prospect. The flag flips the
   * day they sign and the check comes back with it.
   */
  if (!siteConfig.demo) {
    const token = form.get(TURNSTILE_FIELD)
    if (typeof token !== 'string' || !token) {
      return {
        status: 'error',
        attempt,
        values,
        message: 'The spam check has not finished loading. Give it a moment and send again.',
      }
    }

    const verified = await verifyTurnstile(env.turnstileSecret, token, await clientIp())
    if (!verified.ok) {
      console.warn(`[contact] Turnstile rejected a submission: ${verified.codes.join(', ')}.`)
      return {
        status: 'error',
        attempt,
        values,
        message: 'The spam check did not pass. Try that once more.',
      }
    }
  }

  const body = [
    `Name:    ${values.name}`,
    `Email:   ${values.email}`,
    ...(values.phone ? [`Phone:   ${values.phone}`] : []),
    '',
    values.message,
    '',
    `— sent from the ${siteConfig.business.name} website`,
  ].join('\n')

  try {
    await sendMail(env.resendKey, {
      to: env.to,
      from: env.from,
      // So that hitting reply goes to the person, not to the site's own address.
      replyTo: values.email,
      subject: `Website enquiry — ${values.name}`,
      text: body,
    })
  } catch (error) {
    console.error('[contact] Send failed.', error)
    return { status: 'error', attempt, values, message: fallback() }
  }

  return { status: 'sent', attempt }
}
