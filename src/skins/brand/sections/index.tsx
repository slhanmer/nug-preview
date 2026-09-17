import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

import { aspectRatio, type BlockData } from '@/blocks/core'
import { Arrangement } from '@/components/layout'
import { ContactForm } from '@/features/contact'
import type {
  ContactBlock,
  CtaBlock,
  FaqBlock,
  FeatureGridBlock,
  GalleryBlock,
  HeroBlock,
  LogoStripBlock,
  Media,
  MediaSplitBlock,
  ProseBlock,
  QuoteBlock,
} from '@/payload-types'

import styles from './sections.module.css'

/* ------------------------------------------------------------------ shared */

function asMedia(value: unknown): Media | null {
  return value && typeof value === 'object' && 'url' in value ? (value as Media) : null
}

type Cta = { label?: string | null; href?: string | null } | null | undefined

function Action({ cta, kind }: { cta: Cta; kind: 'primary' | 'secondary' }) {
  if (!cta?.label || !cta.href) return null
  return (
    <Link href={cta.href} className={styles[kind]}>
      {cta.label}
    </Link>
  )
}

/** Paragraphs only — same limitation as the other skins, same follow-up. */
function RichText({ value, className }: { value: unknown; className?: string }) {
  const root = (value as ProseBlock['body'] | undefined)?.root
  if (!root) return null

  return (
    <div className={className}>
      {(root.children ?? []).map((node, i) => {
        const children = (node as { children?: { text?: string }[] }).children ?? []
        const text = children.map((c) => c.text ?? '').join('')
        return text ? <p key={i}>{text}</p> : null
      })}
    </div>
  )
}

/*
 * The band a block paints on is decided by its TYPE, not its position.
 *
 * A renderer receives its own data and nothing else — no siblings, no index —
 * which is what lets a client reorder freely. The cost is that two blocks of
 * the same tone can end up adjacent. A designer would alternate by position;
 * that would mean giving renderers page context, and the price of that is
 * higher than the occasional repeated band.
 */
type Tone = 'ground' | 'surface' | 'fill' | 'alt'

const TONE_CLASS = {
  ground: '',
  surface: styles.bandSurface,
  fill: styles.bandFill,
  alt: styles.bandAlt,
} satisfies Record<Tone, string | undefined>

function Band({
  children,
  tone = 'ground',
  centred,
  className,
}: {
  children: ReactNode
  tone?: Tone
  centred?: boolean
  className?: string
}) {
  const toneClass = TONE_CLASS[tone] ?? ''
  return (
    <section className={`${styles.band} ${toneClass} ${className ?? ''}`}>
      <div className={styles.inner}>
        {centred ? <div className={styles.centred}>{children}</div> : children}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------- hero */

export function Hero({ block }: { block: BlockData }) {
  const { eyebrow, heading, sub, image, layout, primaryCta, secondaryCta } = block as HeroBlock
  const photo = asMedia(image)
  const url = layout === 'plain' ? null : photo?.url

  const words = (
    <>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h1 className={`${styles.heading} ${styles.heroHeading}`}>{heading}</h1>
      {sub ? <p className={`${styles.lede} ${styles.heroSub}`}>{sub}</p> : null}
      <div className={styles.actions}>
        <Action cta={primaryCta} kind="primary" />
        <Action cta={secondaryCta} kind="secondary" />
      </div>
    </>
  )

  /*
   * Type one side, photograph the other — and the only place this skin breaks
   * its own centring rule. See the CSS: it is a resolution decision, not a
   * taste one.
   */
  if (layout === 'split' && url) {
    return (
      <section className={`${styles.band} ${styles.hero} ${styles.heroSplit}`}>
        <div className={`${styles.inner} ${styles.heroSplitGrid}`}>
          <div>{words}</div>
          <div className={styles.heroSplitMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={photo?.alt ?? ''} />
          </div>
        </div>
      </section>
    )
  }

  /* The photograph and the type kept apart, rather than one over the other. */
  if (layout === 'mark' && url) {
    return (
      <section className={`${styles.band} ${styles.hero} ${styles.heroMark}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.heroMarkImage} src={url} alt={photo?.alt ?? ''} />
        <div className={styles.heroMarkBody}>
          <div className={`${styles.inner} ${styles.centred}`}>{words}</div>
        </div>
      </section>
    )
  }

  return (
    <section className={`${styles.band} ${styles.hero} ${url ? '' : styles.heroPlain}`}>
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.heroImage} src={url} alt={photo?.alt ?? ''} />
          <div className={styles.heroScrim} />
        </>
      ) : null}
      <div className={`${styles.inner} ${styles.heroInner} ${styles.centred}`}>{words}</div>
    </section>
  )
}

/* ------------------------------------------------------------------- prose */

export function Prose({ block }: { block: BlockData }) {
  const { body } = block as ProseBlock
  return (
    <Band centred>
      <RichText value={body} className={`${styles.body} ${styles.lede}`} />
    </Band>
  )
}

/* -------------------------------------------------------------- mediaSplit */

export function MediaSplit({ block }: { block: BlockData }) {
  const { heading, body, image, side, cta } = block as MediaSplitBlock
  const photo = asMedia(image)

  return (
    <Band tone="surface">
      <div className={`${styles.split} ${side === 'right' ? styles.splitRight : ''}`}>
        <div className={styles.splitMedia}>
          {photo?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.url} alt={photo.alt ?? ''} />
          ) : null}
        </div>
        <div>
          <h2 className={`${styles.heading} ${styles.splitHeading}`}>{heading}</h2>
          <RichText value={body} className={styles.body} />
          {cta?.label && cta.href ? (
            <div className={styles.actions}>
              <Action cta={cta} kind="secondary" />
            </div>
          ) : null}
        </div>
      </div>
    </Band>
  )
}

/* ------------------------------------------------------------- featureGrid */

/*
 * The wheel, in order. Five because that is how many distinct hues fit around
 * the circle before two of them start reading as the same colour; a sixth card
 * comes back to the first, which is a repeat rather than a near-miss.
 */
const POPS = ['var(--pop-1)', 'var(--pop-2)', 'var(--pop-3)', 'var(--pop-4)', 'var(--pop-5)']

export function FeatureGrid({ block }: { block: BlockData }) {
  const { heading, intro, items, layout, frame, image } = block as FeatureGridBlock
  const disc = frame === 'disc'
  /*
   * Stacked, with a disc, is a NAVIGATION rather than a grid of features: the
   * marker goes beside the words instead of above them and the title carries
   * the weight. Same block, same data, read as a list of doors.
   */
  const asList = layout === 'stack' && disc
  const aside = asMedia(image)

  const grid = (
    <Arrangement
      layout={layout}
      min="14rem"
      gap={asList ? 'clamp(1.25rem, 3vw, 2rem)' : 'clamp(2rem, 4vw, 3.5rem)'}
      className={`${styles.grid} ${asList ? styles.gridList : ''}`}
    >
      {items.map((item, i) => {
        const photo = asMedia(item.image)
        const style = disc ? ({ '--pop': POPS[i % POPS.length] } as CSSProperties) : undefined

        const body = (
          <>
            {photo?.url ? (
              <div className={`${styles.cardMedia} ${disc ? styles.frameDisc : ''}`} style={style}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.alt ?? ''} loading="lazy" />
              </div>
            ) : (
              /* The number is the card's marker when it has no picture. Two
                 markers on one card is one too many. */
              <p className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</p>
            )}
            <div className={styles.cardWords}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardBody}>{item.body}</p>
              {item.href ? (
                <p className={styles.cardLink}>
                  <span>{item.linkLabel || 'Learn more'}</span>
                </p>
              ) : null}
            </div>
          </>
        )

        /*
         * The WHOLE card is the link when it has one. A small label under a
         * paragraph is a target you have to aim at, and on a card whose point
         * is the picture it also reads as though the picture is decoration.
         * A card that cannot be linked to cannot be ranked for either — the
         * reason the field is on the block at all.
         */
        return item.href ? (
          <Link key={item.id ?? i} href={item.href} className={styles.card}>
            {body}
          </Link>
        ) : (
          <div key={item.id ?? i} className={styles.card}>
            {body}
          </div>
        )
      })}
    </Arrangement>
  )

  return (
    <Band>
      {heading || intro ? (
        <div className={styles.centred}>
          {heading ? <h2 className={`${styles.heading} ${styles.gridHeading}`}>{heading}</h2> : null}
          {intro ? <p className={styles.lede}>{intro}</p> : null}
        </div>
      ) : null}
      {aside?.url ? (
        <div className={styles.gridWithMedia}>
          {grid}
          <div className={styles.gridMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aside.url} alt={aside.alt ?? ''} />
          </div>
        </div>
      ) : (
        grid
      )}
    </Band>
  )
}

/* ----------------------------------------------------------------- gallery */

/*
 * An upload that came back as a bare id has no url to draw, so it is dropped
 * rather than rendered as an empty frame. flatMap does the filtering and the
 * narrowing in one pass — the alternative is a type predicate or a non-null
 * assertion, and both promise the compiler something it can see for itself.
 */
type Shot = { key: string | number; url: string; alt: string; caption?: string | null }

function shots(items: GalleryBlock['items']): Shot[] {
  return items.flatMap((item, i) => {
    const photo = asMedia(item.image)
    if (!photo?.url) return []
    return [{ key: item.id ?? i, url: photo.url, alt: photo.alt ?? '', caption: item.caption }]
  })
}

export function Gallery({ block }: { block: BlockData }) {
  const { heading, intro, items, layout, aspect } = block as GalleryBlock
  const photos = shots(items)
  if (photos.length === 0) return null

  /* One ratio for the whole set — the crop is what makes a camera roll look
     deliberate, so it is set on the section rather than per photograph. */
  const style = { '--shot-aspect': aspectRatio(aspect) } as CSSProperties

  return (
    <Band tone="surface">
      <div className={styles.centred}>
        {heading ? <h2 className={`${styles.heading} ${styles.gridHeading}`}>{heading}</h2> : null}
        {intro ? <p className={styles.lede}>{intro}</p> : null}
      </div>
      <Arrangement layout={layout} min="14rem" gap="0.25rem" className={styles.gallery}>
        {photos.map((shot) => (
          <figure key={shot.key} className={styles.shot} style={style}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.url} alt={shot.alt} loading="lazy" />
            {shot.caption ? (
              <figcaption className={styles.shotCaption}>{shot.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </Arrangement>
    </Band>
  )
}

/* ------------------------------------------------------------------- quote */

export function Quote({ block }: { block: BlockData }) {
  const { quote, attribution, role } = block as QuoteBlock

  /*
   * The ink, because the type-only hero above it is already the alt plane and
   * two of the same colour running down one page is a repeat rather than a
   * rhythm. Orange, ink, paper, orange, ink.
   */
  return (
    <Band tone="fill" centred>
      <blockquote className={styles.quoteText}>{quote}</blockquote>
      {attribution || role ? (
        <p className={styles.quoteAttr}>{[attribution, role].filter(Boolean).join(' · ')}</p>
      ) : null}
    </Band>
  )
}

/* --------------------------------------------------------------- logoStrip */

export function LogoStrip({ block }: { block: BlockData }) {
  const { heading, items } = block as LogoStripBlock

  return (
    <Band tone="surface">
      {heading ? <p className={styles.stripHeading}>{heading}</p> : null}
      <div className={styles.stripItems}>
        {items.map((item, i) => {
          const logo = asMedia(item.logo)
          if (!logo?.url) return null
          // eslint-disable-next-line @next/next/no-img-element
          const img = <img src={logo.url} alt={logo.alt ?? ''} />
          return (
            <span key={item.id ?? i}>{item.href ? <Link href={item.href}>{img}</Link> : img}</span>
          )
        })}
      </div>
    </Band>
  )
}

/* --------------------------------------------------------------------- faq */

export function Faq({ block }: { block: BlockData }) {
  const { heading, items } = block as FaqBlock

  return (
    <Band tone="surface" centred>
      {heading ? <h2 className={`${styles.heading} ${styles.faqHeading}`}>{heading}</h2> : null}
      <div style={{ textAlign: 'start' }}>
        {items.map((item, i) => (
          <details key={item.id ?? i} className={styles.faqItem}>
            <summary className={styles.faqQuestion}>{item.question}</summary>
            <RichText value={item.answer} className={styles.faqAnswer} />
          </details>
        ))}
      </div>
    </Band>
  )
}

/* --------------------------------------------------------------------- cta */

export function Cta({ block }: { block: BlockData }) {
  const { heading, body, primaryCta, secondaryCta } = block as CtaBlock

  /*
   * The alt plane, not the fill — so the page's last band is the brand's loud
   * colour and the footer's fill reads as the end rather than as a repeat.
   */
  return (
    <Band tone="alt" centred>
      <h2 className={`${styles.heading} ${styles.ctaHeading}`}>{heading}</h2>
      {body ? <p className={`${styles.lede} ${styles.ctaBody}`}>{body}</p> : null}
      <div className={styles.actions}>
        <Action cta={primaryCta} kind="primary" />
        <Action cta={secondaryCta} kind="secondary" />
      </div>
    </Band>
  )
}

/* ----------------------------------------------------------------- contact */

export function Contact({ block }: { block: BlockData }) {
  const { heading, body } = block as ContactBlock

  return (
    <Band centred>
      <h2 className={`${styles.heading} ${styles.contactHeading}`}>{heading}</h2>
      {body ? <p className={`${styles.lede} ${styles.contactBody}`}>{body}</p> : null}
      <ContactForm className={styles.contactForm} />
    </Band>
  )
}

export { Menu } from './menu'
