/**
 * The kit — and the seam that makes it swappable.
 *
 * Everything in the repo imports from `@/ui-kit`, never from a component path.
 * When SAUCE ships as a package these re-exports point at `@sauce-ui/core`
 * instead, and nothing else in the codebase moves.
 *
 * The corollary is a hard rule: SKINS MUST NEVER STYLE KIT INTERNALS. Not
 * `.sauce-btn__label`, not `.sauce-field__control`, not descendant selectors
 * reaching inside. Prop renames the compiler finds for you; a DOM change
 * silently breaks three skins at once and you find out from a screenshot. Style
 * through variants and props, or wrap.
 */

export type { ButtonHeight, ButtonProps, ButtonVariant, ButtonWidth } from './button/Button'
export { Button } from './button/Button'
export type { LoaderProps, LoaderSize } from './button/Loader'
export { Loader } from './button/Loader'
export {
  AddButton,
  CancelButton,
  CloseButton,
  DeleteButton,
  EditButton,
  FilterButton,
  RemoveButton,
} from './button/presets'
export type { InputProps } from './input/Input'
export { Input } from './input/Input'
export type { SauceConfig, SauceProviderProps } from './provider'
export { SauceProvider, useSauceConfig } from './provider'

/*
 * The rules ship beside the component, and separately from it.
 *
 * A server action has no component to ask, so validation that only exists
 * inside `Input` is validation written twice. Both halves import this.
 */
export type { IconProps } from './icons'
export {
  CloseIcon,
  createIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  FilterIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from './icons'
export type {
  FieldType,
  SanitiseOptions,
  ValidationMessages,
  ValidationOptions,
} from './input/validate'
export { DEFAULT_MESSAGES, sanitiseText, validateValue } from './input/validate'
