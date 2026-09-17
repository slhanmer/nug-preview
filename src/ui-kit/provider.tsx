'use client'

import { createContext, type ReactNode,useContext, useMemo } from 'react'

/**
 * Kit configuration — anything a product sets once and expects to hold
 * everywhere. Tokens are CSS and belong in the stylesheet; props are per call
 * site. This is the narrow band between them, and it should stay narrow.
 */
export type SauceConfig = {
  /**
   * Default leading-edge debounce window for every Button, in milliseconds.
   * The per-button `debounceDelay` prop still wins.
   *
   * @default 400
   */
  buttonDebounceDelay?: number
}

/*
 * Empty rather than null, and no throw on read: every default is a working
 * default, so a Button with no provider above it must behave normally.
 * Requiring a provider to render a button would tax the simplest use.
 */
const SauceConfigContext = createContext<SauceConfig>({})

export type SauceProviderProps = SauceConfig & { children: ReactNode }

/**
 * PORT NOTE — SAUCE's provider also composes its ThemeProvider. STARTER already
 * resolves theme from site.config onto <html> and derives everything from the
 * token ladder, so importing a second theme implementation would give two
 * systems fighting over the same attribute. Config only here.
 *
 * The real provider's props are a superset of these, so swapping the package in
 * later still compiles — we simply never pass the theme half.
 */
export function SauceProvider({ buttonDebounceDelay, children }: SauceProviderProps) {
  const config = useMemo<SauceConfig>(() => ({ buttonDebounceDelay }), [buttonDebounceDelay])
  return <SauceConfigContext.Provider value={config}>{children}</SauceConfigContext.Provider>
}

export function useSauceConfig(): SauceConfig {
  return useContext(SauceConfigContext)
}
