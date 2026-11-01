'use client'

import { useMemo, useState } from 'react'

import { Status } from '@/components/elements/display/Status'
import { Input } from '@/components/elements/forms/inputs/Input'
import { explainDetection } from '@/core/lib/modview/detection'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_DETECTION_COPY } from '@/declarations/sanctions/detection'
import { DETECTION_PANEL, OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { SanctionPanelView } from '@/types/sanctions'

export interface DetectionTesterProps {
  panel: SanctionPanelView
  offenseId: string
}

/**
 * Live test of the suggestion engine
 * @param {DetectionTesterProps} props - Panel and offence
 * @return {JSX.Element}
 */

export const DetectionTester = ({ panel, offenseId }: DetectionTesterProps) => {
  const [text, setText] = useState('')
  const result = useMemo(() => explainDetection(panel, { text, flagged: [] }), [panel, text])
  const copy = SANCTION_DETECTION_COPY
  const { offense, spared } = result

  // Verdict line
  const verdict = !text.trim()
    ? null
    : !offense
      ? { tone: 'neutral' as const, icon: 'info' as const, label: copy.testerNone }
      : offense.id === offenseId
        ? { tone: 'success' as const, icon: 'confirm' as const, label: copy.testerHere }
        : {
            tone: 'caution' as const,
            icon: 'info' as const,
            label: copy.testerOther.replace('{offense}', offense.name),
          }

  const step = offense?.firstRung?.measures.map((measure) => measure.name).join(' + ')

  return (
    <div className={DETECTION_PANEL.tester}>
      <Input
        type="search"
        value={text}
        placeholder={copy.testerPlaceholder}
        aria-label={copy.testerTitle}
        maxLength={500}
        onChange={(event) => setText(event.target.value)}
      />
      {verdict ? (
        <div className={DETECTION_PANEL.verdict} aria-live="polite">
          <Status
            label={verdict.label}
            tone={verdict.tone}
            icon={verdict.icon}
            className="whitespace-normal"
          />
          {result.via === 'keywords' && (
            <span className={DETECTION_PANEL.verdictNote}>
              {`${copy.testerWords} : ${result.words.join(', ')}`}
            </span>
          )}
          {result.via === 'text' && (
            <span className={DETECTION_PANEL.verdictNote}>{copy.testerText}</span>
          )}
          {spared && (
            <span className={DETECTION_PANEL.verdictNote}>
              {copy.testerSpared
                .replace('{phrase}', spared.phrase)
                .replace('{offense}', spared.offense)}
            </span>
          )}
          {offense && (
            <span className={DETECTION_PANEL.verdictNote}>
              {`${copy.testerFirst} : ${step || SANCTION_COPY.noLadder}`}
            </span>
          )}
        </div>
      ) : (
        <p className={OFFENSE_SHEET.placeholder}>{copy.testerIdle}</p>
      )}
    </div>
  )
}
