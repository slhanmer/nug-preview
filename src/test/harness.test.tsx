import { render, screen } from '@testing-library/react'

/**
 * Guards the test harness itself. If `src/test/setup.ts` stops loading, custom
 * matchers vanish silently and every assertion using them starts passing
 * vacuously. This fails loudly instead.
 */
describe('test harness', () => {
  it('renders into a DOM', () => {
    render(<p>ready</p>)
    expect(screen.getByText('ready')).toBeInTheDocument()
  })

  it('has jest-dom matchers registered', () => {
    expect(typeof expect(document.body).toBeInTheDocument).toBe('function')
  })
})
