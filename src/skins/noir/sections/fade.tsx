'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'

import { SIZES } from '@/lib/images'

import styles from './sections.module.css'

export type FadeShot = {
  key: string
  url: string
  alt: string
  caption?: string | null
  set?: string
}

/**
 * Frames held in one place, crossfading.
 *
 * The ONLY client component in this skin, and it earns that by doing something
 * a static page cannot: three photographs of the same bottle in the same hand
 * against the same wall are not a gallery — laid out side by side the eye is
 * being asked to compare things it can already see are identical, and the one
 * thing that actually differs (the label) is the smallest part of each frame.
 * Stacked and crossfaded, nothing moves except that label, so the label becomes
 * the subject. This is why `layout: 'fade'` exists at all.
 *
 * It only works if the source frames REGISTER. That is a cropping job, not a
 * code one, and it is done in the asset pack: each frame is cropped relative to
 * the subject's own position and size so all of them land it identically. Feed
 * this three loosely-framed photographs and it reads as a broken slideshow.
 */
export function Fade({
  shots,
  ratio,
  interval = 3000,
  label,
}: {
  shots: FadeShot[]
  ratio: string
  interval?: number
  label: string
}) {
  const [active, setActive] = useState(0)
  /*
   * Stops the timer being restarted on every tick. `active` must not be in the
   * effect's deps or each advance tears down the interval and starts a fresh
   * one, which quietly turns the delay into "interval, measured from whenever
   * React last committed".
   */
  const count = shots.length
  const paused = useRef(false)

  useEffect(() => {
    if (count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      if (!paused.current) setActive((n) => (n + 1) % count)
    }, interval)
    return () => window.clearInterval(id)
  }, [count, interval])

  return (
    <div
      className={styles.fade}
      style={{ '--fade-ratio': ratio } as CSSProperties}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => {
        paused.current = true
      }}
      onMouseLeave={() => {
        paused.current = false
      }}
    >
      <div className={styles.fadeStack}>
        {shots.map((shot, i) => (
          <figure
            key={shot.key}
            className={styles.fadeFrame}
            data-active={i === active ? '' : undefined}
            aria-hidden={i === active ? undefined : true}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.url}
              srcSet={shot.set}
              sizes={SIZES.half}
              alt={shot.alt}
              /*
               * All of them eager. A lazy frame two positions ahead has not
               * loaded when its turn comes and the crossfade lands on nothing —
               * and these are three small images, which is the entire budget
               * this block was going to spend anyway.
               */
              decoding="async"
            />
          </figure>
        ))}
      </div>

      {count > 1 ? (
        <div className={styles.fadeTicks}>
          {shots.map((shot, i) => (
            <button
              key={shot.key}
              type="button"
              className={styles.fadeTick}
              data-active={i === active ? '' : undefined}
              aria-label={shot.caption || shot.alt || `Frame ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      ) : null}

      {/*
       * One caption element that swaps its text, not one per frame. A stack of
       * absolutely-positioned captions has no height of its own, so the block
       * below it jumps by a line every time a longer caption comes round.
       */}
      {shots.some((s) => s.caption) ? (
        <p className={styles.fadeCaption} aria-live="polite">
          {shots[active]?.caption ?? ''}
        </p>
      ) : null}
    </div>
  )
}
