'use client'

import { useMemo, useState } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { ModView } from '@/composites/modview/ModView'
import { useModViewScene } from '@/core/hooks/interaction/useModViewScene'
import { previewPermissions } from '@/core/lib/modview/preview'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { FocusItem, ReadBlock } from '@/declarations/academy/curriculum/types'
import { COURSE_FOCUS } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

export interface FocusBlockProps {
  block: Extract<ReadBlock, { kind: 'focus' }>
}

/**
 * Parts of the Mod View one by one: the words on the left
 * @param {FocusBlockProps} props - Parts declared in code
 * @return {JSX.Element}
 */

export const FocusBlock = ({ block }: FocusBlockProps) => {
  const [picked, setPicked] = useState(block.items[0]?.key ?? '')
  const item = block.items.find((entry) => entry.key === picked) ?? block.items[0]

  return (
    <div className={COURSE_FOCUS.root}>
      <div className={COURSE_FOCUS.prompt}>
        <Markdown source={block.prompt} />
      </div>
      <div className={COURSE_FOCUS.picks} role="tablist">
        {block.items.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={entry.key === item?.key}
            className={cn(COURSE_FOCUS.pick, entry.key === item?.key && COURSE_FOCUS.pickActive)}
            onClick={() => setPicked(entry.key)}
          >
            {entry.label}
          </button>
        ))}
      </div>
      {item && <FocusPart key={item.key} item={item} />}
    </div>
  )
}

/**
 * One part
 * @param {{ item: FocusItem }} props - Part
 * @return {JSX.Element}
 */

const FocusPart = ({ item }: { item: FocusItem }) => {
  const { session } = useAuthContext()
  const { driver } = useModViewScene(item.scene, {
    actorName: session?.displayName ?? COURSE_COPY.you,
  })
  const lit = useMemo(
    () => ({ ...driver, spotlight: driver.spotlight ?? item.spotlight ?? null }),
    [driver, item.spotlight]
  )

  return (
    <div className={COURSE_FOCUS.layout} role="tabpanel">
      <div className={COURSE_FOCUS.points}>
        {item.points.map((point) => (
          <div key={point} className={COURSE_FOCUS.point}>
            <Markdown source={point} />
          </div>
        ))}
      </div>
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
    </div>
  )
}
