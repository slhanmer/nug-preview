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

import { Fade, type FadeShot } from './fade'
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
  inner = 'wide',
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

/**
 * A heading and its standfirst, centred, with the one rule of colour above it.
 *
 * The magenta tick is the only saturated mark most sections get. It is a
 * DECORATION, deliberately — the brand colour measures 4.40:1 as type on this
 * ground and is not allowed to be a word anywhere on the site, so the place it
 * goes is a 2.5rem line that carries no information.
 */
function Head({ heading, intro }: { heading?: string | null; intro?: string | null }) {
  if (!heading && !intro) return null
  return (
    <div className={styles.head}>
      <span className={styles.tick} aria-hidden="true" />
      {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
      {intro ? <p className={styles.lede}>{intro}</p> : null}
    </div>
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
      {...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
      decoding="async"
    />
  )
}

/* -------------------------------------------------------------------- hero */

/**
 * The photograph floats in a void, and the void is most of the screen.
 *
 * Every other skin here fills its opening: a photograph edge to edge, or a
 * panel of type over one. This one holds the image at about two fifths of the
 * width, lets it run off the right edge, and gives the rest to black.
 *
 * The move that makes it work is the MASK, in the stylesheet: the image is
 * faded out along its left and bottom edges so it has no findable boundary. A
 * near-black photograph on a near-black page still reads as a pasted rectangle
 * while it has corners; take the corners away and it reads as something lit in
 * a dark room, which is what the photograph actually is.
 *
 * `layout` is ignored on purpose. This skin has one opening and it is the
 * reason to pick it.
 */
export function Hero({ block }: { block: BlockData }) {
  const { eyebrow, heading, sub, image, primaryCta, secondaryCta } = block as HeroBlock
  const photo = asMedia(image)

  return (
    <section className={`${styles.section} ${styles.hero} ${photo?.url ? '' : styles.heroBare}`}>
      <div className={`${styles.inner} ${styles.heroInner}`}>
        <div className={styles.heroWords}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={`${styles.heading} ${styles.heroHeading}`}>{heading}</h1>
          {sub ? <p className={`${styles.lede} ${styles.heroSub}`}>{sub}</p> : null}
          <div className={styles.actions}>
            <Action cta={primaryCta} kind="primary" />
            <Action cta={secondaryCta} kind="secondary" />
          </div>
        </div>

        {photo?.url ? (
          <div className={styles.heroMedia}>
            <Photo photo={photo} sizes={SIZES.half} priority />
          </div>
        ) : null}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- prose */

export function Prose({ block }: { block: BlockData }) {
  const { body } = block as ProseBlock
  return (
    <Section inner="column">
      <RichText value={body} className={styles.body} />
    </Section>
  )
}

/* -------------------------------------------------------------- mediaSplit */

/**
 * Half photograph, half nothing much, and the photograph runs off the edge.
 *
 * Same mask trick as the hero, mirrored by `side`. The words sit in a narrow
 * column against the far gutter rather than filling their half, because a
 * paragraph set to the full width of a 42rem column next to a photograph is the
 * layout every template ships and it reads as a brochure.
 */
export function MediaSplit({ block }: { block: BlockData }) {
  const { heading, body, cta, image, side } = block as MediaSplitBlock
  const photo = asMedia(image)

  return (
    <section
      className={`${styles.section} ${styles.split} ${side === 'right' ? styles.splitRight : ''}`}
    >
      <div className={`${styles.inner} ${styles.splitInner}`}>
        <div className={styles.splitWords}>
          <span className={styles.tick} aria-hidden="true" />
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
 * Columns under hairlines. No cards, no icons, no boxes.
 *
 * A card is a container that says "these things are separate". On a page whose
 * whole argument is that one room, one bar and one kitchen are the same idea,
 * three boxes are three arguments against it. A rule over each column does the
 * same grouping job and adds nothing to the page.
 */
export function FeatureGrid({ block }: { block: BlockData }) {
  const { heading, intro, items } = block as FeatureGridBlock

  return (
    <Section>
      <Head heading={heading} intro={intro} />
      <div className={styles.columns}>
        {items.map((item, i) => (
          <div key={item.id ?? i} className={styles.col}>
            <h3 className={styles.colTitle}>{item.title}</h3>
            <p className={styles.colText}>{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ gallery */

function shots(items: GalleryBlock['items']): FadeShot[] {
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
 * Three arrangements, and `fade` is the one this skin was built around.
 *
 * `fade` — one frame, crossfading. See ./fade.tsx for why it exists.
 * `rail`  — scrolls sideways out through the right gutter, so the row visibly
 *           continues past the edge of the page rather than stopping politely
 *           inside the measure.
 * anything else — an even grid with a lot of air in it.
 */
export function Gallery({ block }: { block: BlockData }) {
  const { heading, intro, items, aspect, layout } = block as GalleryBlock
  const photos = shots(items)
  if (photos.length === 0) return null

  const ratio = aspectRatio(aspect)
  const style = { '--shot-aspect': ratio } as CSSProperties

  if (layout === 'fade') {
    /*
     * The head sits BESIDE the frames when there is one, so the narrow stack
     * does not leave half the page empty. Applied here rather than with :has()
     * so the single-child case never has to be reasoned about in CSS.
     */
    const beside = Boolean(heading || intro)
    return (
      <Section>
        <div className={beside ? styles.fadeLayout : undefined}>
          <Head heading={heading} intro={intro} />
          <Fade shots={photos} ratio={ratio} label={heading || 'Gallery'} />
        </div>
      </Section>
    )
  }

  return (
    <Section>
      <Head heading={heading} intro={intro} />
      <div className={layout === 'rail' ? styles.rail : styles.grid} style={style}>
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

export function Quote({ block }: { block: BlockData }) {
  const { quote, attribution, role } = block as QuoteBlock

  return (
    <Section>
      <figure className={styles.quote}>
        <span className={styles.tick} aria-hidden="true" />
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
    <Section>
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
      <Head heading={heading} />
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

/**
 * No filled band.
 *
 * Every other skin signs off with a block of brand colour across the page. On a
 * dark ground the only fill available is the pale one, and a band of near-white
 * at the bottom of this page is a light switch being thrown in a dim room. So
 * the close is the same black with a rule across the top of it, and the one
 * bright object is the button.
 */
export function Cta({ block }: { block: BlockData }) {
  const { heading, body, primaryCta, secondaryCta } = block as CtaBlock

  return (
    <section className={`${styles.section} ${styles.cta}`}>
      <div className={styles.inner}>
        <span className={styles.tick} aria-hidden="true" />
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
    <Section inner="column">
      <span className={styles.tick} aria-hidden="true" />
      <h2 className={`${styles.heading} ${styles.sectionHeading}`}>{heading}</h2>
      {body ? <p className={styles.lede}>{body}</p> : null}
      <ContactForm className={styles.contactForm} />
    </Section>
  )
}

/* ------------------------------------------------- module: menu (E8/menu) */

export { Menu } from './menu'
