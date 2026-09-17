import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect, useRef, useState } from 'react'

import { contrastRatio, resolveToken } from '@/lib/contrast'
import { contrastContract, EXEMPT, type Requirement, SURFACES } from '@/styles/roles'

type Measured = Requirement & { ratio: number | null }

type Inputs = {
  groundL: number
  groundC: number
  groundH: number
  brandL: number
  brandC: number
  brandH: number
  accentL: number
  accentC: number
  accentH: number
}

type SweepRow = Requirement & { worst: number; at: Inputs }

const SWATCHES = [...SURFACES, 'edge', 'edge-strong', 'edge-control', 'brand', 'accent'] as const

/** Deterministic PRNG, so a sweep is reproducible and a failure can be re-run. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SAMPLES = 1500

function apply(el: HTMLElement, i: Inputs) {
  el.style.setProperty('--ground-l', String(i.groundL))
  el.style.setProperty('--ground-c', String(i.groundC))
  el.style.setProperty('--ground-h', String(i.groundH))
  el.style.setProperty('--brand-l', String(i.brandL))
  el.style.setProperty('--brand-c', String(i.brandC))
  el.style.setProperty('--brand-h', String(i.brandH))
  el.style.setProperty('--accent-l', String(i.accentL))
  el.style.setProperty('--accent-c', String(i.accentC))
  el.style.setProperty('--accent-h', String(i.accentH))
}

/**
 * Declared at module scope, not inside the component. A component created
 * during render is a new type on every render, so React unmounts and remounts
 * it and any state inside is lost. eslint-plugin-react-hooks catches this.
 */
function Slider({
  label,
  field,
  min,
  max,
  step = 0.01,
  inputs,
  setInputs,
}: {
  label: string
  field: keyof Inputs
  min: number
  max: number
  step?: number
  inputs: Inputs
  setInputs: (i: Inputs) => void
}) {
  return (
    <label style={{ display: 'block', fontSize: 13 }}>
      {label} <strong>{inputs[field].toFixed(step >= 1 ? 0 : 3)}</strong>
      <br />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={inputs[field]}
        onChange={(e) => setInputs({ ...inputs, [field]: Number(e.target.value) })}
      />
    </label>
  )
}

function Foundations() {
  const root = useRef<HTMLDivElement>(null)
  const [inputs, setInputs] = useState<Inputs>({
    groundL: 0.985,
    groundC: 0.004,
    groundH: 265,
    brandL: 0.52,
    brandC: 0.15,
    brandH: 265,
    accentL: 0.52,
    accentC: 0.14,
    accentH: 45,
  })
  const [rows, setRows] = useState<Measured[]>([])
  const [sweep, setSweep] = useState<{ rows: SweepRow[]; cleanSamples: number } | null>(null)
  const [sweeping, setSweeping] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    apply(el, inputs)
    const id = requestAnimationFrame(() => {
      setRows(
        contrastContract().map((req) => ({
          ...req,
          ratio: contrastRatio(resolveToken(`--${req.fg}`, el), resolveToken(`--${req.bg}`, el)),
        })),
      )
    })
    return () => cancelAnimationFrame(id)
  }, [inputs])

  const failures = rows.filter((r) => r.ratio !== null && r.ratio < r.requires)

  /**
   * Randomised sweep across the whole input space, seeded so it is repeatable.
   *
   * Reports two things: the worst ratio seen for each pair and the inputs that
   * produced it, and the share of sampled palettes where EVERY pair passed —
   * which is the number that actually matters. It answers "what fraction of
   * client brands can this system build", not "does my own site work".
   */
  function runSweep() {
    const el = root.current
    if (!el) return
    setSweeping(true)

    requestAnimationFrame(() => {
      const rnd = mulberry32(20260830)
      const contract = contrastContract()
      const worst = new Map<string, SweepRow>()
      let clean = 0

      const between = (lo: number, hi: number) => lo + rnd() * (hi - lo)

      for (let n = 0; n < SAMPLES; n++) {
        const sample: Inputs = {
          groundL: between(0.05, 0.98),
          groundC: between(0, 0.1),
          groundH: between(0, 360),
          brandL: between(0.2, 0.95),
          brandC: between(0.02, 0.3),
          brandH: between(0, 360),
          accentL: between(0.2, 0.95),
          accentC: between(0.02, 0.3),
          accentH: between(0, 360),
        }
        apply(el, sample)

        let sampleClean = true
        for (const req of contract) {
          const ratio = contrastRatio(
            resolveToken(`--${req.fg}`, el),
            resolveToken(`--${req.bg}`, el),
          )
          if (ratio === null) continue
          if (ratio < req.requires) sampleClean = false
          const key = `${req.fg}|${req.bg}`
          const seen = worst.get(key)
          if (!seen || ratio < seen.worst) {
            worst.set(key, { ...req, worst: ratio, at: sample })
          }
        }
        if (sampleClean) clean++
      }

      apply(el, inputs)
      setSweep({
        rows: [...worst.values()].sort((a, b) => a.worst / a.requires - b.worst / b.requires),
        cleanSamples: clean,
      })
      setSweeping(false)
    })
  }

  return (
    <div
      ref={root}
      data-tokens
      style={{ background: 'var(--ground)', color: 'var(--text-primary)', padding: 24 }}
    >
      <h2 style={{ marginTop: 0 }}>Ladder bench</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        Not the client tool — that is <strong>Palette studio</strong>. This exists to tune the
        ladder distances in <code>tokens.css</code> and stress them across the whole input space.
        The nine sliders are raw inputs with no fitting or advice applied, which is why a palette
        that fails here may be perfectly fine in the studio. Retire this once the contrast suite
        runs in CI.
      </p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', margin: '20px 0' }}>
        <div>
          <Slider
            label="ground lightness"
            field="groundL"
            min={0.05}
            max={0.98}
            inputs={inputs}
            setInputs={setInputs}
          />
          <Slider
            label="ground chroma"
            field="groundC"
            min={0}
            max={0.1}
            step={0.002}
            inputs={inputs}
            setInputs={setInputs}
          />
          <Slider
            label="ground hue"
            field="groundH"
            min={0}
            max={360}
            step={1}
            inputs={inputs}
            setInputs={setInputs}
          />
        </div>
        <div>
          <Slider
            label="brand lightness"
            field="brandL"
            min={0.2}
            max={0.95}
            inputs={inputs}
            setInputs={setInputs}
          />
          <Slider
            label="brand chroma"
            field="brandC"
            min={0.02}
            max={0.3}
            step={0.005}
            inputs={inputs}
            setInputs={setInputs}
          />
          <Slider
            label="brand hue"
            field="brandH"
            min={0}
            max={360}
            step={1}
            inputs={inputs}
            setInputs={setInputs}
          />
        </div>
        <div>
          <Slider
            label="accent lightness"
            field="accentL"
            min={0.2}
            max={0.95}
            inputs={inputs}
            setInputs={setInputs}
          />
          <Slider
            label="accent chroma"
            field="accentC"
            min={0.02}
            max={0.3}
            step={0.005}
            inputs={inputs}
            setInputs={setInputs}
          />
          <Slider
            label="accent hue"
            field="accentH"
            min={0}
            max={360}
            step={1}
            inputs={inputs}
            setInputs={setInputs}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {SWATCHES.map((name) => (
          <div key={name} style={{ width: 140 }}>
            <div
              style={{
                background: `var(--${name})`,
                border: '1px solid var(--edge-strong)',
                height: 48,
                borderRadius: 6,
              }}
            />
            <code style={{ fontSize: 12, color: 'var(--text-muted)' }}>--{name}</code>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 28 }}>
        This palette{' '}
        <span
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: failures.length ? 'oklch(0.55 0.2 25)' : 'var(--text-muted)',
          }}
        >
          {failures.length ? `${failures.length} failing` : `all ${rows.length} passing`}
        </span>
      </h3>
      {failures.length > 0 && (
        <ul style={{ color: 'oklch(0.55 0.2 25)', fontSize: 14 }}>
          {failures.map((f) => (
            <li key={`${f.fg}-${f.bg}`}>
              <code>
                --{f.fg} on --{f.bg}
              </code>{' '}
              — {f.ratio?.toFixed(2)} against {f.requires}
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: 28 }}>
        Sweep{' '}
        <button onClick={runSweep} disabled={sweeping} style={{ marginLeft: 8 }}>
          {sweeping ? 'sweeping…' : `run ${SAMPLES} random palettes`}
        </button>
      </h3>

      {sweep && (
        <>
          <p style={{ fontSize: 16 }}>
            <strong>
              {((sweep.cleanSamples / SAMPLES) * 100).toFixed(1)}% of sampled palettes pass every
              pair
            </strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              ({sweep.cleanSamples} of {SAMPLES})
            </span>
          </p>
          <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '6px 14px 6px 0' }}>pair</th>
                <th style={{ padding: '6px 14px 6px 0' }}>needs</th>
                <th style={{ padding: '6px 14px 6px 0' }}>worst</th>
                <th style={{ padding: '6px 0' }}>at</th>
              </tr>
            </thead>
            <tbody>
              {sweep.rows.map((r) => {
                const pass = r.worst >= r.requires
                return (
                  <tr key={`${r.fg}-${r.bg}`} style={{ borderTop: '1px solid var(--edge)' }}>
                    <td style={{ padding: '6px 14px 6px 0' }}>
                      <code>
                        --{r.fg} on --{r.bg}
                      </code>
                    </td>
                    <td style={{ padding: '6px 14px 6px 0', color: 'var(--text-secondary)' }}>
                      {r.requires}
                    </td>
                    <td
                      style={{
                        padding: '6px 14px 6px 0',
                        color: pass ? 'inherit' : 'oklch(0.55 0.2 25)',
                        fontWeight: pass ? 400 : 700,
                      }}
                    >
                      {r.worst.toFixed(2)}
                    </td>
                    <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>
                      ground L{r.at.groundL.toFixed(2)} C{r.at.groundC.toFixed(3)} H
                      {r.at.groundH.toFixed(0)} · brand L{r.at.brandL.toFixed(2)} C
                      {r.at.brandC.toFixed(2)} H{r.at.brandH.toFixed(0)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      <h3 style={{ marginTop: 28 }}>Exempt</h3>
      <ul style={{ color: 'var(--text-secondary)', maxWidth: '60ch', paddingLeft: 20 }}>
        {EXEMPT.map((e) => (
          <li key={e.token}>
            <code>--{e.token}</code> — {e.why}
          </li>
        ))}
      </ul>
    </div>
  )
}

const meta = {
  title: 'Dev bench/Ladder',
  component: Foundations,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Foundations>

export default meta

export const Colour: StoryObj<typeof meta> = {}
