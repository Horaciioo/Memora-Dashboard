'use client'

import { BadwordsEditor } from '@/composites/modview/BadwordsEditor'
import { SharedWordsEditor } from '@/composites/modview/SharedWordsEditor'
import { RepeatWordsEditor } from '@/composites/modview/RepeatWordsEditor'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { MODVIEW_PERSONAL_COPY } from '@/declarations/modview/personal'
import { OFFENSE_SHEET } from '@/declarations/ui/variants'

/**
 * Personal detections in a page drawer: repeated phrases, own badwords, shared words
 * @param {Object} props - Drawer props
 * @param {() => void} props.onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const WatchedTermsDrawer = ({ onClose }: { onClose: () => void }) => (
  <Drawer open onClose={onClose} title={MODVIEW_PERSONAL_COPY.watchedTerms} icon="visible">
    <div className={OFFENSE_SHEET.column}>
      <RepeatWordsEditor />
      <BadwordsEditor />
      <SharedWordsEditor />
    </div>
  </Drawer>
)
