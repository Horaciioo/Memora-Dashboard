'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PlayGroupPeople } from '@/composites/play/group/PlayGroupInvite'
import { PlayGroupTimeline } from '@/composites/play/group/PlayGroupTimeline'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { fillPlayMessage, PLAY_GROUP_COPY, PLAY_SETTINGS } from '@/declarations/play'
import { PLAY_BOX, PLAY_GROUP } from '@/declarations/ui/variants'

const STEPS = [PLAY_GROUP_COPY.stepName, PLAY_GROUP_COPY.stepInvite, PLAY_GROUP_COPY.stepRecap]

export interface PlayGroupCreateProps {
  candidates: { id: string; displayName: string; avatarUrl: string | null }[]
  onClose: () => void
}

/**
 * Creation in three steps: name, people to invite, recap
 * @param {PlayGroupCreateProps} props - People who can be called and close handler
 * @return {JSX.Element}
 */

export const PlayGroupCreate = ({ candidates, onClose }: PlayGroupCreateProps) => {
  const actions = usePlayGroup()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const isLast = step === STEPS.length - 1

  const submit = async () => {
    if (await actions.create(name.trim(), picked)) onClose()
  }

  return (
    <div className={PLAY_GROUP.wizard}>
      <PlayGroupTimeline steps={STEPS} current={step} />
      {step === 0 && (
        <div className={PLAY_GROUP.section}>
          <input
            autoFocus
            value={name}
            maxLength={PLAY_SETTINGS.group.nameMax}
            placeholder={PLAY_GROUP_COPY.namePlaceholder}
            aria-label={PLAY_GROUP_COPY.stepName}
            className={PLAY_BOX.input}
            onChange={(event) => setName(event.target.value)}
          />
          <p className={PLAY_BOX.hint}>{PLAY_GROUP_COPY.nameHint}</p>
        </div>
      )}
      {step === 1 && (
        <div className={PLAY_GROUP.section}>
          <PlayGroupPeople candidates={candidates} picked={picked} onChange={setPicked} />
        </div>
      )}
      {isLast && (
        <div className={PLAY_GROUP.recap}>
          <span className={PLAY_GROUP.recapName}>{name.trim()}</span>
          <span className={PLAY_BOX.hint}>
            {picked.length === 0
              ? PLAY_GROUP_COPY.recapNobody
              : fillPlayMessage(PLAY_GROUP_COPY.recapInvited, { count: picked.length })}
          </span>
        </div>
      )}
      <div className={PLAY_GROUP.footer}>
        <Button variant="arcadeGhostSmall" onClick={step === 0 ? onClose : () => setStep(step - 1)}>
          {step === 0 ? PLAY_GROUP_COPY.cancel : PLAY_GROUP_COPY.previous}
        </Button>
        <Button
          variant="arcade"
          disabled={step === 0 && !name.trim()}
          isLoading={actions.isSaving}
          onClick={isLast ? () => void submit() : () => setStep(step + 1)}
        >
          {isLast ? PLAY_GROUP_COPY.create : PLAY_GROUP_COPY.next}
        </Button>
      </div>
    </div>
  )
}
