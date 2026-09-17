import { createIcon } from './create-icon'

export type { IconProps } from './create-icon'
export { createIcon } from './create-icon'

/** Close / dismiss. */
export const CloseIcon = createIcon(
  'CloseIcon',
  <path d="M5 5l14 14M19 5L5 19" strokeWidth="2" strokeLinecap="round" />,
)

/** Edit / amend. */
export const EditIcon = createIcon(
  'EditIcon',
  <path
    d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3zM14.5 6.5l3 3"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
)

/** Filter / refine a list. */
export const FilterIcon = createIcon(
  'FilterIcon',
  <path d="M4 5h16l-6 7v6l-4 2v-8L4 5z" strokeWidth="2" strokeLinejoin="round" />,
)

/** Remove / decrement. */
export const MinusIcon = createIcon(
  'MinusIcon',
  <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" />,
)

/** Add / increment. */
export const PlusIcon = createIcon(
  'PlusIcon',
  <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />,
)

/** Delete / destroy. Pair with `variant="danger"`. */
export const TrashIcon = createIcon(
  'TrashIcon',
  <path
    d="M4 7h16M10 4h4M6 7l1 13h10l1-13M10 11v6M14 11v6"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
)

/** Reveal — a password shown. */
export const EyeIcon = createIcon(
  'EyeIcon',
  <path
    d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
)

/** Conceal — a password hidden. */
export const EyeOffIcon = createIcon(
  'EyeOffIcon',
  <path
    d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.4 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 6 10 6a17 17 0 0 1-3.1 3.6M6.2 7.1A17 17 0 0 0 2 11s3.5 6 10 6a9.8 9.8 0 0 0 3.3-.5"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
)
