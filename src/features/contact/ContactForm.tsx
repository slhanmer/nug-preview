'use client'

import siteConfig from '@site-config'
import { useActionState, useId } from 'react'

import { Button, Input } from '@/ui-kit'

import { submitContact } from './actions'
import styles from './contact-form.module.css'
import { Turnstile } from './Turnstile'
import { type ContactErrors, HONEYPOT, INITIAL_STATE, LIMITS, RULES } from './validate'

export type ContactFormProps = {
  /** Applied to the form element. Skins position the form; they never restyle it. */
  className?: string
  /** Overrides the widget theme. Defaults to whatever site.config pins. */
  turnstileTheme?: 'auto' | 'light' | 'dark'
  successHeading?: string
  successBody?: string
}

/**
 * The contact form, shared by every skin.
 *
 * It is a feature rather than a section renderer because it is the same form on
 * all four skins: labels, rules and the spam check are shared with the server
 * action, and a skin that owned a copy of them could get them wrong. Skins own
 * the section around it — heading, container, rhythm — and must not reach
 * inside.
 *
 * One uncontrolled form posting to a server action. The fields validate on
 * blur through the kit, using the same `RULES` objects the action validates
 * with, so a person is never told something passes here and fails there.
 */
export function ContactForm({
  className,
  turnstileTheme,
  successHeading = 'Thanks — that’s away.',
  successBody = 'We’ll come back to you shortly.',
}: ContactFormProps) {
  const [state, action, pending] = useActionState(submitContact, INITIAL_STATE)
  const base = useId()

  const mode = siteConfig.brand.theme ?? 'system'
  const theme = turnstileTheme ?? (mode === 'system' ? 'auto' : mode)

  if (state.status === 'sent') {
    return (
      <div className={`${styles.form} ${styles.sent} ${className ?? ''}`} role="status">
        <p className={styles.sentHeading}>{successHeading}</p>
        <p className={styles.sentBody}>{successBody}</p>
      </div>
    )
  }

  const values = state.values
  const errors: ContactErrors = state.errors ?? {}

  return (
    /*
     * Keyed on the attempt count. React resets an uncontrolled form once its
     * action settles, so without a remount a rejected submission would clear
     * everything the person typed — `defaultValue` only applies to a fresh
     * element. The remount also gives Turnstile a new widget, which it needs,
     * because the token it already spent cannot be posted twice.
     */
    <form key={state.attempt} action={action} className={`${styles.form} ${className ?? ''}`}>
      {state.message ? (
        <p className={styles.notice} role="alert">
          {state.message}
        </p>
      ) : null}

      <Input
        label="Name"
        name="name"
        type={RULES.name.type}
        validationOptions={RULES.name.options}
        autoComplete="name"
        required
        maxLength={LIMITS.name}
        defaultValue={values?.name}
        error={errors.name}
      />

      <div className={styles.row}>
        <Input
          label="Email"
          name="email"
          type={RULES.email.type}
          validationOptions={RULES.email.options}
          autoComplete="email"
          required
          maxLength={LIMITS.email}
          defaultValue={values?.email}
          error={errors.email}
        />

        <Input
          label="Phone"
          name="phone"
          type={RULES.phone.type}
          validationOptions={RULES.phone.options}
          autoComplete="tel"
          maxLength={LIMITS.phone}
          defaultValue={values?.phone}
          error={errors.phone}
        />
      </div>

      <Input
        label="How can we help?"
        name="message"
        type={RULES.message.type}
        validationOptions={RULES.message.options}
        multiline
        rows={5}
        counter
        required
        maxLength={LIMITS.message}
        defaultValue={values?.message}
        error={errors.message}
      />

      {/*
        Off-screen rather than display:none or hidden — a bot that skips
        anything invisible skips this too, and then the honeypot catches
        nothing. Kept out of the tab order and out of the a11y tree instead.
      */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={`${base}-${HONEYPOT}`}>Company</label>
        <input
          id={`${base}-${HONEYPOT}`}
          name={HONEYPOT}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className={styles.actions}>
        {/*
          No spam check on a mock.

          A demo never takes a real submission, and Cloudflare's test keys draw
          a widget with "for testing only" stamped across it — on the page we
          are trying to sell. The server action skips verification under the
          same flag, so the two cannot disagree.
        */}
        {siteConfig.demo ? null : <Turnstile theme={theme} />}
        <Button type="submit" variant="primary" loading={pending}>
          Send
        </Button>
      </div>
    </form>
  )
}
