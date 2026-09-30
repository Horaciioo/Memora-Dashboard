'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { pickCreator } from '@/app/(dashboard)/actions'
import { Avatar } from '@/components/elements/display/Avatar'
import { AccountActions } from '@/composites/shell/AccountActions'
import { useOutsideDismiss } from '@/core/hooks/interaction/useOutsideDismiss'
import { VIEW_COPY } from '@/declarations/access/copy'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { CREATOR_MENU, RAIL_POPOVER } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { CreatorLead, ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface CreatorAccountMenuProps {
  viewContext: ViewContext
  unreadCount: number
}

/**
 * Account footer of the rail, its box opening beside the rail with the account actions and,
 * for a member of several creators, the creator on screen
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {number} unreadCount - Unopened notifications
 * @return {JSX.Element | null}
 */

export const CreatorAccountMenu = ({ viewContext, unreadCount }: CreatorAccountMenuProps) => {
  const { session } = useAuthContext()
  const [isOpen, setOpen] = useState(false)
  const [isPicking, startPicking] = useTransition()
  const boundary = useRef<HTMLDivElement>(null)
  const Chevron = ICONS.expand
  const OffIcon = ICONS.youtuberNone

  const { creators, activeYoutuberId } = viewContext
  const hasChoice = creators.length > 1

  const shut = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, boundary, shut)

  // Escape closes
  useEffect(() => {
    if (!isOpen) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') shut()
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, shut])

  if (!session) return null

  const active = creators.find((creator) => creator.id === activeYoutuberId) ?? null

  const pick = (youtuberId: string | null) => {
    shut()
    startPicking(() => void pickCreator(youtuberId))
  }

  return (
    <div ref={boundary} className={CREATOR_MENU.wrapper}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setOpen((open) => !open)}
        className={CREATOR_MENU.trigger}
      >
        {hasChoice ? (
          <CreatorFace creator={active} />
        ) : (
          <Avatar name={session.displayName} src={session.avatarUrl} size="sm" />
        )}
        <span className={CREATOR_MENU.name}>
          {hasChoice ? (active?.name ?? VIEW_COPY.noCreator) : session.displayName}
        </span>
        <Chevron
          className={cn(
            CREATOR_MENU.chevron,
            isOpen ? CREATOR_MENU.chevronOpen : CREATOR_MENU.chevronShut
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div role="dialog" className={cn(RAIL_POPOVER.panel, RAIL_POPOVER.account)}>
          <div className={RAIL_POPOVER.head}>
            <Avatar name={session.displayName} src={session.avatarUrl} size="lg" />
            <p className={RAIL_POPOVER.headTitle}>{session.displayName}</p>
            <p className={RAIL_POPOVER.headMeta}>{ROLE_REGISTRY.label(session.role)}</p>
          </div>

          <div className={cn(RAIL_POPOVER.body, CREATOR_MENU.body)}>
            <AccountActions unreadCount={unreadCount} onNavigate={shut} viewContext={viewContext} />

            {hasChoice && (
              <>
                <span className={CREATOR_MENU.divider} aria-hidden="true" />
                <p className={CREATOR_MENU.heading}>{VIEW_COPY.activeCreator}</p>
                <ul className={CREATOR_MENU.list}>
                  {creators.map((creator) => {
                    const isActive = creator.id === activeYoutuberId

                    return (
                      <li key={creator.id}>
                        <button
                          type="button"
                          disabled={isPicking}
                          aria-pressed={isActive}
                          style={accentVars(creator.accent, 'brand')}
                          onClick={() => pick(creator.id)}
                          className={cn(
                            CREATOR_MENU.option,
                            isActive ? CREATOR_MENU.optionActive : CREATOR_MENU.optionIdle
                          )}
                        >
                          <Avatar name={creator.name} src={creator.avatarUrl} size="sm" />
                          <span className={CREATOR_MENU.optionName}>{creator.name}</span>
                          {isActive && (
                            <span className={CREATOR_MENU.optionMark} aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    )
                  })}
                  <li>
                    <button
                      type="button"
                      disabled={isPicking}
                      aria-pressed={activeYoutuberId === null}
                      onClick={() => pick(null)}
                      className={cn(
                        CREATOR_MENU.option,
                        activeYoutuberId === null
                          ? CREATOR_MENU.optionActive
                          : CREATOR_MENU.optionIdle
                      )}
                    >
                      <OffIcon className={CREATOR_MENU.noneGlyph} aria-hidden="true" />
                      <span className={CREATOR_MENU.optionName}>{VIEW_COPY.noCreator}</span>
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Creator portrait, or the none glyph at portrait size
 * @param {Object} props - Creator
 * @param {CreatorLead | null} props.creator - Creator on screen
 * @return {JSX.Element}
 */

const CreatorFace = ({ creator }: { creator: CreatorLead | null }) => {
  const OffIcon = ICONS.youtuberNone

  return creator ? (
    <Avatar name={creator.name} src={creator.avatarUrl} size="sm" />
  ) : (
    <OffIcon className={CREATOR_MENU.noneGlyph} aria-hidden="true" />
  )
}
