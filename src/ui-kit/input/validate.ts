/**
 * Field validation rules.
 *
 * Exported on its own, and that is the whole design. Half the call sites are
 * not React: a contact form's authority is its server action, where there is no
 * component to ask. Rules that live only inside `Input` are rules you write
 * twice and then watch drift. `Input` calls this by default; the server calls
 * the same function with the same options and gets the same answer.
 *
 * PORT NOTE — SAUCE's `legacy/Input.tsx` imported `validateValue` from the
 * portal's `@utils`, stubbed in the playground as `() => ({ valid, message })`
 * while the component treated the return as `string | null`. The two disagreed,
 * which means that path had not run since extraction. This is a rewrite against
 * the documented `ValidationOptions`, not a port of code — `region: 'AU'` in
 * particular is the one rule worth diffing against the portal before it is
 * trusted, because the JSDoc says mobile-only and a `tel` field is not.
 */

/**
 * Real HTML input types, not render modes.
 *
 * Legacy had thirteen — `date`, `time`, `colour`, `currency`, `code` and a
 * textarea hiding behind `maxLength > 249`. Those are separate components or a
 * separate prop; a union that decides which element to render is a union that
 * grows forever.
 */
export type FieldType = 'text' | 'email' | 'tel' | 'password' | 'number' | 'url' | 'search'

/**
 * What a failure says.
 *
 * Overridable per call, because the kit dictating tone to twenty client sites
 * is how every one of them ends up sounding like a bank. A barber says "Tell us
 * who you are", not "This field is required".
 */
export type ValidationMessages = {
  required: string
  tooShort: (min: number) => string
  tooLong: (max: number) => string
  tooSmall: (min: number) => string
  tooLarge: (max: number) => string
  email: string
  tel: string
  url: string
  number: string
  passwordShort: (min: number) => string
  passwordUpper: string
  passwordLower: string
  passwordNumber: string
  passwordSpecial: string
}

export const DEFAULT_MESSAGES: ValidationMessages = {
  required: 'This field is required.',
  tooShort: (min) => `Use at least ${min} characters.`,
  tooLong: (max) => `Keep this under ${max} characters.`,
  tooSmall: (min) => `Must be ${min} or more.`,
  tooLarge: (max) => `Must be ${max} or less.`,
  email: 'That does not look like an email address.',
  tel: 'That does not look like a phone number.',
  url: 'That does not look like a web address.',
  number: 'Enter a number.',
  passwordShort: (min) => `Use at least ${min} characters.`,
  passwordUpper: 'Include a capital letter.',
  passwordLower: 'Include a lower-case letter.',
  passwordNumber: 'Include a number.',
  passwordSpecial: 'Include a symbol.',
}

/** Legacy's options, kept verbatim so SAUCE's eventual version drops straight in. */
export type ValidationOptions = {
  required?: boolean
  minLength?: number
  maxLength?: number
  /** Numeric floor. `number` only. */
  min?: number
  /** Numeric ceiling. `number` only. */
  max?: number
  /** Defaults to 12. */
  passwordMinLen?: number
  requireUpper?: boolean
  requireLower?: boolean
  requireNumber?: boolean
  requireSpecial?: boolean
  /** Phone region. `AU` expects a local 0-prefixed number or a +61 one. */
  region?: 'AU' | 'INTL'
  /** Replaces individual default messages. */
  messages?: Partial<ValidationMessages>
}

/*
 * Deliberately permissive. Anything stricter starts refusing real addresses —
 * plus-addressing, long TLDs, apostrophes — and the only proof an address
 * exists is a reply arriving at it. This catches typos, not fakes.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/*
 * AU: ten digits starting 0, or the same number as +61 with the 0 dropped.
 * Landlines included — legacy split `mobile` from `phone` and this does not, so
 * a mobile-only rule here would reject a barber's shop number.
 */
const AU_TEL = /^(?:0\d{9}|\+61\d{9})$/
/* INTL: an optional +, then 7 to 15 digits. E.164's ceiling, and little else. */
const INTL_TEL = /^\+?\d{7,15}$/

const SPECIAL = /[^\p{L}\p{N}]/u

/** Everything a phone number is written with and none of what it means. */
function bareNumber(value: string): string {
  return value.replace(/[\s\-().]/g, '')
}

/**
 * The message for the first rule this value breaks, or `null` when it breaks
 * none. One message, not a list: a field shows one error, and a person fixes
 * one thing at a time.
 */
export function validateValue(
  type: FieldType,
  value: string,
  options: ValidationOptions = {},
): string | null {
  const m = { ...DEFAULT_MESSAGES, ...options.messages }
  const trimmed = value.trim()

  if (!trimmed) return options.required ? m.required : null

  if (options.minLength !== undefined && trimmed.length < options.minLength) {
    return m.tooShort(options.minLength)
  }
  if (options.maxLength !== undefined && trimmed.length > options.maxLength) {
    return m.tooLong(options.maxLength)
  }

  switch (type) {
    case 'email':
      return EMAIL.test(trimmed) ? null : m.email

    case 'tel': {
      const bare = bareNumber(trimmed)
      const pattern = options.region === 'AU' ? AU_TEL : INTL_TEL
      return pattern.test(bare) ? null : m.tel
    }

    case 'url':
      // The parser, not a pattern. URL grammar is not a regex worth writing.
      try {
        const url = new URL(trimmed)
        return url.protocol === 'http:' || url.protocol === 'https:' ? null : m.url
      } catch {
        return m.url
      }

    case 'number': {
      const n = Number(trimmed)
      if (!Number.isFinite(n)) return m.number
      if (options.min !== undefined && n < options.min) return m.tooSmall(options.min)
      if (options.max !== undefined && n > options.max) return m.tooLarge(options.max)
      return null
    }

    case 'password': {
      const min = options.passwordMinLen ?? 12
      if (value.length < min) return m.passwordShort(min)
      if (options.requireUpper && !/\p{Lu}/u.test(value)) return m.passwordUpper
      if (options.requireLower && !/\p{Ll}/u.test(value)) return m.passwordLower
      if (options.requireNumber && !/\d/.test(value)) return m.passwordNumber
      if (options.requireSpecial && !SPECIAL.test(value)) return m.passwordSpecial
      return null
    }

    default:
      return null
  }
}

export type SanitiseOptions = {
  allowNewlines?: boolean
  maxLength?: number
}

/**
 * What a person typed, minus what a keyboard did not.
 *
 * Unicode-normalised so a composed é and a decomposed one compare equal;
 * control characters and zero-width joiners stripped, because they are
 * invisible in a field and load-bearing in an injection; whitespace collapsed.
 *
 * Call it on blur, never on change: `normalize('NFC')` mid-keystroke disrupts
 * IME composition, and rewriting a controlled value on change jumps the caret
 * on paste. That reasoning is legacy's and it was right.
 *
 * Passwords are exempt by the caller, not here — normalising changes the bytes
 * that were hashed at registration and breaks existing logins.
 */
export function sanitiseText(value: string, options: SanitiseOptions = {}): string {
  const { allowNewlines = false, maxLength } = options

  let out = value.normalize('NFC')

  // C0 and C1 controls, the zero-width range and the BOM. Tab, newline and
  // carriage return survive — they are whitespace, handled just below.
  out = out.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '')

  out = allowNewlines
    ? out
        .replace(/\r\n?/g, '\n')
        .replace(/[^\S\n]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
    : out.replace(/\s+/g, ' ')

  out = out.trim()

  return maxLength !== undefined ? out.slice(0, maxLength) : out
}
