'use client'

import { ModActionBar } from '@/composites/modview/actions/ModActionBar'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import { MODVIEW_ACTION_EDITOR, MODVIEW_CHAT } from '@/declarations/ui/variants'
import type { ModActionConfig } from '@/types/modview'

// Nothing is refused in the preview
const OPEN_GATE = () => ({ allowed: true, reason: null })
const NO_RUN = () => undefined
const SAMPLE_TARGET = { chatterId: 'preview', messageId: 'preview' }

/**
 * Fake chat line wearing the buttons as they will be
 * @param {ModActionConfig[]} actions - Draft list
 * @return {JSX.Element}
 */

export const ActionPreview = ({ actions }: { actions: ModActionConfig[] }) => (
  <div className={MODVIEW_ACTION_EDITOR.preview}>
    <div className={MODVIEW_CHAT.line}>
      <span className={MODVIEW_CHAT.tools}>
        <ModActionBar
          actions={actions}
          target={SAMPLE_TARGET}
          gate={OPEN_GATE}
          run={NO_RUN}
          isStatic
        />
      </span>
      <span className={MODVIEW_CHAT.name}>{MODVIEW_ACTION_COPY.previewName}</span>
      {': '}
      {MODVIEW_ACTION_COPY.previewLine}
    </div>
  </div>
)
