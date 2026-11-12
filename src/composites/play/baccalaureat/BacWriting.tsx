'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import type { BacBoardView, BacRoundView } from '@/composites/play/baccalaureat/types'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Pause before a draft is saved
const SAVE_DELAY_MS = 600

export interface BacWritingProps {
  sessionId: string
  round: BacRoundView
  settings: BacBoardView['settings']
  isSeated: boolean
}

/**
 * One field per category, drafts saved as they are typed
 * @param {BacWritingProps} props - Round and settings
 * @return {JSX.Element}
 */

export const BacWriting = ({ sessionId, round, settings, isSeated }: BacWritingProps) => {
  const { act, isSaving } = usePlayAct(sessionId)
  const drafts = usePlayAct(sessionId)
  const [words, setWords] = useState<Record<string, string>>(() =>
    Object.fromEntries(round.answers.map((answer) => [answer.category, answer.word]))
  )
  const pending = useRef<number | null>(null)
  // Words the server holds, nothing sent while they match
  const saved = useRef(JSON.stringify(words))

  /**
   * Send the words once they differ from the saved ones
   * @param {Record<string, string>} answers - Words typed
   * @return {Promise<void>} - Sent
   */

  const save = async (answers: Record<string, string>) => {
    const text = JSON.stringify(answers)
    if (text === saved.current) return
    if (await drafts.act({ type: 'write', answers })) saved.current = text
  }

  // Debounced draft save, no refresh
  useEffect(() => {
    if (!isSeated) return
    if (pending.current) window.clearTimeout(pending.current)
    pending.current = window.setTimeout(() => {
      pending.current = null
      void save(words)
    }, SAVE_DELAY_MS)

    return () => {
      if (pending.current) window.clearTimeout(pending.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, isSeated])

  const isStopped = Boolean(round.stoppedById)
  const isFull = settings.categories.every((entry) => words[entry.id]?.trim())
  // Button only when the host switched manual stop on
  const hasStopButton = settings.stop && !settings.autoStop
  const DoneIcon = ICONS.playTick
  const stop = async () => {
    if (pending.current) window.clearTimeout(pending.current)
    pending.current = null
    await save(words)
    await act({ type: 'stop' })
  }

  return (
    <div className={BAC_BOARD.board}>
      <div className={BAC_BOARD.fields}>
        {settings.categories.map((entry, index) => {
          const isFilled = Boolean(words[entry.id]?.trim())

          return (
            <label key={entry.id} className={BAC_BOARD.field}>
              <span className={cn(BAC_BOARD.fieldIndex, isFilled && BAC_BOARD.fieldDone)}>
                {isFilled ? (
                  <DoneIcon className={BAC_BOARD.fieldIcon} aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span className={BAC_BOARD.fieldBody}>
                <span className={BAC_BOARD.fieldLabel}>{entry.label}</span>
                <input
                  className={BAC_BOARD.input}
                  value={words[entry.id] ?? ''}
                  disabled={!isSeated || isStopped}
                  autoComplete="off"
                  placeholder={fillPlayMessage(BAC_BOARD_COPY.wordPlaceholder, {
                    letter: round.letter,
                  })}
                  onChange={(event) =>
                    setWords((current) => ({ ...current, [entry.id]: event.target.value }))
                  }
                />
              </span>
            </label>
          )
        })}
      </div>
      {isSeated && hasStopButton && !isStopped && (
        <div className={BAC_BOARD.actions}>
          <Button
            variant="arcade"
            disabled={!isFull}
            isLoading={isSaving}
            onClick={() => void stop()}
          >
            {BAC_BOARD_COPY.stop}
          </Button>
        </div>
      )}
    </div>
  )
}
