'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { ModView } from '@/composites/modview/ModView'
import { useModViewScene } from '@/core/hooks/interaction/useModViewScene'
import { previewPermissions } from '@/core/lib/modview/preview'
import type { PreviewSeat } from '@/core/lib/modview/preview'
import { DEMO_SCENE } from '@/declarations/modview/demo'
import { MODVIEW_PREVIEW_COPY, PREVIEW_LEVELS, PREVIEW_SEATS } from '@/declarations/modview/preview'
import { MODVIEW_PREVIEW } from '@/declarations/ui/variants'
import type { SanctionPanelView } from '@/types/sanctions'

export interface ModViewPreviewProps {
  panel: SanctionPanelView | null
  levelNames: Record<string, string>
  actorName: string
}

/**
 * Mod View on a scripted evening
 * @param {SanctionPanelView | null} panel - A real creator panel
 * @param {Record<string, string>} levelNames - Livecon names by level
 * @param {string} actorName - Name the viewer acts under
 * @return {JSX.Element}
 */

export const ModViewPreview = ({ panel, levelNames, actorName }: ModViewPreviewProps) => {
  const [seat, setSeat] = useState<PreviewSeat>('MODERATEUR')
  const [level, setLevel] = useState('3')
  const { driver, controls } = useModViewScene(DEMO_SCENE, { actorName })

  // The chosen level overrides the scene's
  const shown = useMemo(
    () => ({ ...driver, state: { ...driver.state, liveconLevel: Number(level) } }),
    [driver, level]
  )

  return (
    <div className={MODVIEW_PREVIEW.root}>
      <div className={MODVIEW_PREVIEW.toolbar}>
        <SegmentedControl
          label={MODVIEW_PREVIEW_COPY.seat}
          options={PREVIEW_SEATS}
          value={seat}
          onChange={setSeat}
        />
        <SegmentedControl
          label={MODVIEW_PREVIEW_COPY.level}
          options={PREVIEW_LEVELS}
          value={level}
          onChange={setLevel}
        />
        <Button variant="secondary" onClick={controls.restart}>
          {MODVIEW_PREVIEW_COPY.restart}
        </Button>
      </div>
      <ModView
        driver={shown}
        permissions={previewPermissions(seat)}
        panel={panel}
        levelName={levelNames[level] ?? null}
      />
    </div>
  )
}
