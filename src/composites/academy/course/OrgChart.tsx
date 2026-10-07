'use client'

import { useEffect, useId, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { useInView } from '@/core/hooks/interaction/useInView'
import { linkPoints, ORG_NODE_SIZE, ORG_TURN_RADIUS, roundedPath } from '@/core/lib/academy/orgPath'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { OrgNode, ReadBlock } from '@/declarations/academy/curriculum/types'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { COURSE_ORG, COURSE_ORG_ROLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Grid the chart is drawn on
const GRID = { width: 160, height: 100 }
// Room between a part and the bubble beside it
const BUBBLE_GAP = 4

export interface OrgChartProps {
  block: Extract<ReadBlock, { kind: 'orgChart' }>
  // Inside the box of a subject, so no box of its own
  isNested?: boolean
}

/**
 * Who decides the Livecon, from the top of the chain down to the moderation, with the words said
 * at each level coming one after the other once the chart is on screen
 * @param {OrgChartProps} props - Chart declared in code
 * @return {JSX.Element}
 */

export const OrgChart = ({ block, isNested = false }: OrgChartProps) => {
  const arrow = useId()
  const [ref, isSeen] = useInView()
  // Bubbles on display
  const [shown, setShown] = useState(0)
  const [round, setRound] = useState(0)
  const nodes = new Map<string, OrgNode>(block.nodes.map((node) => [node.key, node]))
  const { width, height } = ORG_NODE_SIZE

  useEffect(() => {
    if (!isSeen || shown >= block.bubbles.length) return

    const timer = window.setTimeout(() => setShown(shown + 1), ACADEMY_SETTINGS.orgBubbleMs)

    return () => window.clearTimeout(timer)
  }, [isSeen, shown, round, block.bubbles.length])

  const lit = new Set(block.bubbles.slice(0, shown).map((bubble) => bubble.node))

  return (
    <div ref={ref} className={COURSE_ORG.root}>
      <div className={cn(COURSE_ORG.canvas, !isNested && COURSE_ORG.canvasBox)}>
        <svg
          className={COURSE_ORG.lines}
          viewBox={`0 0 ${GRID.width} ${GRID.height}`}
          aria-hidden="true"
        >
          <defs>
            <marker
              id={arrow}
              viewBox="0 0 6 6"
              refX="5"
              refY="3"
              markerWidth="2.6"
              markerHeight="2.6"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M0 0 L6 3 L0 6 z" fill="currentColor" />
            </marker>
          </defs>
          {block.links.map((link) => {
            const from = nodes.get(link.from)
            const to = nodes.get(link.to)
            if (!from || !to) return null

            return (
              <path
                key={`${link.from}-${link.to}`}
                d={roundedPath(linkPoints(from, to, link.turns), ORG_TURN_RADIUS)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="7 6"
                strokeLinecap="butt"
                vectorEffect="non-scaling-stroke"
                markerEnd={`url(#${arrow})`}
              />
            )
          })}
        </svg>

        {block.nodes.map((node) => (
          <div
            key={node.key}
            className={cn(
              COURSE_ORG.node,
              COURSE_ORG.fill,
              COURSE_ORG_ROLES[node.role],
              lit.has(node.key) && COURSE_ORG.nodeLit
            )}
            style={{
              left: `${((node.x - width / 2) / GRID.width) * 100}%`,
              top: `${((node.y - height / 2) / GRID.height) * 100}%`,
              width: `${(width / GRID.width) * 100}%`,
              height: `${(height / GRID.height) * 100}%`,
            }}
          >
            {node.label}
          </div>
        ))}

        {block.bubbles.map((bubble, index) => {
          const node = nodes.get(bubble.node)
          if (!node) return null

          return (
            <p
              key={bubble.node}
              className={cn(
                COURSE_ORG.bubble,
                COURSE_ORG.fill,
                COURSE_ORG_ROLES[node.role],
                index >= shown && COURSE_ORG.bubbleHidden
              )}
              style={{
                right: `${100 - ((node.x - width / 2 - BUBBLE_GAP) / GRID.width) * 100}%`,
                top: `${(node.y / GRID.height) * 100}%`,
              }}
            >
              {bubble.text}
            </p>
          )
        })}
      </div>

      {shown >= block.bubbles.length && (
        <div className={COURSE_ORG.controls}>
          <Button
            icon="refresh"
            onClick={() => {
              setShown(0)
              setRound(round + 1)
            }}
          >
            {COURSE_COPY.replay}
          </Button>
        </div>
      )}
    </div>
  )
}
