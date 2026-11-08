'use client'

import { useTransition, type ReactNode } from 'react'
import { pickCreator } from '@/app/(dashboard)/actions'
import { Avatar } from '@/components/elements/display/Avatar'
import { VIEW_COPY } from '@/declarations/access/copy'
import { CREATOR_VIEW } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface CreatorPickerButtonProps {
  isOpen: boolean
  onToggle: () => void
}

/**
 * Icon opening the creator list
 * @param {boolean} isOpen - List is unrolled
 * @param {() => void} onToggle - Unroll or fold
 * @return {JSX.Element}
 */

export const CreatorPickerButton = ({ isOpen, onToggle }: CreatorPickerButtonProps) => {
  const PickerIcon = ICONS.creatorPicker

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-label={VIEW_COPY.activeCreator}
      title={VIEW_COPY.activeCreator}
      onClick={onToggle}
      className={CREATOR_VIEW.button}
    >
      <PickerIcon className={CREATOR_VIEW.buttonIcon} aria-hidden="true" />
    </button>
  )
}

/**
 * Block unrolling in height, its rule included
 * @param {boolean} isOpen - Block is shown
 * @param {ReactNode} children - Block content
 * @return {JSX.Element}
 */

const Fold = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) => (
  <div className={cn(CREATOR_VIEW.fold, isOpen ? CREATOR_VIEW.foldOpen : CREATOR_VIEW.foldShut)}>
    <div className={CREATOR_VIEW.foldInner} inert={!isOpen}>
      {children}
      <span className={CREATOR_VIEW.rule} aria-hidden="true" />
    </div>
  </div>
)

export interface CreatorViewPanelProps {
  viewContext: ViewContext
  isOpen: boolean
  onClose: () => void
}

/**
 * Creator on screen: the list unrolls above the account row, once one is chosen the view line
 * stays there under a rule
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {boolean} isOpen - List is unrolled
 * @param {() => void} onClose - Fold after a pick
 * @return {JSX.Element}
 */

export const CreatorViewPanel = ({ viewContext, isOpen, onClose }: CreatorViewPanelProps) => {
  const [isPicking, startPicking] = useTransition()
  const { creators, activeYoutuberId } = viewContext
  const NormalIcon = ICONS.youtuberOff
  const active = creators.find((creator) => creator.id === activeYoutuberId)
  const label = (name: string) => VIEW_COPY.creatorView.replace('{name}', name)

  const pick = (id: string | null) => {
    onClose()
    startPicking(() => void pickCreator(id))
  }

  return (
    <>
      <Fold isOpen={Boolean(active) && !isOpen}>
        {active && (
          <div className={CREATOR_VIEW.row}>
            <Avatar name={active.name} src={active.avatarUrl} size="xs" />
            <span className={CREATOR_VIEW.label}>{label(active.name)}</span>
          </div>
        )}
      </Fold>

      <Fold isOpen={isOpen}>
        <div className={CREATOR_VIEW.list} role="listbox" aria-label={VIEW_COPY.activeCreator}>
          <button
            type="button"
            role="option"
            aria-selected={!active}
            disabled={isPicking}
            onClick={() => pick(null)}
            className={cn(
              CREATOR_VIEW.row,
              CREATOR_VIEW.rowPick,
              !active && CREATOR_VIEW.rowCurrent
            )}
          >
            <NormalIcon className={CREATOR_VIEW.rowGlyph} aria-hidden="true" />
            <span className={CREATOR_VIEW.label}>{VIEW_COPY.normalView}</span>
          </button>

          <span className={CREATOR_VIEW.rule} aria-hidden="true" />

          {creators.map((creator) => (
            <button
              key={creator.id}
              type="button"
              role="option"
              aria-selected={creator.id === activeYoutuberId}
              disabled={isPicking}
              onClick={() => pick(creator.id)}
              className={cn(
                CREATOR_VIEW.row,
                CREATOR_VIEW.rowPick,
                creator.id === activeYoutuberId && CREATOR_VIEW.rowCurrent
              )}
            >
              <Avatar name={creator.name} src={creator.avatarUrl} size="xs" />
              <span className={CREATOR_VIEW.label}>{label(creator.name)}</span>
            </button>
          ))}
        </div>
      </Fold>
    </>
  )
}
