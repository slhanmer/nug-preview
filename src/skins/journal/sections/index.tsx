import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

import { aspectRatio, type BlockData } from '@/blocks/core'
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

function Section({
  children,
  inner = 'column',
  className,
}: {
  children: ReactNode
  inner?: 'column' | 'wide'
  className?: string
}) {
  return (
    <section className={`${styles.section} ${className ?? ''}`}>
      <div className={styles.inner}>
        {inner === 'wide' ? children : <div className={styles.column}>{children}</div>}
      </div>
    </section>
  )
}

function Photo({
  photo,
  sizes,
  priority,
  className,
}: {
  photo: Media
  sizes: string
  priority?: boolean
  className?: string
}) {
  return (
    /* Upload URLs are not known at build time; next/image needs a loader. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={photo.url ?? ''}
      srcSet={srcSet(photo)}
      sizes={sizes}
      alt={photo.alt ?? ''}
      {...(priority
        ? { fetchPriority: 'high' as const }
        : { loading: 'lazy' as const })}
      decoding="async"
    />
  )
}

/* -------------------------------------------------------------------- hero */

/**
 * WORDS FIRST, PHOTOGRAPH SECOND, and that inversion is the whole skin.
 *
 * Every other skin here opens with a photograph and puts the type on top of it,
 * in a panel, because a panel is the only way to make contrast measurable over
 * an image. It works, and it has the side effect that the first thing a reader
 * meets is a picture with a box on it.
 *
 * This opens with the sentence, set as large as the page can carry, on the
 * ground. There is no panel because there is nothing to sit on top of; the
 * contrast contract holds by construction rather than by judgement. The
 * photograph follows underneath at full bleed, carrying nothing — which is also
 * the only way to show a wide shot of a room full of people without cropping
 * the people out to make space for a heading.
 *
 * `layout` is ignored here on purpose: this skin has one opening and it is the
 * reason to choose it.
 */
export function Hero({ block }: { block: BlockData }) {
  const { eyebrow, heading, sub, image, primaryCta, secondaryCta } = block as HeroBlock
  const photo = asMedia(image)

  return (
    <section className={`${styles.section} ${styles.hero}`}>
      <div className={styles.inner}>
        <div className={styles.heroWords}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={`${styles.heading} ${styles.heroHeading}`}>{heading}</h1>
          {sub ? <p className={`${styles.lede} ${styles.heroSub}`}>{sub}</p> : null}
          <div className={styles.actions}>
            <Action cta={primaryCta} kind="primary" />
            <Action cta={secondaryCta} kind="secondary" />
          </div>
        </div>
      </div>

      {photo?.url ? (
        <div className={styles.heroMedia}>
          <Photo photo={photo} sizes={SIZES.full} priority />
        </div>
      ) : null}
    </section>
  )
}

/* ------------------------------------------------------------------- prose */

export function Prose({ block }: { block: BlockData }) {
  const { body } = block as ProseBlock
  return (
    <Section>
      <RichText value={body} className={styles.body} />
    </Section>
  )
}

/* -------------------------------------------------------------- mediaSplit */

/**
 * The picture runs off the edge of the page.
 *
 * A symmetrical two-up is the safe version and it is what the other skins do.
 * Here the image column extends past the measure to the viewport edge and the
 * words sit in a narrow column against it, so the page has a direction. `side`
 * decides which edge it escapes through.
 */
export function MediaSplit({ block }: { block: BlockData }) {
  const { heading, body, cta, image, side } = block as MediaSplitBlock
  const photo = asMedia(image)

  return (
    <section
      className={`${styles.section} ${styles.split} ${side === 'right' ? styles.splitRight : ''}`}
    >
      <div className={styles.splitInner}>
        <div className={styles.splitWords}>
          <h2 className={`${styles.heading} ${styles.splitHeading}`}>{heading}</h2>
          <RichText value={body} className={styles.body} />
          {cta?.label && cta.href ? (
            <p className={styles.splitAction}>
              <Link href={cta.href} className={styles.textLink}>
                {cta.label}
              </Link>
            </p>
          ) : null}
        </div>

        {photo?.url ? (
          <figure className={styles.splitMedia}>
            <Photo photo={photo} sizes={SIZES.half} />
          </figure>
        ) : null}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- featureGrid */

/**
 * An index, not a row of cards.
 *
 * Three equal boxes is the shape every template reaches for and the reason they
 * all look alike. A numbered list running the full width reads as something
 * someone wrote down in order, which is both more distinctive and more honest
 * about what these items are: not three equal pillars, a sequence.
 *
 * `layout` is deliberately unused. This skin has one arrangement for this block
 * and the numbering is the point of it.
 */
export function FeatureGrid({ block }: { block: BlockData }) {
  const { heading, intro, items } = block as FeatureGridBlock

  return (
    <Section inner="wide">
      {heading || intro ? (
        <div className={styles.head}>
          {heading ? <h2 className={`${styles.heading} ${styles.sectionHeading}`}>{heading}</h2> : null}
          {intro ? <p className={styles.lede}>{intro}</p> : null}
        </div>
      ) : null}

      <ol className={styles.index}>
        {items.map((item, i) => (
          <li key={item.id ?? i} className={styles.indexRow}>
            <span className={styles.indexNumber} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className={styles.indexBody}>
              <h3 className={styles.indexTitle}>{item.title}</h3>
              <p className={styles.indexText}>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/* ----------------------------------------------------------------- gallery */

type Shot = { key: string; url: string; alt: string; caption?: string | null; set?: string }

function shots(items: GalleryBlock['items']): Shot[] {
  return (items ?? []).flatMap((item, i) => {
    const photo = asMedia(item.image)
    if (!photo?.url) return []
    return [
      {
        key: String(item.id ?? i),
        url: photo.url,
        alt: photo.alt ?? '',
        caption: item.caption,
        set: srcSet(photo),
      },
    ]
  })
}

/**
 * Two arrangements, and `bento` is the one that does the work.
 *
 * `bento` is a STORY: three equal frames to a row, the ratio changing from one
 * row to the next so the page has a rhythm without any one photograph
 * outranking the others. It is for the six or so pictures that say where a
 * place is, who is in it and what they sell, near the top of a page, with the
 * captions doing the talking. The block's `aspect` is ignored here on purpose —
 * the alternation IS the arrangement, and one stated ratio would flatten it.
 *
 * Anything else staggers: an even grid of photographs is a contact sheet, every
 * frame the same size and none of them looked at. Pushing every second frame
 * down breaks the rows, which is what makes a set of phone photographs read as
 * a selection rather than a dump.
 */
export function Gallery({ block }: { block: BlockData }) {
  const { heading, intro, items, aspect, layout } = block as GalleryBlock
  const photos = shots(items)
  if (photos.length === 0) return null

  const story = layout === 'bento'
  const style = (story ? {} : { '--shot-aspect': aspectRatio(aspect) }) as CSSProperties

  return (
    <Section inner="wide">
      {heading || intro ? (
        <div className={styles.head}>
          {heading ? <h2 className={`${styles.heading} ${styles.sectionHeading}`}>{heading}</h2> : null}
          {intro ? <p className={styles.lede}>{intro}</p> : null}
        </div>
      ) : null}

      <div className={story ? styles.story : styles.stagger} style={style}>
        {photos.map((shot) => (
          <figure key={shot.key} className={styles.shot}>
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
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------- quote */

/**
 * The loudest thing on the page, and it is always somebody's sentence.
 *
 * No box, no rule, no quotation marks drawn in the corner — display type at
 * heading scale with the attribution small underneath. On a site whose argument
 * is "this is what the owner sounds like", the quote deserves more weight than
 * the section headings around it, not less.
 */
export function Quote({ block }: { block: BlockData }) {
  const { quote, attribution, role } = block as QuoteBlock

  return (
    <Section inner="wide">
      <figure className={styles.quote}>
        <blockquote className={styles.quoteText}>{quote}</blockquote>
        {attribution ? (
          <figcaption className={styles.quoteAttr}>
            {attribution}
            {role ? <span className={styles.quoteRole}>{role}</span> : null}
          </figcaption>
        ) : null}
      </figure>
    </Section>
  )
}

/* --------------------------------------------------------------- logoStrip */

export function LogoStrip({ block }: { block: BlockData }) {
  const { heading, items } = block as LogoStripBlock
  const logos = (items ?? []).flatMap((item) => {
    const photo = asMedia(item.logo)
    return photo?.url ? [photo] : []
  })
  if (logos.length === 0) return null

  return (
    <Section inner="wide">
      <div className={styles.strip}>
        {heading ? <p className={styles.stripHeading}>{heading}</p> : null}
        <div className={styles.stripItems}>
          {logos.map((logo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={logo.url ?? ''} alt={logo.alt ?? ''} loading="lazy" decoding="async" />
          ))}
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
      {heading ? <h2 className={`${styles.heading} ${styles.sectionHeading}`}>{heading}</h2> : null}
      <dl className={styles.faq}>
        {items.map((item, i) => (
          <div key={item.id ?? i} className={styles.faqItem}>
            <dt className={styles.faqQuestion}>{item.question}</dt>
            <dd className={styles.faqAnswer}>
              <RichText value={item.answer} className={styles.body} />
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

/* --------------------------------------------------------------------- cta */

export function Cta({ block }: { block: BlockData }) {
  const { heading, body, primaryCta, secondaryCta } = block as CtaBlock

  return (
    <section className={`${styles.section} ${styles.cta}`}>
      <div className={styles.inner}>
        <h2 className={`${styles.heading} ${styles.ctaHeading}`}>{heading}</h2>
        {body ? <p className={styles.ctaBody}>{body}</p> : null}
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
    <Section>
      <h2 className={`${styles.heading} ${styles.sectionHeading}`}>{heading}</h2>
      {body ? <p className={styles.lede}>{body}</p> : null}
      <ContactForm className={styles.contactForm} />
    </Section>
  )
}

/* ------------------------------------------------- module: menu (E8/menu) */

export { Menu } from './menu'
