import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect, useMemo, useRef, useState } from 'react'

import { deriveGrounds, fitFill, hexToOklch, type Oklch, oklchToHex } from '@/lib/brand'
import { contrastRatio, cssColorToRgb, resolveToken } from '@/lib/contrast'
import { contrastContract, type Requirement } from '@/styles/roles'

type Measured = Requirement & { ratio: number | null }

/** Every token a site actually consumes, in the order it makes sense to read. */
const EXPORT_TOKENS = [
  'ground',
  'surface',
  'surface-raised',
  'surface-recessed',
  'edge',
  'edge-strong',
  'edge-control',
  'text-primary',
  'text-secondary',
  'text-muted',
  'emphasis',
  'fill',
  'fill-hover',
  'fill-active',
  'on-fill',
  'fill-alt',
  'on-fill-alt',
  'focus-ring',
  'swatch-brand',
  'swatch-accent',
] as const

function toHex(css: string): string {
  const rgb = cssColorToRgb(css)
  if (!rgb) return '—'
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('')
}

const FILL_ROLES = new Set(['fill', 'fill-hover', 'fill-active', 'fill-alt'])

function HexField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
}) {
  const ok = value.trim() === '' || hexToOklch(value) !== null
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{hint}</div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder="#000000"
          style={{
            font: 'inherit',
            fontSize: 14,
            padding: '6px 8px',
            width: 120,
            borderRadius: 4,
            border: `1px solid ${ok ? 'var(--edge-control)' : 'oklch(0.55 0.2 25)'}`,
            background: 'var(--surface-raised)',
            color: 'var(--text-primary)',
          }}
        />
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 4,
            border: '1px solid var(--edge-strong)',
            background: ok && value ? value : 'transparent',
          }}
        />
      </span>
    </label>
  )
}

/** Lightness and chroma only. Hue is never touched — it is still their colour. */
function nudge(o: Oklch, dl: number, dc: number): Oklch {
  return { l: Math.max(0.02, Math.min(0.99, o.l + dl)), c: Math.max(0, o.c + dc), h: o.h }
}

function Adjust({
  label,
  dl,
  dc,
  onChange,
  resulting,
}: {
  label: string
  dl: number
  dc: number
  onChange: (dl: number, dc: number) => void
  resulting: string | null
}) {
  return (
    <div style={{ margin: '-6px 0 14px', fontSize: 12, color: 'var(--text-muted)' }}>
      <span>
        lightness {dl >= 0 ? '+' : ''}
        {dl.toFixed(2)}
      </span>
      <input
        type="range"
        min={-0.3}
        max={0.3}
        step={0.01}
        value={dl}
        onChange={(e) => onChange(Number(e.target.value), dc)}
        style={{ width: 150, display: 'block' }}
      />
      <span>
        chroma {dc >= 0 ? '+' : ''}
        {dc.toFixed(3)}
      </span>
      <input
        type="range"
        min={-0.15}
        max={0.15}
        step={0.005}
        value={dc}
        onChange={(e) => onChange(dl, Number(e.target.value))}
        style={{ width: 150, display: 'block' }}
      />
      {resulting && (
        <span>
          now <code style={{ color: 'var(--text-secondary)' }}>{resulting}</code>{' '}
          {(dl || dc) !== 0 && (
            <button onClick={() => onChange(0, 0)} style={{ fontSize: 11 }}>
              reset
            </button>
          )}
        </span>
      )}
      <div style={{ fontSize: 11, marginTop: 2 }}>{label}</div>
    </div>
  )
}

/** A small realistic page, so the palette is judged by eye and not only by numbers. */
function Preview() {
  return (
    <div style={{ background: 'var(--ground)', padding: 24, borderRadius: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 16,
          borderBottom: '1px solid var(--edge)',
        }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>Acme Co.</strong>
        <span style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>Services</span>
          <span>Work</span>
          <span>Contact</span>
        </span>
      </div>

      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: 24,
        }}
      >
        What we do
      </p>
      <h2 style={{ color: 'var(--text-primary)', margin: '4px 0 12px', fontSize: 30 }}>
        Built for the thing that makes you{' '}
        <span style={{ color: 'var(--emphasis)' }}>different.</span>
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '52ch', lineHeight: 1.6 }}>
        Body copy at the secondary level, which is where most of a page actually lives, with{' '}
        <a href="#preview" style={{ color: 'var(--emphasis)' }}>
          a link in the brand colour
        </a>{' '}
        running through it. If this is hard to read the palette is wrong, whatever the ratios say.
      </p>

      <div style={{ display: 'flex', gap: 10, margin: '18px 0' }}>
        <button
          style={{
            background: 'var(--fill)',
            color: 'var(--on-fill)',
            border: 0,
            padding: '10px 18px',
            borderRadius: 6,
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          Start a conversation
        </button>
        <button
          style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--edge-control)',
            padding: '10px 18px',
            borderRadius: 6,
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          See our work
        </button>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: 8,
          padding: 16,
          marginTop: 20,
        }}
      >
        <h3 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontSize: 16 }}>
          A card on a surface
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
          Cards sit on <code>--surface</code>, one step off the ground.
        </p>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
          Muted caption — large text and non-essential labels only.
        </p>
      </div>

      <div style={{ marginTop: 18 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)' }}>
          Email
          <br />
          <input
            defaultValue="you@example.com"
            style={{
              marginTop: 4,
              font: 'inherit',
              fontSize: 14,
              padding: '8px 10px',
              borderRadius: 4,
              width: 240,
              background: 'var(--surface-raised)',
              color: 'var(--text-primary)',
              border: '1px solid var(--edge-control)',
              outline: '2px solid var(--focus-ring)',
              outlineOffset: 2,
            }}
          />
        </label>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          Shown with focus applied, so the ring is visible.
        </p>
      </div>
    </div>
  )
}

function PaletteStudio() {
  const root = useRef<HTMLDivElement>(null)
  const lightProbe = useRef<HTMLDivElement>(null)
  const darkProbe = useRef<HTMLDivElement>(null)
  const [resolved, setResolved] = useState<{ light: string[]; dark: string[] } | null>(null)
  const [brandHex, setBrandHex] = useState('#4a1f7c')
  const [accentHex, setAccentHex] = useState('#c9f23f')
  const [thirdHex, setThirdHex] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [groundNudge, setGroundNudge] = useState(0)
  const [tint, setTint] = useState(0.35)
  const [rows, setRows] = useState<Measured[]>([])
  const [usingAccent, setUsingAccent] = useState(false)

  const [bAdj, setBAdj] = useState({ dl: 0, dc: 0 })
  const [aAdj, setAAdj] = useState({ dl: 0, dc: 0 })

  const brandRaw = useMemo(() => hexToOklch(brandHex), [brandHex])
  const accentRaw = useMemo(() => hexToOklch(accentHex), [accentHex])
  const brand = useMemo(
    () => (brandRaw ? nudge(brandRaw, bAdj.dl, bAdj.dc) : null),
    [brandRaw, bAdj],
  )
  const accent = useMemo(
    () => (accentRaw ? nudge(accentRaw, aAdj.dl, aAdj.dc) : null),
    [accentRaw, aAdj],
  )
  const third = useMemo(() => (thirdHex.trim() ? hexToOklch(thirdHex) : null), [thirdHex])

  const grounds = useMemo(
    () => (brand && accent ? deriveGrounds(brand, accent, third, tint) : null),
    [brand, accent, third, tint],
  )

  const activeGround: Oklch | null = useMemo(() => {
    if (!grounds) return null
    const g = theme === 'dark' ? grounds.dark : grounds.light
    return { ...g, l: Math.min(0.99, Math.max(0.03, g.l + groundNudge)) }
  }, [grounds, theme, groundNudge])

  useEffect(() => {
    const el = root.current
    if (!el || !brand || !accent || !activeGround) return
    const set = (k: string, v: number) => el.style.setProperty(k, String(v))
    set('--ground-l', activeGround.l)
    set('--ground-c', activeGround.c)
    set('--ground-h', activeGround.h)
    set('--brand-l', brand.l)
    set('--brand-c', brand.c)
    set('--brand-h', brand.h)
    set('--accent-l', accent.l)
    set('--accent-c', accent.c)
    set('--accent-h', accent.h)

    // Probes carry the same inputs at each ground, so both themes can be read
    // without flipping the visible one.
    for (const [probe, g] of [
      [lightProbe.current, grounds?.light],
      [darkProbe.current, grounds?.dark],
    ] as const) {
      if (!probe || !g) continue
      const ps = (k: string, v: number) => probe.style.setProperty(k, String(v))
      ps('--ground-l', Math.min(0.99, Math.max(0.03, g.l + groundNudge)))
      ps('--ground-c', g.c)
      ps('--ground-h', g.h)
      ps('--brand-l', brand.l)
      ps('--brand-c', brand.c)
      ps('--brand-h', brand.h)
      ps('--accent-l', accent.l)
      ps('--accent-c', accent.c)
      ps('--accent-h', accent.h)
    }

    const id = requestAnimationFrame(() => {
      if (lightProbe.current && darkProbe.current) {
        setResolved({
          light: EXPORT_TOKENS.map((t) => toHex(resolveToken(`--${t}`, lightProbe.current!))),
          dark: EXPORT_TOKENS.map((t) => toHex(resolveToken(`--${t}`, darkProbe.current!))),
        })
      }
      setUsingAccent(resolveToken('--use-accent', el).trim() === '1')
      setRows(
        contrastContract().map((req) => ({
          ...req,
          ratio: contrastRatio(resolveToken(`--${req.fg}`, el), resolveToken(`--${req.bg}`, el)),
        })),
      )
    })
    return () => cancelAnimationFrame(id)
  }, [brand, accent, activeGround, grounds, groundNudge])

  const failures = rows.filter((r) => r.ratio !== null && r.ratio < r.requires)
  const fillFailures = failures.filter((f) => FILL_ROLES.has(f.bg))
  const groundFailures = failures.filter((f) => !FILL_ROLES.has(f.bg))

  const brandAdvice = brand ? fitFill(brand) : null
  const accentAdvice = accent ? fitFill(accent) : null

  const suggestions: string[] = []
  if (fillFailures.length && brandAdvice && Math.abs(brandAdvice.lightnessDelta) > 0.0001) {
    suggestions.push(
      `The brand fill cannot carry a label at 4.5:1 as supplied. Nearest that can is ${Math.abs(
        brandAdvice.lightnessDelta * 100,
      ).toFixed(
        0,
      )}% ${brandAdvice.lightnessDelta > 0 ? 'lighter' : 'darker'} — that would give ${brandAdvice.ratio.toFixed(2)}:1 with a ${brandAdvice.polarity === 'light' ? 'white' : 'dark'} label.`,
    )
  }
  if (fillFailures.length && accentAdvice && Math.abs(accentAdvice.lightnessDelta) > 0.0001) {
    suggestions.push(
      `The accent fill has the same problem. Nearest workable is ${Math.abs(
        accentAdvice.lightnessDelta * 100,
      ).toFixed(0)}% ${accentAdvice.lightnessDelta > 0 ? 'lighter' : 'darker'}.`,
    )
  }
  if (groundFailures.length) {
    suggestions.push(
      `${groundFailures.length} text or boundary role is short against the ground. Nudge the ground ${
        activeGround && activeGround.l > 0.5 ? 'lighter' : 'darker'
      } with the slider until they clear — a ground near mid lightness has nowhere for text to go in either direction.`,
    )
  }

  const configSnippet = [
    'brand: {',
    `  primary: '${brand ? oklchToHex(brand) : brandHex}',`,
    `  secondary: '${accent ? oklchToHex(accent) : accentHex}',`,
    thirdHex.trim() ? `  third: '${thirdHex.trim()}',` : null,
    `  groundTint: ${tint.toFixed(2)},`,
    groundNudge !== 0 ? `  groundNudge: ${groundNudge.toFixed(2)},` : null,
    '},',
  ]
    .filter(Boolean)
    .join('\n')

  const tokenTable = resolved
    ? EXPORT_TOKENS.map((t, i) => `--${t}\t${resolved.light[i]}\t${resolved.dark[i]}`).join('\n')
    : ''

  return (
    <div
      ref={root}
      data-tokens
      data-theme={theme}
      style={{
        background: 'var(--ground)',
        color: 'var(--text-primary)',
        padding: 24,
        minHeight: '100vh',
        font: '15px/1.5 system-ui, sans-serif',
      }}
    >
      <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
        Palette studio
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            font: 'inherit',
            fontSize: 13,
            padding: '5px 12px',
            borderRadius: 6,
            border: '1px solid var(--edge-control)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          {theme} — flip
        </button>
      </h2>

      <div
        style={{ display: 'grid', gridTemplateColumns: '240px minmax(340px, 1fr) 320px', gap: 28 }}
      >
        <div>
          <HexField label="Primary" hint="Brand fill" value={brandHex} onChange={setBrandHex} />
          <Adjust
            label="Hue is untouched — still their colour."
            dl={bAdj.dl}
            dc={bAdj.dc}
            onChange={(dl, dc) => setBAdj({ dl, dc })}
            resulting={brand ? oklchToHex(brand) : null}
          />
          <HexField
            label="Accent"
            hint="Secondary fill"
            value={accentHex}
            onChange={setAccentHex}
          />
          <Adjust
            label="Hue is untouched — still their colour."
            dl={aAdj.dl}
            dc={aAdj.dc}
            onChange={(dl, dc) => setAAdj({ dl, dc })}
            resulting={accent ? oklchToHex(accent) : null}
          />
          <HexField
            label="Third"
            hint="Optional. Seeds the light ground."
            value={thirdHex}
            onChange={setThirdHex}
          />

          <label style={{ display: 'block', fontSize: 13, marginTop: 16 }}>
            ground tint <strong>{(tint * 100).toFixed(0)}%</strong>
            <br />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={tint}
              onChange={(e) => setTint(Number(e.target.value))}
            />
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              0% is a neutral page. 100% is a statement.
            </div>
          </label>

          <label style={{ display: 'block', fontSize: 13, marginTop: 16 }}>
            ground nudge{' '}
            <strong>
              {groundNudge >= 0 ? '+' : ''}
              {groundNudge.toFixed(2)}
            </strong>
            <br />
            <input
              type="range"
              min={-0.25}
              max={0.25}
              step={0.01}
              value={groundNudge}
              onChange={(e) => setGroundNudge(Number(e.target.value))}
            />
            <br />
            <button onClick={() => setGroundNudge(0)} style={{ fontSize: 12, marginTop: 4 }}>
              reset
            </button>
          </label>

          {activeGround && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              Ground derived from the {theme === 'dark' ? 'primary' : third ? 'third' : 'accent'}{' '}
              hue at reduced chroma. L{activeGround.l.toFixed(3)} C{activeGround.c.toFixed(3)} H
              {activeGround.h.toFixed(0)}.
            </p>
          )}
        </div>

        <Preview />

        <div>
          <h3 style={{ marginTop: 0 }}>
            {failures.length ? (
              <span style={{ color: 'oklch(0.55 0.2 25)' }}>{failures.length} not clearing</span>
            ) : (
              <span>All {rows.length} clear</span>
            )}
          </h3>

          {failures.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Every pair in the contract clears its bar in this theme. Flip the theme and check the
              other one before calling it done — they are separate grounds.
            </p>
          )}

          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              borderLeft: '3px solid var(--emphasis)',
              paddingLeft: 10,
            }}
          >
            Emphasis text is using your <strong>{usingAccent ? 'accent' : 'primary'}</strong> on
            this ground, unmodified — it is the {usingAccent ? 'lighter' : 'darker'} of the two, and
            this is the {theme} theme. Flip and it swaps.
          </p>

          {suggestions.map((s, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {s}
            </p>
          ))}

          {failures.length > 0 && (
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)' }}>
              {failures.map((f) => (
                <li key={`${f.fg}-${f.bg}`} style={{ marginBottom: 6 }}>
                  <code>
                    --{f.fg} on --{f.bg}
                  </code>{' '}
                  — {f.ratio?.toFixed(2)} against {f.requires}. {f.why}
                </li>
              ))}
            </ul>
          )}

          <details style={{ marginTop: 16, fontSize: 13 }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
              All {rows.length} measurements
            </summary>
            <table style={{ borderCollapse: 'collapse', marginTop: 8 }}>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.fg}-${r.bg}`}>
                    <td style={{ padding: '3px 10px 3px 0', color: 'var(--text-secondary)' }}>
                      <code>
                        --{r.fg}/{r.bg}
                      </code>
                    </td>
                    <td style={{ padding: '3px 0' }}>{r.ratio?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      </div>

      {/* Hidden probes: same inputs at each ground, so both themes can be read. */}
      <div ref={lightProbe} data-tokens hidden />
      <div ref={darkProbe} data-tokens hidden />

      <h3 style={{ marginTop: 32 }}>Output</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: '62ch' }}>
        What you just built, in the two forms it is needed. The config is what a site is actually
        configured with — a handful of values, not a table. The resolved hexes are for handing to a
        client or a designer who wants the numbers.
      </p>

      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <strong style={{ fontSize: 14 }}>site.config.ts</strong>
          <button
            onClick={() => navigator.clipboard?.writeText(configSnippet)}
            style={{ marginLeft: 10, fontSize: 12 }}
          >
            copy
          </button>
          <pre
            style={{
              background: 'var(--surface-recessed)',
              border: '1px solid var(--edge)',
              borderRadius: 6,
              padding: 12,
              fontSize: 12,
              lineHeight: 1.5,
              overflowX: 'auto',
              maxWidth: 420,
            }}
          >
            {configSnippet}
          </pre>
        </div>

        {resolved && (
          <div>
            <strong style={{ fontSize: 14 }}>Resolved tokens</strong>
            <button
              onClick={() => navigator.clipboard?.writeText(tokenTable)}
              style={{ marginLeft: 10, fontSize: 12 }}
            >
              copy
            </button>
            <table style={{ borderCollapse: 'collapse', fontSize: 12, marginTop: 8 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '4px 14px 4px 0' }}>token</th>
                  <th style={{ padding: '4px 14px 4px 0' }} colSpan={2}>
                    light
                  </th>
                  <th style={{ padding: '4px 0' }} colSpan={2}>
                    dark
                  </th>
                </tr>
              </thead>
              <tbody>
                {EXPORT_TOKENS.map((t, i) => (
                  <tr key={t} style={{ borderTop: '1px solid var(--edge)' }}>
                    <td style={{ padding: '3px 14px 3px 0' }}>
                      <code>--{t}</code>
                    </td>
                    <td style={{ padding: '3px 6px 3px 0' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          border: '1px solid var(--edge-strong)',
                          background: resolved.light[i],
                          verticalAlign: 'middle',
                        }}
                      />
                    </td>
                    <td style={{ padding: '3px 14px 3px 0' }}>
                      <code>{resolved.light[i]}</code>
                    </td>
                    <td style={{ padding: '3px 6px 3px 0' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          border: '1px solid var(--edge-strong)',
                          background: resolved.dark[i],
                          verticalAlign: 'middle',
                        }}
                      />
                    </td>
                    <td style={{ padding: '3px 0' }}>
                      <code>{resolved.dark[i]}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const meta = {
  title: 'Foundations/Palette studio',
  component: PaletteStudio,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PaletteStudio>

export default meta

export const Studio: StoryObj<typeof meta> = {}
