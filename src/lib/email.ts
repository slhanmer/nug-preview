/**
 * Outbound mail — the whole of it.
 *
 * One function, one provider, called over HTTP rather than through an SDK. The
 * reasons are the same ones that keep the rest of this template thin: a
 * dependency is a version to track and a supply-chain surface, and this request
 * is four lines. Swapping Resend for Postmark or SES is then a change to this
 * file and nothing else.
 *
 * The API key belongs to the CLIENT's Resend account, on the client's own
 * domain, exactly like their Stripe. We never send a client's mail through our
 * account — their deliverability and their reputation should not be ours to
 * lose, and it must survive us handing the site over.
 */

export type Mail = {
  to: string
  /** Must be an address on a domain verified in the sending account. */
  from: string
  /** Where a reply goes. For a contact form this is the person who wrote in. */
  replyTo?: string
  subject: string
  text: string
}

const RESEND_URL = 'https://api.resend.com/emails'
const TIMEOUT_MS = 8000

/** Throws on any failure, with the provider's own message. Callers log it. */
export async function sendMail(apiKey: string, mail: Mail): Promise<void> {
  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      to: [mail.to],
      from: mail.from,
      subject: mail.subject,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  })

  if (!response.ok) {
    // Read as text: an error body is not reliably JSON, and a parse failure
    // here would hide the reason the send failed behind a syntax error.
    const detail = await response.text().catch(() => '')
    throw new Error(`Resend refused the message (${response.status}). ${detail}`.trim())
  }
}
