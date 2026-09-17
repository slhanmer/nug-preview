import { type FieldType, validateValue, type ValidationOptions } from '@/ui-kit'

/**
 * The contact form's contract — the rules, the shape the server action hands
 * back, and the field names both halves agree on.
 *
 * It lives here rather than in `actions.ts` because a `'use server'` module may
 * only export async functions; a type or a constant exported from one is a
 * build error. So anything both halves need sits one file over.
 *
 * The rules themselves are the kit's. `validateValue` is exported separately
 * from `Input` precisely so this file can call it — the field a person types
 * into and the action that accepts it now run the same function over the same
 * options object, and cannot drift apart.
 */

export const LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  message: 2000,
} as const

/**
 * Shortest message worth sending on. Below this it is almost always someone
 * testing the form or a bot padding a link, and the client gets the noise.
 */
export const MIN_MESSAGE = 10

export const CONTACT_FIELDS = ['name', 'email', 'phone', 'message'] as const
export type ContactField = (typeof CONTACT_FIELDS)[number]
export type ContactValues = Record<ContactField, string>
export type ContactErrors = Partial<Record<ContactField, string>>

export const EMPTY_VALUES: ContactValues = { name: '', email: '', phone: '', message: '' }

/** The field a person never sees and a naive bot cannot resist filling. */
export const HONEYPOT = 'company'

/** Turnstile's own field. The widget injects it into the enclosing form. */
export const TURNSTILE_FIELD = 'cf-turnstile-response'

/**
 * One rule per field, in this site's voice.
 *
 * Passed to `<Input>` on the client and to `validateValue` on the server —
 * the same object, not two copies of it. The kit's default messages are
 * deliberately neutral ("This field is required"); a barber is not a bank, so
 * the ones a person actually reads are overridden here.
 */
export const RULES = {
  name: {
    type: 'text',
    options: {
      required: true,
      maxLength: LIMITS.name,
      messages: { required: 'Tell us who you are.' },
    },
  },
  email: {
    type: 'email',
    options: {
      required: true,
      maxLength: LIMITS.email,
      messages: { required: 'We need an address to reply to.' },
    },
  },
  phone: {
    type: 'tel',
    options: {
      maxLength: LIMITS.phone,
      /*
       * A change in behaviour worth knowing about: this used to be free text.
       * "0412 345 678" and "07 3000 0000" both pass; "call me after 6" no longer
       * does. Right for a field labelled Phone, and the field is optional, so
       * anyone without one leaves it empty rather than arguing with it.
       */
      region: 'AU',
    },
  },
  message: {
    type: 'text',
    options: {
      required: true,
      minLength: MIN_MESSAGE,
      maxLength: LIMITS.message,
      messages: {
        required: 'Let us know what you need.',
        tooShort: () => 'A little more detail, please.',
      },
    },
  },
} satisfies Record<ContactField, { type: FieldType; options: ValidationOptions }>

function field(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export function readValues(form: FormData): ContactValues {
  return {
    name: field(form, 'name'),
    email: field(form, 'email'),
    phone: field(form, 'phone'),
    message: field(form, 'message'),
  }
}

/**
 * The authority.
 *
 * The browser's `required` and `type="email"`, and the client-side pass `Input`
 * runs on blur, are both a courtesy that saves a round trip. Neither is trusted:
 * nothing counts until it has been through here on the server.
 */
export function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}

  for (const name of CONTACT_FIELDS) {
    const rule = RULES[name]
    const message = validateValue(rule.type, values[name], rule.options)
    if (message) errors[name] = message
  }

  return errors
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0
}

export type ContactState = {
  status: 'idle' | 'error' | 'sent'
  /** Shown above the form, for a failure that is nobody's typing fault. */
  message?: string
  errors?: ContactErrors
  /** Echoed back so a rejected submission does not wipe what was typed. */
  values?: ContactValues
  /**
   * Round trips so far.
   *
   * Two things hang off it. React resets an uncontrolled form once its action
   * settles, so the echoed values only reappear if the fields are remounted —
   * this is the form's `key`. And that remount is also what gives Turnstile a
   * fresh widget, which it needs, because the token it already spent cannot be
   * posted twice.
   */
  attempt: number
}

export const INITIAL_STATE: ContactState = { status: 'idle', attempt: 0 }
