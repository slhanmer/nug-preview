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

/*
 * Venue section renderers.
 *
 * Each narrows BlockData to its own generated type. That cast is the one place
 * the generated types are allowed into src/skins — it is local to a renderer,
 * so a skin swap cannot break it.
 */

/* ------------------------------------------------------------------ shared */

/**
 * Payload returns an upload as an id or, at depth >= 1, the populated doc.
 * Anything that renders an image has to cope with both.
 */
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

/**
 * Paragraphs only, deliberately.
 *
 * The seed writes plain paragraphs and this draws them without pulling in a
 * converter. A client writing headings, lists or links in the admin will get
 * them flattened — swapping this for Payload's Lexical React converter is a
 * known follow-up, not an oversight.
 */
function RichText({ value, className }: { value: unknown; className?: string }) {
  const root = (value as ProseBlock['body'] | undefined)?.root
  if (!root) return null

  const paragraphs = (root.children ?? []).map((node, i) => {
    const children = (node as { children?: { text?: string }[] }).children ?? []
    const text = children.map((c) => c.text ?? '').join('')
    return text ? <p key={i}>{text}</p> : null
  })

  return <div className={className}>{paragraphs}</div>
}

/*
 * `text` and `centred` both sit inside the wide container rather than centring
 * themselves on the page, so a column of prose starts on the same left edge as
 * the hero and the media splits. Two different centred measures on one page
 * read as a mistake even when both are deliberate.
 */
function Section({
  children,
  inner = 'wide',
  className,
}: {
  children: ReactNode
  inner?: 'wide' | 'text' | 'centred'
  className?: string
}) {
  return (
    <section className={`${styles.section} ${className ?? ''}`}>
      <div className={styles.wide}>
        {inner === 'wide' ? children : <div className={styles[inner]}>{children}</div>}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------- hero */

/*
 * Shared by every hero layout, so the priority hints are set once.
 *
 * The hero is the LCP element on any page that has one, so it is told so
 * rather than left to be guessed: without the hint the browser queues it
 * behind the stylesheet and the fonts, which is what Lighthouse reports as
 * "LCP request discovery". Never lazy, for the same reason.
 */
function HeroImage({
  photo,
  sizes = SIZES.full,
  className,
}: {
  photo: Media
  sizes?: string
  className?: string
}) {
  return (
    /* Upload URLs are not known at build time; next/image needs a loader first. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={photo.url ?? ''}
      srcSet={srcSet(photo)}
      sizes={sizes}
      alt={photo.alt ?? ''}
      fetchPriority="high"
      decoding="async"
    />
  )
}

/*
 * Four layouts, and the block has carried the field all along.
 *
 * This renderer used to draw `showcase` whatever the content asked for, which
 * meant a square or portrait photograph — which is what a cafe actually has,
 * because it came off Instagram — was cropped to a wide band and scaled up to
 * fill the screen. The picture goes soft and everyone blames the camera. The
 * service skin has had the other three for a while; this is the same set in
 * this skin's idiom, square rather than 4:5, unbordered rather than boxed.
 */
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
   * With no photograph this falls through to `plain` rather than to showcase:
   * an empty column is a visible layout fault, a missing background is an
   * invisible one, and the invisible one is worse to ship.
   */
  if (layout === 'split' && photo?.url) {
    return (
      <section className={`${styles.section} ${styles.heroSplit}`}>
        <div className={`${styles.wide} ${styles.heroSplitInner}`}>
          <div>{words}</div>
          <figure className={styles.heroSplitMedia}>
            <HeroImage photo={photo} sizes={SIZES.half} />
          </figure>
        </div>
      </section>
    )
  }

  /* The image alone, full width, carrying nothing. For a shop whose sign is
     the best thing it owns — which is more of them than have a good photo. */
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
        <div className={`${styles.wide} ${styles.text}`}>{words}</div>
      </section>
    )
  }

  return (
    <section className={`${styles.section} ${styles.hero}`}>
      <HeroImage photo={photo} className={styles.heroImage} />
      {/*
        A panel, not a scrim — the same call the service skin already made.

        A gradient heavy enough to guarantee the type washed out the
        photograph, and one light enough to leave the photograph alone did not
        carry the type. There is no setting between those two that is good,
        because contrast over an image cannot be measured at all. Text on
        --ground can be, and that is what the whole colour ladder rests on.
      */}
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
      <RichText value={body} className={`${styles.body} ${styles.lede}`} />
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
  const { heading, intro, items, layout } = block as FeatureGridBlock

  return (
    <Section>
      {heading || intro ? (
        <div className={styles.gridHead}>
          {heading ? <h2 className={`${styles.heading} ${styles.gridHeading}`}>{heading}</h2> : null}
          {intro ? <p className={styles.lede}>{intro}</p> : null}
        </div>
      ) : null}
      {/* Gaps scale with the measure. A wider page with the old gap reads as
          items that have drifted apart rather than a set that has room. */}
      <Arrangement layout={layout} min="18rem" gap="clamp(2rem, 4vw, 3.5rem)">
        {items.map((item, i) => (
          <div key={item.id ?? i} className={styles.card}>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardBody}>{item.body}</p>
          </div>
        ))}
      </Arrangement>
    </Section>
  )
}

/* ----------------------------------------------------------------- gallery */

/*
 * An upload that came back as a bare id has no url to draw, so it is dropped
 * rather than rendered as an empty frame. flatMap does the filtering and the
 * narrowing in one pass — the alternative is a type predicate or a non-null
 * assertion, and both promise the compiler something it can see for itself.
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
      {/*
        Bento needs the crop turned OFF, not set.

        Every other arrangement gives each cell the same width, so one ratio
        across the set is what makes a camera roll look deliberate. A bento
        deliberately gives them different widths — so the same ratio makes a
        wide cell twice as tall as a narrow one, and the row ends up with
        holes under the short ones. In a bento the cell decides the shape and
        the photograph fills it; `aspect` still governs every other layout.
      */}
      {/*
        22rem, not 17.

        auto-fit divides the measure by this, so the number IS the column
        count: at 17rem a 96rem page fitted five photographs across, which
        leaves a set of six as a row of five and an orphan, and makes each one
        small enough that nothing in it is legible. 22rem lands on three across
        at full width, two on a tablet and one on a phone.
      */}
      <Arrangement
        layout={layout}
        min="22rem"
        gap="clamp(1.5rem, 2.5vw, 2.5rem)"
        className={`${styles.gallery} ${layout === 'bento' ? styles.galleryBento : ''}`}
      >
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
    <Section inner="centred" className={styles.quote}>
      {/*
        No free-floating open-quote glyph above the text.

        It was decorative, but a lone “ over an unquoted sentence does not read
        as a flourish — it reads as punctuation someone forgot to close. The
        marks belong around the quotation, and CSS sets them as a real pair so
        they cannot get out of step with each other.
      */}
      <blockquote className={styles.quoteText}>{quote}</blockquote>
      {attribution || role ? (
        <p className={styles.quoteAttr}>{[attribution, role].filter(Boolean).join(' · ')}</p>
      ) : null}
    </Section>
  )
}

/* --------------------------------------------------------------- logoStrip */

export function LogoStrip({ block }: { block: BlockData }) {
  const { heading, items } = block as LogoStripBlock

  return (
    <Section className={styles.strip}>
      {heading ? <p className={styles.stripHeading}>{heading}</p> : null}
      <div className={styles.stripItems}>
        {items.map((item, i) => {
          const logo = asMedia(item.logo)
          if (!logo?.url) return null
          // eslint-disable-next-line @next/next/no-img-element
          const img = <img src={logo.url} alt={logo.alt ?? ''} />
          return (
            <span key={item.id ?? i}>
              {item.href ? <Link href={item.href}>{img}</Link> : img}
            </span>
          )
        })}
      </div>
    </Section>
  )
}

/* --------------------------------------------------------------------- faq */

export function Faq({ block }: { block: BlockData }) {
  const { heading, items } = block as FaqBlock

  return (
    <Section inner="text">
      {heading ? <h2 className={`${styles.heading} ${styles.faqHeading}`}>{heading}</h2> : null}
      {items.map((item, i) => (
        <details key={item.id ?? i} className={styles.faqItem}>
          <summary className={styles.faqQuestion}>{item.question}</summary>
          <RichText value={item.answer} className={styles.faqAnswer} />
        </details>
      ))}
    </Section>
  )
}

/* --------------------------------------------------------------------- cta */

export function Cta({ block }: { block: BlockData }) {
  const { heading, body, primaryCta, secondaryCta } = block as CtaBlock

  return (
    <section className={`${styles.section} ${styles.cta}`}>
      <div className={`${styles.wide} ${styles.centred}`}>
        <h2 className={`${styles.heading} ${styles.ctaHeading}`}>{heading}</h2>
        {body ? <p className={`${styles.lede} ${styles.ctaBody}`}>{body}</p> : null}
        <div className={styles.actions}>
          <Action cta={primaryCta} kind="primary" />
          <Action cta={secondaryCta} kind="secondary" />
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- contact */

export function Contact({ block }: { block: BlockData }) {
  const { heading, body } = block as ContactBlock

  return (
    <Section inner="text">
      <h2 className={`${styles.heading} ${styles.contactHeading}`}>{heading}</h2>
      {body ? <p className={`${styles.lede} ${styles.contactBody}`}>{body}</p> : null}
      <ContactForm className={styles.contactForm} />
    </Section>
  )
}

/* ------------------------------------------------- module: menu (E8/menu) */

export { Menu } from './menu'
