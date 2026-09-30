'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useRailSlot } from '@/managers/front-end/RailSlotManager'

export interface RailPanelProps {
  children: ReactNode
}

/**
 * Page panel replacing the rail, past md only: the page keeps a phone alternative
 * @param {ReactNode} children - Panel content
 * @return {JSX.Element | null}
 */

export const RailPanel = ({ children }: RailPanelProps) => {
  const { slot, claim } = useRailSlot()

  // Held while mounted
  useEffect(() => claim(), [claim])

  return slot ? createPortal(children, slot) : null
}
