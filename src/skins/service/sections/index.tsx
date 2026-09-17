import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

import { aspectRatio, type BlockData } from '@/blocks/core'
import { Arrangement } from '@/components/layout'
import { ContactForm } from '@/features/contact'
import { SIZES, srcSet } from '@/lib/images'
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

/** Paragraphs only — same limitation as the venue skin, same follow-up. */
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

function Section({
  children,
  inner = 'wide',
  className,
}: {
  children: ReactNode
  inner?: 'wide' | 'text'
  className?: string
}) {
  return (
    <section className={`${styles.section} ${className ?? ''}`}>
      <div className={styles.wide}>
        {inner === 'wide' ? children : <div className={styles.text}>{children}</div>}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------- hero */

/*
 * The hero photograph, in whichever layout wants it.
 *
 * One component because the priority hints are the point and three copies is
 * three chances to leave one off. The hero is the LCP element on every page
 * that has one, so it says so rather than being guessed at — without the hint
 * the browser queues it at default priority behind the stylesheet and the
 * fonts, which is what Lighthouse reports as "LCP request discovery".
 *
 * Never `loading="lazy"` here: lazy on the element that IS the largest
 * contentful paint delays the metric it is measured by.
 */
/*
 * Class lookups as explicit maps, not template literals.
 *
 * `styles[`tone-${x}`]` compiles, runs, and silently produces nothing if the
 * class is named differently in the stylesheet — a CSS Module's type is an
 * index signature, so a wrong key is `undefined` at runtime rather than an
 * error at build. components/layout has the same maps for the same reason and
 * its comment says it was caught the hard way. Written out, a rename breaks
 * the build instead of quietly removing a colour.
 */
const TONE = {
  none: '',
  accent: styles.toneAccent,
  third: styles.toneThird,
  brand: styles.toneBrand,
} satisfies Record<string, string | undefined>

const MEDIA = {
  top: styles.mediaTop,
  bottom: styles.mediaBottom,
  left: styles.mediaLeft,
  right: styles.mediaRight,
} satisfies Record<string, string | undefined>

function HeroImage({ photo, sizes = SIZES.full }: { photo: Media; sizes?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.url ?? ''}
      srcSet={srcSet(photo)}
      sizes={sizes}
      alt={photo.alt ?? ''}
      fetchPriority="high"
      decoding="async"
    />
  )
}

export function Hero({ block }: { block: BlockData }) {
  const { eyebrow, heading, sub, image, layout, primaryCta, secondaryCta } = block as HeroBlock
  const photo = asMedia(image)

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
   * Split, and it falls back to split rather than to showcase when there is no
   * photograph — an empty column is a layout problem, a missing background is
   * an invisible one, so the grid collapses to one column instead.
   */
  if (layout === 'split' && photo?.url) {
    return (
      <section className={`${styles.section} ${styles.heroSplit}`}>
        <div className={`${styles.wide} ${styles.heroSplitInner}`}>
          <div className={styles.heroSplitWords}>{words}</div>
          <div className={styles.heroSplitMedia}>
            <HeroImage photo={photo} sizes={SIZES.half} />
          </div>
        </div>
      </section>
    )
  }

  /*
   * The image alone, full width, with nothing over it. For a shop whose sign
   * is the best thing it owns — which is most of them.
   */
  if (layout === 'mark' && photo?.url) {
    return (
      <section className={`${styles.section} ${styles.heroMark}`}>
        <div className={styles.heroMarkMedia}>
          <HeroImage photo={photo} />
        </div>
        <div className={`${styles.wide} ${styles.heroMarkWords}`}>{words}</div>
      </section>
    )
  }

  if (layout === 'plain' || !photo?.url) {
    return (
      <section className={`${styles.section} ${styles.heroPlain}`}>
        <div className={`${styles.wide} ${styles.heroPlainInner}`}>{words}</div>
      </section>
    )
  }

  return (
    <section className={`${styles.section} ${styles.hero}`}>
      <div className={styles.heroMedia}>
        <HeroImage photo={photo} />
      </div>
      <div className={`${styles.wide} ${styles.heroInner}`}>
        <div className={styles.heroCard}>{words}</div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- prose */

export function Prose({ block }: { block: BlockData }) {
  const { body } = block as ProseBlock
  return (
    <Section inner="text">
      <RichText value={body} className={styles.body} />
    </Section>
  )
}

/* -------------------------------------------------------------- mediaSplit */

export function MediaSplit({ block }: { block: BlockData }) {
  const { heading, body, image, side, cta } = block as MediaSplitBlock
  const photo = asMedia(image)

  return (
    <Section>
      <div className={`${styles.split} ${side === 'right' ? styles.splitRight : ''}`}>
        <div className={styles.splitMedia}>
          {photo?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.url}
              srcSet={srcSet(photo)}
              sizes={SIZES.half}
              alt={photo.alt ?? ''}
              loading="lazy"
              decoding="async"
            />
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
    </Section>
  )
}

/* ------------------------------------------------------------- featureGrid */

export function FeatureGrid({ block }: { block: BlockData }) {
  const { heading, intro, items, layout, frame } = block as FeatureGridBlock

  /*
   * Bento wants bigger cells and more air than a plain grid: the whole point
   * is cards of unequal width, and at a 15rem minimum the wide ones stop being
   * noticeably wider than the narrow ones.
   */
  const bento = layout === 'bento'

  return (
    <Section>
      {heading || intro ? (
        <div className={styles.gridHead}>
          {heading ? <h2 className={`${styles.heading} ${styles.gridHeading}`}>{heading}</h2> : null}
          {intro ? <p className={styles.lede}>{intro}</p> : null}
        </div>
      ) : null}
      <Arrangement
        layout={layout}
        min={bento ? '18rem' : '15rem'}
        gap={bento ? 'clamp(1rem, 2vw, 1.5rem)' : '1rem'}
        className={bento ? styles.bentoCards : undefined}
      >
        {items.map((item, i) => {
          const photo = asMedia(item.image)
          const classes = [styles.card, TONE[item.tone ?? 'none'], photo?.url ? MEDIA[item.media ?? 'top'] : '']
            .filter(Boolean)
            .join(' ')

          return (
            <div key={item.id ?? i} className={classes}>
              {photo?.url ? (
                <div className={frame === 'mat' ? styles.cardMat : styles.cardMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    srcSet={srcSet(photo)}
                    sizes={SIZES.cell}
                    alt={photo.alt ?? ''}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ) : null}
              <div className={styles.cardWords}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardBody}>{item.body}</p>
                {item.href ? (
                  <Link href={item.href} className={styles.cardLink}>
                    {item.linkLabel || 'Learn more'}
                  </Link>
                ) : null}
              </div>
            </div>
          )
        })}
      </Arrangement>
    </Section>
  )
}

/* ----------------------------------------------------------------- gallery */

/*
 * An upload that came back as a bare id has no url to draw, so it is dropped
 * rather than rendered as an empty frame. flatMap does the filtering and the
 * narrowing in one pass — the alternative is a type predicate or a non-null
 * assertion, and both are ways of promising the compiler something it can see
 * for itself here.
 */
type Shot = {
  key: string | number
  url: string
  set?: string
  alt: string
  caption?: string | null
}

function shots(items: GalleryBlock['items']): Shot[] {
  return items.flatMap((item, i) => {
    const photo = asMedia(item.image)
    if (!photo?.url) return []
    return [
      {
        key: item.id ?? i,
        url: photo.url,
        set: srcSet(photo),
        alt: photo.alt ?? '',
        caption: item.caption,
      },
    ]
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
    <Section>
      {heading || intro ? (
        <div className={styles.gridHead}>
          {heading ? <h2 className={`${styles.heading} ${styles.gridHeading}`}>{heading}</h2> : null}
          {intro ? <p className={styles.lede}>{intro}</p> : null}
        </div>
      ) : null}
      <Arrangement layout={layout} min="13rem" gap="0.75rem" className={styles.gallery}>
        {photos.map((shot) => (
          <figure key={shot.key} className={styles.shot} style={style}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.url}
              srcSet={shot.set}
              sizes={SIZES.cell}
              alt={shot.alt}
              loading="lazy"
              decoding="async"
            />
            {shot.caption ? (
              <figcaption className={styles.shotCaption}>{shot.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </Arrangement>
    </Section>
  )
}

/* ------------------------------------------------------------------- quote */

export function Quote({ block }: { block: BlockData }) {
  const { quote, attribution, role } = block as QuoteBlock

  return (
    <Section>
      <figure className={styles.quoteCard}>
        <blockquote className={styles.quoteText}>{quote}</blockquote>
        {attribution || role ? (
          <figcaption className={styles.quoteAttr}>
            {[attribution, role].filter(Boolean).join(' — ')}
          </figcaption>
        ) : null}
      </figure>
    </Section>
  )
}

/* --------------------------------------------------------------- logoStrip */

export function LogoStrip({ block }: { block: BlockData }) {
  const { heading, items } = block as LogoStripBlock

  return (
    <Section>
      <div className={styles.strip}>
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
      </div>
    </Section>
  )
}

/* --------------------------------------------------------------------- faq */

export function Faq({ block }: { block: BlockData }) {
  const { heading, items } = block as FaqBlock

  return (
    <Section>
      {heading ? <h2 className={`${styles.heading} ${styles.faqHeading}`}>{heading}</h2> : null}
      <div className={styles.faqList}>
        {items.map((item, i) => (
          <details key={item.id ?? i} className={styles.faqItem}>
            <summary className={styles.faqQuestion}>{item.question}</summary>
            <RichText value={item.answer} className={styles.faqAnswer} />
          </details>
        ))}
      </div>
    </Section>
  )
}

/* --------------------------------------------------------------------- cta */

export function Cta({ block }: { block: BlockData }) {
  const { heading, body, primaryCta } = block as CtaBlock

  return (
    <section className={`${styles.section} ${styles.cta}`}>
      <div className={`${styles.wide} ${styles.ctaInner}`}>
        <div>
          <h2 className={`${styles.heading} ${styles.ctaHeading}`}>{heading}</h2>
          {body ? <p className={styles.ctaBody}>{body}</p> : null}
        </div>
        {primaryCta?.label && primaryCta.href ? (
          <Link href={primaryCta.href} className={styles.ctaAction}>
            {primaryCta.label}
          </Link>
        ) : null}
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- contact */

export function Contact({ block }: { block: BlockData }) {
  const { heading, body } = block as ContactBlock

  return (
    <Section>
      <div className={styles.contactCard}>
        <h2 className={`${styles.heading} ${styles.contactHeading}`}>{heading}</h2>
        {body ? <p className={`${styles.lede} ${styles.contactBody}`}>{body}</p> : null}
        <ContactForm className={styles.contactForm} />
      </div>
    </Section>
  )
}

export { Menu } from './menu'
export { Shop } from './shop'
