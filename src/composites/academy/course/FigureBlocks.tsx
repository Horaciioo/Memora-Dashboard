'use client'

import { Fragment } from 'react'
import type { CSSProperties } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_FIGURE, COURSE_TONES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

type Extract_<K extends ReadBlock['kind']> = Extract<ReadBlock, { kind: K }>

// Stagger index read by the rise animation
const stagger = (index: number): CSSProperties => ({ ['--i' as string]: index })

/**
 * Cards to read at a glance: a drawing, two or three words, one sentence
 * @param {Object} props - Block
 * @return {JSX.Element}
 */

export const KeyPointsBlock = ({ block }: { block: Extract_<'keypoints'> }) => (
  <section className={COURSE_FIGURE.keypoints}>
    <h3 className={COURSE_FIGURE.keypointsTitle}>{block.title}</h3>
    <div className={COURSE_FIGURE.keypointsGrid}>
      {block.points.map((point, index) => {
        const Glyph = ICONS[point.glyph]

        return (
          <article key={point.title} className={COURSE_FIGURE.keypoint} style={stagger(index)}>
            <span className={cn(COURSE_FIGURE.disc, COURSE_TONES[point.tone ?? 'brand'])}>
              <Glyph className={COURSE_FIGURE.discIcon} aria-hidden="true" />
            </span>
            <h4 className={COURSE_FIGURE.keypointTitle}>{point.title}</h4>
            <p className={COURSE_FIGURE.keypointBody}>{point.body}</p>
          </article>
        )
      })}
    </div>
  </section>
)

/**
 * A process drawn as stops joined by arrows, each a glyph on a coloured disc
 * @param {Object} props - Block
 * @return {JSX.Element}
 */

export const DiagramBlock = ({ block }: { block: Extract_<'diagram'> }) => {
  const Arrow = ICONS.forward

  return (
    <section className={COURSE_FIGURE.diagram}>
      <h3 className={COURSE_FIGURE.diagramTitle}>{block.title}</h3>
      <div className={COURSE_FIGURE.diagramTrack}>
        {block.nodes.map((node, index) => {
          const Glyph = ICONS[node.glyph]

          return (
            <Fragment key={node.label}>
              {index > 0 && (
                <span
                  className={COURSE_FIGURE.diagramLink}
                  style={stagger(index * 2 - 1)}
                  aria-hidden="true"
                >
                  <Arrow className="h-5 w-5" />
                </span>
              )}
              <div className={COURSE_FIGURE.diagramNode} style={stagger(index * 2)}>
                <span className={cn(COURSE_FIGURE.disc, COURSE_TONES[node.tone ?? 'brand'])}>
                  <Glyph className={COURSE_FIGURE.discIcon} aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className={COURSE_FIGURE.diagramLabel}>{node.label}</span>
                  {node.note && <span className={COURSE_FIGURE.diagramNote}>{node.note}</span>}
                </span>
              </div>
            </Fragment>
          )
        })}
      </div>
      {block.caption && <p className={COURSE_FIGURE.diagramCaption}>{block.caption}</p>}
    </section>
  )
}

/**
 * What to do against what to avoid, side by side
 * @param {Object} props - Block
 * @return {JSX.Element}
 */

export const CompareBlock = ({ block }: { block: Extract_<'compare'> }) => {
  const Good = ICONS.success
  const Bad = ICONS.failure

  const side = (
    data: { title: string; items: string[] },
    tone: string,
    text: string,
    Icon: typeof Good
  ) => (
    <div className={cn(COURSE_FIGURE.compareSide, tone)}>
      <p className={cn(COURSE_FIGURE.compareHead, text)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
        {data.title}
      </p>
      <ul className={COURSE_FIGURE.compareList}>
        {data.items.map((item) => (
          <li key={item} className={COURSE_FIGURE.compareItem}>
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', text)} aria-hidden="true" />
            <Markdown source={item} />
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <section className={COURSE_FIGURE.compare}>
      <h3 className={COURSE_FIGURE.compareTitle}>{block.title}</h3>
      <div className={COURSE_FIGURE.compareGrid}>
        {side(block.good, COURSE_FIGURE.compareGood, 'text-[var(--color-success)]', Good)}
        {side(block.bad, COURSE_FIGURE.compareBad, 'text-[var(--color-danger)]', Bad)}
      </div>
    </section>
  )
}
