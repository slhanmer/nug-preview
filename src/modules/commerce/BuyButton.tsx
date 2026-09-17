'use client'

import { useActionState, useEffect } from 'react'

import { Button } from '@/ui-kit'

import { startCheckout } from './checkout'
import { INITIAL_CHECKOUT } from './types'

export type BuyButtonProps = {
  productId: string
  /** @default 'Buy' */
  label?: string
  disabled?: boolean
  className?: string
}

/**
 * One product, one button, one hosted Stripe page.
 *
 * No cart. A barber sells three tins of pomade and a comb — a cart is a
 * checkout flow, an abandoned-cart state and a stock question in exchange for
 * an order value that does not change. It can be a module later if somebody's
 * average order actually has two things in it.
 */
export function BuyButton({ productId, label = 'Buy', disabled, className }: BuyButtonProps) {
  const [state, action, pending] = useActionState(startCheckout, INITIAL_CHECKOUT)

  useEffect(() => {
    if (state.status === 'redirect') window.location.assign(state.url)
  }, [state])

  return (
    <form action={action} className={className}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={1} />

      <Button
        type="submit"
        variant="primary"
        /*
         * Stays busy through the redirect. Settling back to idle while the
         * browser is already navigating gives a live button on a dead page,
         * and the second click starts a second session.
         */
        loading={pending || state.status === 'redirect'}
        disabled={disabled}
      >
        {label}
      </Button>

      {state.status === 'error' ? (
        <p className="sauce-field__error" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
