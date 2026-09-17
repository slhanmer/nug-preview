import type { ReactNode, SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & {
  /**
   * Names the icon for assistive technology. Omit when the icon is decorative
   * — beside a text label, or inside a button that carries its own name.
   */
  title?: string
}

/**
 * Builds an icon on the shared grid: 24px viewBox, 2px stroke, round caps,
 * drawn with `currentColor`. No icon-library dependency and no third-party
 * licence to honour when the template is redistributed to a client.
 *
 * Decorative by default; named only when given a `title`.
 */
export function createIcon(displayName: string, path: ReactNode) {
  const Icon = ({ title, ...props }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {path}
    </svg>
  )
  Icon.displayName = displayName
  return Icon
}
