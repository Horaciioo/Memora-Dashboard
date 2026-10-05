'use client'

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface FloatingLayerProps {
  children: ReactNode
}

/**
 * Lift a floating panel to the body
 * @param {ReactNode} children - Scrim and panel
 * @return {JSX.Element | null}
 */

export const FloatingLayer = ({ children }: FloatingLayerProps) =>
  typeof document === 'undefined' ? null : createPortal(children, document.body)
