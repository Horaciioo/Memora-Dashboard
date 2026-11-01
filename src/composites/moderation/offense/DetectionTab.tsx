'use client'

import { DetectionTester } from '@/composites/moderation/offense/DetectionTester'
import { KeywordField } from '@/composites/moderation/offense/KeywordField'
import { PhraseList } from '@/composites/moderation/offense/PhraseList'
import { useSavedTerms } from '@/core/hooks/interaction/state/useSavedTerms'
import { termsOf } from '@/core/lib/modview/terms'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_DETECTION_COPY } from '@/declarations/sanctions/detection'
import { DETECTION_PANEL, OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { FormValues } from '@/types/forms'
import type { SanctionOffenseDetail, SanctionPanelView } from '@/types/sanctions'

export interface DetectionTabProps {
  offense: SanctionOffenseDetail
  panel: SanctionPanelView
  canManage: boolean
  onSave: (id: string, values: FormValues, quiet?: boolean) => Promise<boolean>
}

/**
 * Everything the suggestion reads of an offence
 * @param {DetectionTabProps} props - Offence and handlers
 * @return {JSX.Element}
 */

export const DetectionTab = ({ offense, panel, canManage, onSave }: DetectionTabProps) => {
  const copy = SANCTION_DETECTION_COPY
  const saveField = (name: string) => (text: string) => onSave(offense.id, { [name]: text }, true)

  const [words, setWords] = useSavedTerms(termsOf(offense.keywords), saveField('keywords'))
  const [moderated, setModerated] = useSavedTerms(offense.examples, saveField('example'))
  const [tolerated, setTolerated] = useSavedTerms(offense.tolerated, saveField('toleratedExample'))

  return (
    <div className={OFFENSE_SHEET.body}>
      <p className={DETECTION_PANEL.lead}>{copy.lead}</p>

      <div className={OFFENSE_SHEET.block}>
        <span className={OFFENSE_SHEET.label}>{SANCTION_COPY.keywordsTitle}</span>
        <KeywordField words={words} canManage={canManage} onChange={setWords} />
      </div>

      <div className={OFFENSE_SHEET.block}>
        <span className={OFFENSE_SHEET.label}>{SANCTION_COPY.moderateTitle}</span>
        <p className={OFFENSE_SHEET.how}>{copy.moderateHint}</p>
        <PhraseList
          phrases={moderated}
          edge={DETECTION_PANEL.moderate}
          placeholder={copy.moderatePlaceholder}
          blank={copy.moderateBlank}
          canManage={canManage}
          onChange={setModerated}
        />
      </div>

      <div className={OFFENSE_SHEET.block}>
        <span className={OFFENSE_SHEET.label}>{SANCTION_COPY.tolerateTitle}</span>
        <p className={OFFENSE_SHEET.how}>{copy.tolerateHint}</p>
        <PhraseList
          phrases={tolerated}
          edge={DETECTION_PANEL.tolerate}
          placeholder={copy.toleratePlaceholder}
          blank={copy.tolerateBlank}
          canManage={canManage}
          onChange={setTolerated}
        />
      </div>

      <div className={OFFENSE_SHEET.block}>
        <span className={OFFENSE_SHEET.label}>{copy.testerTitle}</span>
        <DetectionTester panel={panel} offenseId={offense.id} />
      </div>
    </div>
  )
}
