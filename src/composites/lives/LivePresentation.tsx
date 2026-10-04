'use client'

import { ModView } from '@/composites/modview/ModView'
import { useModViewScene } from '@/core/hooks/interaction/useModViewScene'
import { previewPermissions } from '@/core/lib/modview/preview'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { DEMO_SCENE } from '@/declarations/modview/demo'
import { LIVE_PRESENTATION } from '@/declarations/ui/variants'
import type { SanctionPanelView } from '@/types/sanctions'

export interface LivePresentationProps {
  panel: SanctionPanelView | null
  levelName: string | null
  actorName: string
}

/**
 * No live open: the Mod View shown alone, played on a scripted evening
 * @param {SanctionPanelView | null} panel - A real creator panel
 * @param {string | null} levelName - Level the scene plays at
 * @param {string} actorName - Name the viewer acts under
 * @return {JSX.Element}
 */

export const LivePresentation = ({ panel, levelName, actorName }: LivePresentationProps) => {
  const { driver } = useModViewScene(DEMO_SCENE, { actorName })

  return (
    <section className={LIVE_PRESENTATION.root}>
      <header className={LIVE_PRESENTATION.head}>
        <h2 className={LIVE_PRESENTATION.title}>{LIVE_PAGE_COPY.presentationTitle}</h2>
        <p className={LIVE_PRESENTATION.lead}>{LIVE_PAGE_COPY.presentationLead}</p>
      </header>
      <ModView
        driver={driver}
        permissions={previewPermissions('MODERATEUR')}
        panel={panel}
        levelName={levelName}
        showcase
      />
    </section>
  )
}
