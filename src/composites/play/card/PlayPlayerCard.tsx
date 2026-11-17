'use client'

import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayCardRecent } from '@/composites/play/card/PlayCardRecent'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { presenceSentence } from '@/composites/play/mobile/presenceSentence'
import { LevelFrame } from '@/composites/play/skin/LevelFrame'
import { usePlayCard } from '@/core/hooks/data/play/usePlayCard'
import { useFocusTrap } from '@/core/hooks/interaction/layout/overlay/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/layout/overlay/useScrollLock'
import { levelShare } from '@/core/lib/play'
import { PlayPlaceStates, readPlayPlace } from '@/core/lib/play/presenceState'
import { usePlayCardStore } from '@/core/store/play/playCard'
import { ROUTES } from '@/declarations/navigation'
import {
  fillPlayMessage,
  PLAY_CARD_COPY as COPY,
  PLAY_PROFILE_COPY,
  tierOf,
} from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_CARD } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'
import { formatSince } from '@/utils/format/time/dates'

/**
 * Card of the player whose portrait was clicked
 * @param {Object} props - Card
 * @param {string} props.accountId - Player
 * @return {JSX.Element | null}
 */

export const PlayPlayerCard = ({ accountId }: { accountId: string }) => {
  const close = usePlayCardStore((state) => state.close)
  const { card, isFailed } = usePlayCard(accountId)
  const { can } = useAuthContext()
  const online = usePlayOnline().find((member) => member.accountId === accountId)
  const trap = useFocusTrap(true, close)
  useScrollLock(true)
  const CloseIcon = ICONS.close

  const { tier } = tierOf(card?.level.level ?? 0)
  const isOnline = Boolean(online) || Boolean(card?.presence)
  const place = readPlayPlace(online?.place ?? null)
  const sentence = presenceSentence(
    card?.presence ? PlayPlaceStates.Playing : place?.state,
    card?.presence?.game ?? null
  )

  return createPortal(
    <div
      className={PLAY_CARD.layer}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        ref={trap}
        role="dialog"
        aria-modal="true"
        aria-label={card?.name ?? COPY.loading}
        className={PLAY_CARD.card}
        style={{ '--tier': `var(${tier.tone})` } as CSSProperties}
      >
        <button type="button" aria-label={COPY.close} onClick={close} className={PLAY_CARD.close}>
          <CloseIcon className={PLAY_CARD.closeIcon} aria-hidden="true" />
        </button>
        <div className={PLAY_CARD.band} aria-hidden="true" />
        {!card && (
          <p className={cn(PLAY_CARD.empty, PLAY_CARD.body)}>
            {isFailed ? COPY.failed : COPY.loading}
          </p>
        )}
        {card && (
          <>
            <div className={PLAY_CARD.portrait}>
              <LevelFrame
                level={card.level.level}
                name={card.name}
                src={card.avatarUrl}
                size="xl"
              />
            </div>
            <div className={PLAY_CARD.body}>
              <div className={PLAY_CARD.who}>
                <h2 className={PLAY_CARD.name}>{card.name}</h2>
                <p className={PLAY_CARD.tier}>
                  {[
                    tier.label,
                    fillPlayMessage(COPY.level, { level: card.level.level }),
                    fillPlayMessage(COPY.xp, { xp: card.xp.toLocaleString('fr-FR') }),
                  ].join(' · ')}
                </p>
              </div>
              <div>
                <div className={PLAY_CARD.track}>
                  <span
                    className={PLAY_CARD.fill}
                    style={{ width: `${levelShare(card.level)}%` }}
                  />
                </div>
                <p className={PLAY_CARD.caption}>
                  {card.level.needed
                    ? fillPlayMessage(COPY.toNext, {
                        left: (card.level.needed - card.level.into).toLocaleString('fr-FR'),
                        next: card.level.level + 1,
                      })
                    : COPY.maxed}
                </p>
              </div>
              <dl className={PLAY_CARD.figures}>
                {(
                  [
                    [COPY.played, card.played],
                    [COPY.wins, card.wins],
                    [COPY.streak, card.bestStreak],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className={PLAY_CARD.figure}>
                    <dd className={PLAY_CARD.figureValue}>{value}</dd>
                    <dt className={PLAY_CARD.figureLabel}>{label}</dt>
                  </div>
                ))}
              </dl>
              <p className={cn(PLAY_CARD.presence, isOnline && PLAY_CARD.presenceOn)}>
                <span
                  className={cn(PLAY_CARD.dot, isOnline && PLAY_CARD.dotOn)}
                  aria-hidden="true"
                />
                {isOnline
                  ? sentence
                  : card.lastSeenAt
                    ? fillPlayMessage(PLAY_PROFILE_COPY.seen, {
                        since: formatSince(card.lastSeenAt),
                      })
                    : PLAY_PROFILE_COPY.offline}
              </p>
              <PlayCardRecent games={card.recent} />
              <div className={PLAY_CARD.actions}>
                <AppLink
                  href={ROUTES.playPlayer(card.accountId)}
                  onClick={close}
                  className={PLAY_CARD.key}
                >
                  {COPY.profile}
                </AppLink>
                {can(Permissions.PlayManage) && (
                  <AppLink
                    href={ROUTES.playAdminPlayer(card.accountId)}
                    onClick={close}
                    className={PLAY_CARD.keyGhost}
                  >
                    {COPY.admin}
                  </AppLink>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
