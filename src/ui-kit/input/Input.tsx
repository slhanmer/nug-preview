'use client'

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useId,
  useRef,
  useState,
} from 'react'

import { EyeIcon, EyeOffIcon } from '../icons'
import { type FieldType, sanitiseText, validateValue, type ValidationOptions } from './validate'

type OwnProps = {
  /**
   * Always required, and always in the accessibility tree. `hideLabel` hides it
   * from sight only — a field a screen reader cannot name is a field nobody can
   * fill in, and a placeholder is not a label.
   */
  label: string
  /** @default false */
  hideLabel?: boolean
  name: string
  /** @default 'text' */
  type?: FieldType
  /**
   * Renders a textarea.
   *
   * Explicit, because legacy decided the element from `maxLength > 249` — a
   * magic number that silently changed the DOM when someone raised a limit.
   */
  multiline?: boolean
  /** @default 4 — multiline only. */
  rows?: number
  /**
   * A failure the server found. Wins over anything the client worked out: the
   * server is the authority and its answer arrived later.
   */
  error?: string
  /** Guidance under the label. Announced with the field, not instead of it. */
  hint?: string
  /**
   * Runs on blur. Defaults to `validateValue` for this `type`; pass a function
   * to replace the rules, or `false` to leave validation entirely to the
   * consumer. The `error` prop still displays either way.
   */
  validate?: ((value: string) => string | null) | false
  validationOptions?: ValidationOptions
  /** Called with the message, or `null`, every time the field validates. */
  onValidate?: (error: string | null) => void
  /**
   * Normalise on blur — NFC, control characters out, whitespace collapsed.
   *
   * Only rewrites the field when it is uncontrolled. A controlled value belongs
   * to the caller, and rewriting it from here would mean fabricating a change
   * event, which is exactly the thing legacy did in five places.
   *
   * @default true, except `password` — normalising changes the bytes that were
   * hashed at registration and breaks existing logins.
   */
  sanitise?: boolean
  /** Shows a count once past 80% of `maxLength`. */
  counter?: boolean
  /** Inside the field, at the end. A unit, an adornment. */
  suffix?: ReactNode
  /** Layout only, never appearance. Applied to the wrapper. */
  className?: string
}

export type InputProps = OwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'prefix' | 'className' | 'children'>

/**
 * A labelled text field.
 *
 * Controlled and uncontrolled both work, because it extends
 * `InputHTMLAttributes` rather than replacing it — `value`/`onChange`,
 * `defaultValue`, `form`, `autoComplete`, `aria-*` and `data-*` all pass
 * through untouched. Same fix as Button's §9, and for the same reason: a
 * component wrapping a native element should widen it, not narrow it.
 *
 * Validation runs on blur, and after that on every change until the field is
 * clean again. Validating on the first keystroke tells someone their email is
 * wrong while they are still typing the local part.
 */
export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(function Input(
  {
    label,
    hideLabel = false,
    name,
    type = 'text',
    multiline = false,
    rows = 4,
    error,
    hint,
    validate,
    validationOptions,
    onValidate,
    sanitise,
    counter = false,
    suffix,
    className,
    required,
    maxLength,
    value,
    defaultValue,
    onChange,
    onBlur,
    disabled,
    ...rest
  },
  ref,
) {
  const base = useId()
  const [revealed, setRevealed] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const [count, setCount] = useState(() => String(defaultValue ?? value ?? '').length)

  // Blur has happened at least once, so changes may now correct a shown error.
  const settled = useRef(false)

  const isPassword = type === 'password'
  const shouldSanitise = sanitise ?? !isPassword

  const shown = error ?? clientError ?? undefined
  const invalid = Boolean(shown)

  const id = `${base}-field`
  const hintId = hint ? `${base}-hint` : undefined
  const errorId = shown ? `${base}-error` : undefined
  const counterId = counter && maxLength ? `${base}-counter` : undefined
  const describedBy = [hintId, errorId, counterId].filter(Boolean).join(' ') || undefined

  function check(raw: string): string | null {
    if (validate === false) return null
    const next = validate
      ? validate(raw)
      : validateValue(type, raw, { required, maxLength, ...validationOptions })
    setClientError(next)
    onValidate?.(next)
    return next
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    settled.current = true
    const element = event.currentTarget
    let next = element.value

    if (shouldSanitise && !disabled && !element.readOnly) {
      next = sanitiseText(next, { allowNewlines: multiline, maxLength })
      // Uncontrolled only — see the `sanitise` note above.
      if (value === undefined && next !== element.value) {
        element.value = next
        setCount(next.length)
      }
    }

    check(next)
    onBlur?.(event as React.FocusEvent<HTMLInputElement>)
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (counter) setCount(event.currentTarget.value.length)
    // Only once blurred, and only to clear — never to raise a new complaint
    // mid-word.
    if (settled.current && clientError) check(event.currentTarget.value)
    onChange?.(event as React.ChangeEvent<HTMLInputElement>)
  }

  const controlClass = [
    'sauce-field__control',
    multiline && 'sauce-field__control--multiline',
    isPassword && 'sauce-field__control--reveals',
  ]
    .filter(Boolean)
    .join(' ')

  const shared = {
    id,
    name,
    required,
    maxLength,
    disabled,
    className: controlClass,
    'aria-invalid': invalid || undefined,
    'aria-describedby': describedBy,
    onBlur: handleBlur,
    onChange: handleChange,
  }

  return (
    <div
      className={['sauce-field', invalid && 'sauce-field--invalid', className]
        .filter(Boolean)
        .join(' ')}
    >
      <label className={hideLabel ? 'sauce-visually-hidden' : 'sauce-field__label'} htmlFor={id}>
        {label}
        {/*
          Marked in words, not in a red asterisk. An asterisk means nothing on
          its own and is routinely hidden from assistive technology, which
          leaves the requirement visible to exactly the people who can already
          see the field.
        */}
        {required ? <span className="sauce-field__required"> (required)</span> : null}
      </label>

      {hint ? (
        <p className="sauce-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}

      <div className="sauce-field__row">
        {multiline ? (
          <textarea
            {...(rest as InputHTMLAttributes<HTMLTextAreaElement>)}
            {...shared}
            ref={ref as Ref<HTMLTextAreaElement>}
            rows={rows}
            value={value}
            defaultValue={defaultValue}
          />
        ) : (
          <input
            {...rest}
            {...shared}
            ref={ref as Ref<HTMLInputElement>}
            type={isPassword && revealed ? 'text' : type}
            value={value}
            defaultValue={defaultValue}
          />
        )}

        {isPassword ? (
          /*
            A real button. Legacy used `<FontAwesomeIcon role="button">` — no
            tab stop, no Enter or Space, no disabled state, and a dependency the
            template does not carry.
          */
          <button
            type="button"
            className="sauce-field__reveal"
            onClick={() => setRevealed((on) => !on)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            disabled={disabled}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}

        {suffix ? <span className="sauce-field__suffix">{suffix}</span> : null}
      </div>

      {shown ? (
        <p className="sauce-field__error" id={errorId}>
          {shown}
        </p>
      ) : null}

      {counter && maxLength ? (
        <p
          className={[
            'sauce-field__counter',
            count >= maxLength && 'sauce-field__counter--at-limit',
          ]
            .filter(Boolean)
            .join(' ')}
          id={counterId}
          // Only once it is close enough to matter, and politely — a live
          // count on every keystroke is a screen reader talking over the user.
          hidden={count < maxLength * 0.8}
        >
          {count} / {maxLength}
        </p>
      ) : null}
    </div>
  )
})
