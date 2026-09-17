'use client'

import type { ReactNode } from 'react'

import { CloseIcon, EditIcon, FilterIcon, MinusIcon, PlusIcon, TrashIcon } from '../icons'
import { Button, type ButtonProps } from './Button'

/*
 * Presets exist instead of `variant="close" | "edit" | "trash"`.
 *
 * A variant should say what an action MEANS; those said which icon to draw,
 * which a shared kit cannot know for its consumers. The accessibility argument
 * is the stronger one: a preset can GUARANTEE an accessible name, a variant can
 * only hope for one. Icon variants fell back to a generic "Icon button"
 * whenever a developer forgot, which is how screen-reader users end up on a
 * page of identical unnamed controls.
 *
 * Adding a preset is cheap and additive. Adding a variant is not.
 */

type PresetProps = Omit<ButtonProps, 'variant' | 'icon' | 'children'> & {
  /** Overrides the default accessible name. */
  'aria-label'?: string
}

function preset(
  displayName: string,
  icon: ReactNode,
  defaultLabel: string,
  variant: ButtonProps['variant'] = 'text-only',
) {
  const Preset = ({ 'aria-label': ariaLabel, ...props }: PresetProps) => (
    <Button variant={variant} icon={icon} aria-label={ariaLabel ?? defaultLabel} {...props} />
  )
  Preset.displayName = displayName
  return Preset
}

/** Dismisses a dialog, panel or notice. */
export const CloseButton = preset('CloseButton', <CloseIcon />, 'Close')

/** Enters edit mode on the thing it sits beside. */
export const EditButton = preset('EditButton', <EditIcon />, 'Edit')

/** Destructive. Uses the danger lane, and should be confirmed before it acts. */
export const DeleteButton = preset('DeleteButton', <TrashIcon />, 'Delete', 'danger')

/** Adds a row, item or entry. */
export const AddButton = preset('AddButton', <PlusIcon />, 'Add')

/** Removes a row or item without destroying data. Not `DeleteButton`. */
export const RemoveButton = preset('RemoveButton', <MinusIcon />, 'Remove')

/** Opens filtering controls. Outlined, because it toggles a panel rather than acting. */
export const FilterButton = preset('FilterButton', <FilterIcon />, 'Filter', 'secondary')

/**
 * The retreat action. Outlined so it never competes with the confirm button
 * beside it. A preset rather than a variant because "cancel" describes a
 * specific button, not a level of emphasis — the emphasis is `secondary`.
 */
export function CancelButton({ children, ...props }: ButtonProps) {
  return (
    <Button variant="secondary" {...props}>
      {children ?? 'Cancel'}
    </Button>
  )
}
