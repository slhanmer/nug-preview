'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

import styles from './contact-form.module.css'

/*
 * A literal member access on process.env, deliberately. Next substitutes this
 * exact expression at build time; `process.env[name]` is NOT substituted and
 * comes back undefined in the browser, which is the usual reason a Turnstile
 * widget works locally and silently never appears in production.
 *
 * The corollary is that the value has to exist when the bundle is BUILT — an
 * env var added to the host afterwards does nothing until the next deploy.
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export type TurnstileProps = {
  /** Cloudflare's own values. `auto` follows the visitor's device. */
  theme?: 'auto' | 'light' | 'dark'
}

/**
 * The visible half of the spam check.
 *
 * Explicit rendering rather than the `cf-turnstile` class, so the widget's
 * lifetime is React's: it is created when this mounts and removed when it
 * unmounts. That matters because the token is single use — after a rejected
 * submit the form remounts under a new key, and a widget tied to the DOM class
 * would still be holding the spent token.
 *
 * On success the script injects a hidden `cf-turnstile-response` input into the
 * enclosing form, which is how the token reaches the server action.
 */
export function Turnstile({ theme = 'auto' }: TurnstileProps) {
  const holder = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const api = window.turnstile
    const element = holder.current
    if (!ready || !api || !element || widget.current) return

    widget.current = api.render(element, { sitekey: SITE_KEY, theme, action: 'contact' })

    return () => {
      if (!widget.current) return
      api.remove(widget.current)
      widget.current = null
    }
  }, [ready, theme])

  if (!SITE_KEY) {
    // Loud in development, silent in production — a visitor should not be shown
    // our configuration. The server action logs it either way, and refuses.
    if (process.env.NODE_ENV === 'production') return null
    return (
      <p className={styles.configNote} role="status">
        NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set, so the spam check cannot render and every
        submission will be refused. Cloudflare&rsquo;s always-passes test key is in .env.example.
      </p>
    )
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        // onReady rather than onLoad: it fires on every mount, including the
        // ones where the script is already in the document from a prior render.
        onReady={() => setReady(true)}
      />
      <div ref={holder} className={styles.turnstile} />
    </>
  )
}
