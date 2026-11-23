'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { pendingOf, waitingLines } from '@/core/lib/recap/absences'
import type { DeckCard } from '@/core/lib/recap/deck'
import { useRecapDeck } from '@/core/store/recapDeck'
import { RECAP_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/recap'
import { RECAP_CHAPTERS } from '@/declarations/recap/chapters'
import { RECAP_COPY } from '@/declarations/recap/copy'
import { ICONS } from '@/declarations/ui/icons'
import { ASSISTANT_STYLES, RECAP_DECK } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { MemberAbsence } from '@/types/members'
import { cn } from '@/utils/classnames'
import { absenceRange } from '@/utils/format/absences'
import { AbsenceStatuses } from '@/utils/constants/workflow'

export interface RecapAbsenceCardProps {
  card: DeckCard
  isCompact?: boolean
}

/**
 * The absences waiting for the member's word, ticked then validated or refused in one go
 * @param {DeckCard} card - Point
 * @return {JSX.Element | null}
 */

export const RecapAbsenceCard = ({ card, isCompact = false }: RecapAbsenceCardProps) => {
  const { session } = useAuthContext()
  const finish = useRecapDeck((state) => state.finish)
  const skip = useRecapDeck((state) => state.skip)
  const [pending, setPending] = useState<MemberAbsence[] | null>(null)
  const [ticked, setTicked] = useState<string[]>([])
  const [isBusy, setBusy] = useState(false)
  const [isFailed, setFailed] = useState(false)
  const CheckGlyph = ICONS.check

  // Read again each time the member settled some
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (!session) return

    let isLive = true

    void pendingOf(session.id)
      .then((list) => {
        if (!isLive) return

        setPending(list)
        setTicked(list.map((absence) => absence.id))
        if (list.length === 0) finish(card.key)
      })
      .catch(() => undefined)

    return () => {
      isLive = false
    }
  }, [session, round, finish, card.key])

  // Said once for the list read, so the line does not change under the member's eyes
  const voice = useMemo(
    () => (pending && pending.length > 0 ? waitingLines(pending) : []),
    [pending]
  )

  if (!pending || pending.length === 0) return null

  const settle = async (status: string) => {
    setBusy(true)
    setFailed(false)
    try {
      for (const id of ticked) await apiPatch(API_ROUTES.absence(id), { status })
      setRound((current) => current + 1)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }
  const toggle = (id: string) =>
    setTicked((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    )

  return (
    <article
      className={cn(RECAP_DECK.card, isCompact && RECAP_DECK.cardCompact)}
      aria-label={RECAP_CHAPTERS.absences}
    >
      <p className={RECAP_DECK.kicker}>{RECAP_CHAPTERS.absences}</p>
      <p className={RECAP_DECK.voice} aria-live="polite">
        <BrainMark className={RECAP_DECK.voiceMark} />
        {voice.join(' ')}
      </p>
      <div className={RECAP_DECK.checks} role="group">
        {pending.map((absence) => {
          const isOn = ticked.includes(absence.id)

          return (
            <button
              key={absence.id}
              type="button"
              role="checkbox"
              aria-checked={isOn}
              onClick={() => toggle(absence.id)}
              className={ASSISTANT_STYLES.checkRow}
            >
              <span className={cn(ASSISTANT_STYLES.checkBox, isOn && ASSISTANT_STYLES.checkBoxOn)}>
                {isOn && <CheckGlyph className={ASSISTANT_STYLES.checkGlyph} aria-hidden="true" />}
              </span>
              <span className="min-w-0 truncate">
                {absence.memberName}, {absenceRange(absence.startDate, absence.endDate)}
              </span>
            </button>
          )
        })}
      </div>
      {isFailed && <p className={RECAP_DECK.error}>{RECAP_COPY.failed}</p>}
      <div className={RECAP_DECK.actions}>
        <Button
          variant="success"
          isLoading={isBusy}
          disabled={ticked.length === 0}
          onClick={() => void settle(AbsenceStatuses.Approved)}
        >
          {ticked.length > 1 ? COPY.verdictApprove : COPY.approve}
        </Button>
        <Button
          variant="danger"
          isLoading={isBusy}
          disabled={ticked.length === 0}
          onClick={() => void settle(AbsenceStatuses.Refused)}
        >
          {ticked.length > 1 ? COPY.verdictRefuse : COPY.refuse}
        </Button>
        <Button variant="ghost" onClick={() => skip(card.key)}>
          {RECAP_COPY.skip}
        </Button>
      </div>
    </article>
  )
}
