'use client'

import { useMemo, useState } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { ModView } from '@/composites/modview/ModView'
import { useModViewScene } from '@/core/hooks/interaction/useModViewScene'
import { previewPermissions } from '@/core/lib/modview/preview'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { FocusItem, ReadBlock } from '@/declarations/academy/curriculum/types'
import { COURSE_FOCUS, COURSE_READ, COURSE_TOUR } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

export interface FocusBlockProps {
  block: Extract<ReadBlock, { kind: 'focus' }>
}

/**
 * Parts of the Mod View one by one: tabs on the left, the picked part floating beside them and
 * its words under it
 * @param {FocusBlockProps} props - Parts declared in code
 * @return {JSX.Element}
 */

export const FocusBlock = ({ block }: FocusBlockProps) => {
  const [picked, setPicked] = useState(block.items[0]?.key ?? '')
  const item = block.items.find((entry) => entry.key === picked) ?? block.items[0]

  return (
    <div className={COURSE_FOCUS.root}>
      {item && (
        <div className={COURSE_FOCUS.column}>
          <section className={COURSE_READ.section}>
            {block.title && <h2 className={COURSE_READ.heading}>{block.title}</h2>}
            <div className={COURSE_READ.panel}>
              <Markdown source={block.prompt} className={COURSE_READ.text} />
            </div>
          </section>

          <div className={COURSE_FOCUS.layout}>
            <nav className={COURSE_FOCUS.tabs} role="tablist" aria-label={COURSE_COPY.tourList}>
              {block.items.map((entry) => {
                const isActive = entry.key === item.key

                return (
                  <button
                    key={entry.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={cn(COURSE_TOUR.stop, isActive && COURSE_TOUR.stopActive)}
                    onClick={() => setPicked(entry.key)}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(COURSE_TOUR.stopDot, isActive && COURSE_TOUR.stopDotActive)}
                    />
                    {entry.label}
                  </button>
                )
              })}
            </nav>

            <FocusStage key={item.key} item={item} />

            <section className={COURSE_FOCUS.note} role="tabpanel" aria-label={item.label}>
              <p className={COURSE_FOCUS.noteTitle}>{item.label}</p>
              <div className={COURSE_FOCUS.points}>
                {item.points.map((point) => (
                  <Markdown key={point} source={point} />
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * The picked part of the Mod View, played on its scene
 * @param {{ item: FocusItem }} props - Part
 * @return {JSX.Element}
 */

const FocusStage = ({ item }: { item: FocusItem }) => {
  const { session } = useAuthContext()
  const { driver } = useModViewScene(item.scene, {
    actorName: session?.displayName ?? COURSE_COPY.you,
  })
  const lit = useMemo(
    () => ({ ...driver, spotlight: driver.spotlight ?? item.spotlight ?? null }),
    [driver, item.spotlight]
  )

  return (
    <div className={COURSE_FOCUS.stage}>
      <ModView
        driver={lit}
        permissions={previewPermissions('JUNIOR')}
        panel={null}
        levelName={null}
        embedded
        only={item.windows}
      />
    </div>
  )
}
