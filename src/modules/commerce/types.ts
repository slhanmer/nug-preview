/**
 * The checkout contract, shared by the button and the action.
 *
 * Separate from checkout.ts for the same reason the contact form's validate.ts
 * is separate from its action: a `'use server'` module may only export async
 * functions, so a type exported from one is a build error.
 */
export type CheckoutState =
  | { status: 'idle' }
  /** Stripe's hosted page. The client component sends the browser there. */
  | { status: 'redirect'; url: string }
  | { status: 'error'; message: string }

export const INITIAL_CHECKOUT: CheckoutState = { status: 'idle' }
