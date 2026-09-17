'use client'

import { type CSSProperties, useEffect, useMemo, useRef, useState, useTransition } from 'react'

import type { Menu } from '@/payload-types'

import { saveDayOff } from './actions'
import styles from './print.module.css'

/*
 * Sheet sizes in millimetres rather than the named CSS keywords. `@page { size:
 * A4 landscape }` is fine, but a table tent has no keyword, and mixing the two
 * ways of expressing a page is how you end up with one size that silently
 * ignores the orientation toggle.
 */
const SIZES = {
  a3: { label: 'A3', w: 297, h: 420 },
  a4: { label: 'A4', w: 210, h: 297 },
  a5: { label: 'A5', w: 148, h: 210 },
  dl: { label: 'DL strip', w: 99, h: 210 },
  tent: { label: 'Table tent', w: 100, h: 150 },
} as const

type SizeKey = keyof typeof SIZES
const SIZE_KEYS = Object.keys(SIZES) as SizeKey[]

const TAGS: Record<string, string> = {
  v: 'v',
  vg: 'vg',
  gf: 'gf',
  gfo: 'gfo',
  df: 'df',
  n: 'nuts',
  spicy: 'spicy',
}

type Business = { name: string; logo?: string }

function offFor(offByMenu: Record<string, string[]>, menuId: number | string | undefined) {
  return Object.fromEntries((offByMenu[String(menuId)] ?? []).map((id) => [id, true]))
}


export function PrintStudio({
  menus,
  date,
  offByMenu,
  business,
}: {
  menus: Menu[]
  date: string
  offByMenu: Record<string, string[]>
  business: Business
}) {
  const [menuId, setMenuId] = useState(() => menus[0]?.id)
  const [size, setSize] = useState<SizeKey>('a4')
  const [landscape, setLandscape] = useState(false)
  const [columns, setColumns] = useState(1)
  const [scale, setScale] = useState(1)
  const [showDescriptions, setShowDescriptions] = useState(true)
  const [showPrices, setShowPrices] = useState(true)
  const [showTags, setShowTags] = useState(true)
  const [showLogo, setShowLogo] = useState(Boolean(business.logo))
  const [titleOverride, setTitleOverride] = useState('')
  const [footnoteOverride, setFootnoteOverride] = useState('')
  const [skip, setSkip] = useState<Record<string, boolean>>(() => offFor(offByMenu, menus[0]?.id))
  const [saving, startSaving] = useTransition()
  const [saveError, setSaveError] = useState('')

  const menu = menus.find((m) => m.id === menuId) ?? menus[0]

  const page = SIZES[size]
  const width = landscape ? page.h : page.w
  const height = landscape ? page.w : page.h

  /*
   * Adjusted during render rather than in an effect. An effect would paint the
   * previous menu's ticks first and then correct them, which is both a visible
   * flicker and the cascading-render the lint rule is about.
   */
  const [shownMenuId, setShownMenuId] = useState(menuId)
  if (menuId !== shownMenuId) {
    setShownMenuId(menuId)
    setSkip(offFor(offByMenu, menuId))
    setSaveError('')
  }

  /*
   * Fit the sheet to whatever space the screen has. Without this the tool is
   * unusable on a phone — an A4 sheet at true size is roughly three times the
   * width of the viewport, and pinch-zooming a live preview is miserable.
   */
  const stageRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const mmToPx = 96 / 25.4
    const measure = () => {
      const available = stage.clientWidth - 32
      setFit(Math.min(1, available / (width * mmToPx)))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [width])

  const pageCss = useMemo(
    () => `@page { size: ${width}mm ${height}mm; margin: 0 }`,
    [width, height],
  )

  if (!menu) {
    return (
      <div className={styles.studio}>
        <div className={styles.controls}>
          <p className={styles.hint}>No menus yet. Create one in the admin first.</p>
        </div>
      </div>
    )
  }

  const sections = menu.sections ?? []

  /*
   * Keyed by the row's own id, not its position. An admin reordering the menu at
   * half ten would otherwise shift this morning's ticks onto the wrong dishes.
   */
  const keyFor = (itemId: string | null | undefined, s: number, i: number) =>
    itemId ?? `pos:${s}:${i}`

  /*
   * Optimistic: the tick moves at once and the write follows. A checkbox that
   * waits on a round trip is a checkbox somebody presses twice.
   */
  const persist = (next: Record<string, boolean>) => {
    setSkip(next)
    if (menuId === undefined) return
    const ids = Object.entries(next)
      .filter(([, on]) => on)
      .map(([id]) => id)
    startSaving(async () => {
      try {
        await saveDayOff(Number(menuId), date, ids)
        setSaveError('')
      } catch {
        setSaveError('Not saved. Check the connection and try again — this print is still correct.')
      }
    })
  }

  const toggle = (key: string) => persist({ ...skip, [key]: !skip[key] })

  const clearSkips = () => persist({})

  const skipCount = Object.values(skip).filter(Boolean).length

  return (
    <div className={styles.studio}>
      <style media="print">{pageCss}</style>

      <aside className={styles.controls}>
        <p className={styles.title}>Print a menu</p>

        {menus.length > 1 ? (
          <div className={styles.group}>
            <label className={styles.label} htmlFor="menu">
              Menu
            </label>
            <select
              id="menu"
              className={styles.select}
              value={String(menuId)}
              onChange={(e) => setMenuId(Number(e.target.value))}
            >
              {menus.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className={styles.group}>
          <span className={styles.label}>Paper</span>
          <div className={styles.row}>
            {SIZE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={`${styles.chip} ${size === key ? styles.chipOn : ''}`}
                onClick={() => setSize(key)}
              >
                {SIZES[key].label}
              </button>
            ))}
          </div>
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.chip} ${!landscape ? styles.chipOn : ''}`}
              onClick={() => setLandscape(false)}
            >
              Portrait
            </button>
            <button
              type="button"
              className={`${styles.chip} ${landscape ? styles.chipOn : ''}`}
              onClick={() => setLandscape(true)}
            >
              Landscape
            </button>
            <button
              type="button"
              className={`${styles.chip} ${columns === 2 ? styles.chipOn : ''}`}
              onClick={() => setColumns(columns === 2 ? 1 : 2)}
            >
              Two columns
            </button>
          </div>
        </div>

        <div className={styles.group}>
          <label className={styles.label} htmlFor="scale">
            Text size — {Math.round(scale * 100)}%
          </label>
          <input
            id="scale"
            className={styles.range}
            type="range"
            min="0.75"
            max="1.5"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Show</span>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={showDescriptions}
              onChange={(e) => setShowDescriptions(e.target.checked)}
            />
            Descriptions
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={showPrices}
              onChange={(e) => setShowPrices(e.target.checked)}
            />
            Prices
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={showTags}
              onChange={(e) => setShowTags(e.target.checked)}
            />
            Dietary marks
          </label>
          {business.logo ? (
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
              />
              Logo
            </label>
          ) : null}
        </div>

        <div className={styles.group}>
          <label className={styles.label} htmlFor="title">
            Title for this print
          </label>
          <input
            id="title"
            className={styles.input}
            placeholder={menu.title}
            value={titleOverride}
            onChange={(e) => setTitleOverride(e.target.value)}
          />
          <label className={styles.label} htmlFor="footnote">
            Footer for this print
          </label>
          <input
            id="footnote"
            className={styles.input}
            placeholder={menu.footnote ?? 'None'}
            value={footnoteOverride}
            onChange={(e) => setFootnoteOverride(e.target.value)}
          />
          <p className={styles.hint}>
            Overrides and the ticks below affect print only. Nothing here changes the website or the
            menu in the admin.
          </p>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>
            Leave off today&rsquo;s print{skipCount > 0 ? ` — ${skipCount}` : ''}
          </span>
          {saving ? <p className={styles.hint}>Saving…</p> : null}
          {saveError ? <p className={styles.hint}>{saveError}</p> : null}
          <div className={styles.soldOutList}>
            {sections.map((section, s) => (
              <div key={section.id ?? s}>
                <p className={styles.soldOutSection}>{section.heading}</p>
                {(section.items ?? []).map((item, i) => {
                  const key = keyFor(item.id, s, i)
                  return (
                    <label key={key} className={styles.check}>
                      <input
                        type="checkbox"
                        checked={Boolean(skip[key])}
                        onChange={() => toggle(key)}
                      />
                      {item.name}
                    </label>
                  )
                })}
              </div>
            ))}
          </div>
          {skipCount > 0 ? (
            <button type="button" className={styles.chip} onClick={clearSkips}>
              Put everything back on
            </button>
          ) : null}
          <p className={styles.hint}>
            Shared with everyone on the till and the office machine, and only for {date}. For the
            morning the delivery was short, not for running out at one o&rsquo;clock. Tomorrow
            starts with the full menu, so a short print is always somebody&rsquo;s decision.
          </p>
        </div>

        <button type="button" className={styles.printButton} onClick={() => window.print()}>
          Print
        </button>
        <p className={styles.hint}>
          In the print dialog set margins to None and turn off headers and footers, or the browser
          adds its own. On a phone, choose Save as PDF to send it to the shop printer.
        </p>
      </aside>

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.sheetWrap} style={{ '--fit': fit } as CSSProperties}>
          <div
            className={styles.sheet}
            style={
              {
                width: `${width}mm`,
                minHeight: `${height}mm`,
                '--scale': scale,
              } as CSSProperties
            }
          >
            <header className={styles.sheetHead}>
              {showLogo && business.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.logo} src={business.logo} alt="" />
              ) : null}
              <h1 className={styles.sheetTitle}>{titleOverride || menu.title}</h1>
              {menu.standfirst ? <p className={styles.standfirst}>{menu.standfirst}</p> : null}
            </header>

            <div className={styles.body} style={{ columnCount: columns }}>
              {sections.map((section, s) => (
                <section key={section.id ?? s} className={styles.section}>
                  <h2 className={styles.sectionHeading}>{section.heading}</h2>
                  {section.note ? <p className={styles.sectionNote}>{section.note}</p> : null}
                  {(section.items ?? []).map((item, i) => {
                    if (skip[keyFor(item.id, s, i)] || item.hidden) return null
                    const tags = showTags
                      ? (item.dietary ?? []).map((t) => TAGS[t] ?? t).join(' · ')
                      : ''
                    return (
                      <div key={item.id ?? i} className={styles.item}>
                        <div className={styles.itemHead}>
                          <span className={styles.itemName}>{item.name}</span>
                          {tags ? <span className={styles.tags}>{tags}</span> : null}
                          {showPrices && item.price ? (
                            <>
                              <span className={styles.dots} aria-hidden="true" />
                              <span className={styles.itemPrice}>{item.price}</span>
                            </>
                          ) : null}
                        </div>
                        {showDescriptions && item.description ? (
                          <p className={styles.itemDesc}>{item.description}</p>
                        ) : null}
                      </div>
                    )
                  })}
                </section>
              ))}
            </div>

            {footnoteOverride || menu.footnote ? (
              <p className={styles.footnote}>{footnoteOverride || menu.footnote}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
