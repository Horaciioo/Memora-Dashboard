'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import { asList, asRecord } from '@/composites/academy/course/types'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { shuffled } from '@/core/lib/curriculum/shuffle'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { COURSE_EXERCISE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Container of the items not placed yet
const POOL = 'pool'

/**
 * Sort exercise: items go into their column by dragging
 * @param {ExerciseViewProps} props - Block
 * @return {JSX.Element}
 */

export const SortExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'sort' }>>) => {
  const placed = asRecord(answer) as Record<string, string>
  const [held, setHeld] = useState<string | null>(null)
  const locked = result !== undefined
  const items = shuffled(block.items, block.key)

  const place = (itemKey: string, bucket: string) => {
    const next = { ...placed }
    if (bucket === POOL) delete next[itemKey]
    else next[itemKey] = bucket
    onAnswer(next)
    setHeld(null)
  }

  const { over, itemProps, containerProps } = useDragAndDrop((item, container) =>
    place(item.id, container)
  )

  const chip = (itemKey: string, label: string, from: string) => {
    const mark = result?.marks[itemKey]

    return (
      <button
        key={itemKey}
        type="button"
        disabled={locked}
        aria-pressed={held === itemKey}
        className={cn(
          COURSE_EXERCISE.chip,
          held === itemKey && COURSE_EXERCISE.chipHeld,
          mark === true && COURSE_EXERCISE.chipRight,
          mark === false && COURSE_EXERCISE.chipWrong
        )}
        onClick={(event) => {
          // The column under the chip keeps its own touch
          event.stopPropagation()
          setHeld(held === itemKey ? null : itemKey)
        }}
        {...(locked ? {} : itemProps({ id: itemKey, from }))}
      >
        {label}
      </button>
    )
  }

  const zone = (id: string) => ({
    ...(locked ? {} : containerProps(id)),
    onClick: () => held && place(held, id),
  })

  const loose = items.filter((item) => !placed[item.key])

  return (
    <ExerciseFrame
      kind="sort"
      title={block.title}
      result={result}
      isSaving={isSaving}
      canCheck={loose.length === 0}
      onCheck={() => onCheck()}
      onRetry={onRetry}
    >
      <p className={COURSE_EXERCISE.prompt}>{block.prompt}</p>
      {!locked && <p className={COURSE_EXERCISE.hint}>{COURSE_COPY.sortHint}</p>}

      <div
        className={cn(COURSE_EXERCISE.pool, over === POOL && COURSE_EXERCISE.bucketOver)}
        {...zone(POOL)}
      >
        {loose.map((item) => chip(item.key, item.label, POOL))}
      </div>

      <div className={COURSE_EXERCISE.sortBoard}>
        {block.buckets.map((bucket) => (
          <div
            key={bucket.key}
            className={cn(
              COURSE_EXERCISE.bucket,
              over === bucket.key && COURSE_EXERCISE.bucketOver
            )}
            {...zone(bucket.key)}
          >
            <span className={COURSE_EXERCISE.bucketTitle}>{bucket.label}</span>
            {items
              .filter((item) => placed[item.key] === bucket.key)
              .map((item) => chip(item.key, item.label, bucket.key))}
          </div>
        ))}
      </div>

      {result && (
        <div className={COURSE_EXERCISE.explanation}>
          <Markdown source={block.explanation} />
        </div>
      )}
    </ExerciseFrame>
  )
}

/**
 * Order exercise: items shuffled on screen
 * @param {ExerciseViewProps} props - Block
 * @return {JSX.Element}
 */

export const OrderExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'order' }>>) => {
  const start = shuffled(
    block.items.map((item) => item.key),
    block.key
  )
  const current = asList(answer).length === block.items.length ? asList(answer) : start
  const labels = new Map(block.items.map((item) => [item.key, item.label]))
  const locked = result !== undefined

  const move = (from: number, to: number) => {
    if (to < 0) return

    // Dropped below the last row lands on it
    const target = Math.min(to, current.length - 1)
    const next = [...current]
    const [taken] = next.splice(from, 1)
    next.splice(target, 0, taken!)
    onAnswer(next)
  }

  const { over, itemProps, containerProps } = useDragAndDrop((item, _container, index) => {
    const from = current.indexOf(item.id)
    if (from === -1) return

    move(from, index > from ? index - 1 : index)
  })

  return (
    <ExerciseFrame
      kind="order"
      title={block.title}
      result={result}
      isSaving={isSaving}
      // The shuffled start already is an answer
      canCheck
      onCheck={() => onCheck(current)}
      onRetry={onRetry}
    >
      <p className={COURSE_EXERCISE.prompt}>{block.prompt}</p>
      {!locked && <p className={COURSE_EXERCISE.hint}>{COURSE_COPY.orderHint}</p>}
      <ol
        className={cn(COURSE_EXERCISE.orderList, over === 'list' && COURSE_EXERCISE.bucketOver)}
        {...(locked ? {} : containerProps('list'))}
      >
        {current.map((key, index) => {
          const mark = result?.marks[key]

          return (
            <li
              key={key}
              data-drop-index={index}
              className={cn(
                COURSE_EXERCISE.orderRow,
                mark === true && COURSE_EXERCISE.choiceRight,
                mark === false && COURSE_EXERCISE.choiceWrong
              )}
              {...(locked ? {} : itemProps({ id: key, from: 'list' }))}
            >
              <span className={COURSE_EXERCISE.orderIndex}>{index + 1}</span>
              <span className={COURSE_EXERCISE.orderLabel}>{labels.get(key)}</span>
              {!locked && (
                <span className={COURSE_EXERCISE.orderMoves}>
                  <Button
                    variant="icon"
                    icon="climb"
                    aria-label={COURSE_COPY.moveUp}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  />
                  <Button
                    variant="icon"
                    icon="drop"
                    aria-label={COURSE_COPY.moveDown}
                    disabled={index === current.length - 1}
                    onClick={() => move(index, index + 1)}
                  />
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {result && (
        <div className={COURSE_EXERCISE.explanation}>
          <Markdown source={block.explanation} />
        </div>
      )}
    </ExerciseFrame>
  )
}
