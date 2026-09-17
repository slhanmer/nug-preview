import type { ReactNode } from 'react'

export function Header() {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--edge)',
        color: 'var(--text-primary)',
      }}
    >
      <strong>Base skin</strong>
      <nav style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
        <span>Nav</span>
        <span>comes</span>
        <span>from config</span>
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--edge)',
        marginTop: 32,
        padding: '16px 24px',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}
    >
      Footer
    </footer>
  )
}

/*
 * No data-tokens here.
 *
 * tokens.css declares its INPUTS in the same `:root, [data-tokens]` rule as the
 * derivations, so an element carrying the attribute resets brand and ground back
 * to the stylesheet defaults — throwing away whatever site.config put on <html>.
 * The attribute is for the Palette studio, which shows several palettes at once.
 * A rendered page has one palette and it lives on :root.
 */
export function Page({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--ground)',
        color: 'var(--text-primary)',
        minHeight: '100dvh',
        padding: '0 24px',
      }}
    >
      {children}
    </div>
  )
}
