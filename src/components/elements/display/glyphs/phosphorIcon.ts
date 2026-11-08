import { createElement, forwardRef, Fragment } from 'react'
import type { ReactElement } from 'react'
import SSRBase from '@phosphor-icons/react/dist/lib/SSRBase'
import type { Icon, IconProps, IconWeight } from '@phosphor-icons/react'

// Props of the shared svg frame
type IconBaseProps = Parameters<typeof SSRBase>[0]

/**
 * Drawn shapes of an icon weight
 * @typedef {Array<[string, Record<string, unknown>]>} IconShapes
 */

export type IconShapes = [string, Record<string, unknown>][]

/**
 * Phosphor icon holding only its used weights
 * @param {Partial<Record<IconWeight, IconShapes>>} drawings - Shapes per weight
 * @return {Icon} - Icon
 */

export const phosphorIcon = (drawings: Partial<Record<IconWeight, IconShapes>>): Icon => {
  const weights = new Map(
    Object.entries(drawings).map(([weight, shapes]) => [
      weight as IconWeight,
      createElement(
        Fragment,
        null,
        ...shapes.map(([tag, props], key) => createElement(tag, { key, ...props }))
      ) as ReactElement,
    ])
  )

  return forwardRef<SVGSVGElement, IconProps>((props, ref) =>
    createElement(SSRBase, { ...props, ref, weights } as IconBaseProps)
  ) as Icon
}
