import type { BlockData } from '@/blocks/core'

/*
 * Base skin section renderers.
 *
 * These are deliberately plain. The base skin exists to prove the seam and to
 * be the thing other skins are judged against — it is not a design. Real
 * renderers land in E5; these keep the registry honest until then.
 *
 * They are still token-driven, because a stub that hardcodes a colour teaches
 * the wrong habit and would fail the contrast contract silently.
 */

function Section({ label, block }: { label: string; block: BlockData }) {
  const skip = new Set(['blockType', 'id', 'blockName'])
  const fields = Object.keys(block).filter((k) => !skip.has(k))
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge)',
        borderRadius: 8,
        padding: '20px 24px',
        margin: '16px 0',
      }}
    >
      <p
        style={{
          margin: 0,
          color: 'var(--text-muted)',
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      {fields.length > 0 && (
        <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
          {fields.join(', ')}
        </p>
      )}
    </section>
  )
}

export const Hero = ({ block }: { block: BlockData }) => <Section label="hero" block={block} />
export const Prose = ({ block }: { block: BlockData }) => <Section label="prose" block={block} />
export const FeatureGrid = ({ block }: { block: BlockData }) => (
  <Section label="feature grid" block={block} />
)
export const MediaSplit = ({ block }: { block: BlockData }) => (
  <Section label="media split" block={block} />
)
export const Gallery = ({ block }: { block: BlockData }) => <Section label="gallery" block={block} />
export const Quote = ({ block }: { block: BlockData }) => <Section label="quote" block={block} />
export const LogoStrip = ({ block }: { block: BlockData }) => (
  <Section label="logo strip" block={block} />
)
export const Cta = ({ block }: { block: BlockData }) => <Section label="cta" block={block} />
export const Faq = ({ block }: { block: BlockData }) => <Section label="faq" block={block} />
export const Contact = ({ block }: { block: BlockData }) => (
  <Section label="contact" block={block} />
)
