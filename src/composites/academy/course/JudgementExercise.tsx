'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import { JudgementChat } from '@/composites/academy/course/JudgementChat'
import { JudgementFile } from '@/composites/academy/course/JudgementFile'
import { JudgementPanel } from '@/composites/academy/course/JudgementPanel'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { useChatReplay } from '@/core/hooks/interaction/useChatReplay'
import { useWarnSequence } from '@/core/hooks/interaction/useWarnSequence'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { COURSE_JUDGEMENT } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

// Beats of the case
type Phase = 'watch' | 'inspect' | 'doubt' | 'reveal' | 'warn'

/**
 * Case where the panel says one thing and the person another: the chat plays, the file and the
 * panel open, a second look is asked for, then the human answer is a warning typed and sent
 * @param {ExerciseViewProps} props - Block
 * @return {JSX.Element}
 */

export const JudgementExercise = ({
  block,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'judgement' }>>) => {
  const { session } = useAuthContext()
  const actor = session?.displayName ?? COURSE_COPY.you
  const [step, setPhase] = useState<Phase>('watch')
  const talk = useChatReplay(block.chat.length, true, ACADEMY_SETTINGS.judgementLineMs)
  // The file opens once the chat is played
  const phase: Phase = step === 'watch' && !talk.playing ? 'inspect' : step
  const isSent = useRef(false)
  const isOpen = phase !== 'watch'
  const warn = useWarnSequence(phase === 'warn', block.warn.command)

  // The case ends once the warning is kept
  useEffect(() => {
    if (warn.stage < 4 || result || isSaving || isSent.current) return
    isSent.current = true
    onAnswer('done')
    onCheck('done')
  }, [warn.stage, result, isSaving, onAnswer, onCheck])

  // A first yes asks for a second look, anything else goes to the judgement
  const answer = (isYes: boolean) => setPhase(isYes && phase === 'inspect' ? 'doubt' : 'reveal')

  const entering = (delay: number) => ({ '--delay': `${delay}ms` }) as React.CSSProperties

  return (
    <ExerciseFrame
      isBare
      autoCheck
      kind="judgement"
      title={block.title}
      result={result}
      isSaving={isSaving}
      canCheck={false}
      onCheck={() => undefined}
      onRetry={onRetry}
    >
      <div className={COURSE_JUDGEMENT.flow}>
        <Markdown source={block.context} />
        <div className={COURSE_JUDGEMENT.stage}>
          <JudgementChat
            lines={block.chat}
            shown={talk.shown}
            reply={warn.stage >= 2 ? block.warn.reply : null}
            typed={warn.typed}
            notice={warn.stage >= 1 ? COURSE_COPY.judgementNotice(block.viewer) : null}
            isFocused={phase === 'doubt'}
          />
          <div
            style={entering(150)}
            className={cn(COURSE_JUDGEMENT.enter, !isOpen && COURSE_JUDGEMENT.hidden)}
          >
            <JudgementFile
              viewer={block.viewer}
              facts={block.facts}
              isBlinking={phase === 'doubt'}
              warning={warn.stage >= 3 ? { text: block.warn.message, actor } : null}
            />
          </div>
          <div
            style={entering(350)}
            className={cn(COURSE_JUDGEMENT.enter, !isOpen && COURSE_JUDGEMENT.hidden)}
          >
            <JudgementPanel panel={block.panel} />
          </div>
        </div>

        {phase === 'watch' && (
          <p className={COURSE_JUDGEMENT.waiting}>{COURSE_COPY.judgementWatch}</p>
        )}

        {(phase === 'inspect' || phase === 'doubt') && (
          <section
            key={phase}
            className={cn(
              COURSE_JUDGEMENT.decision,
              COURSE_JUDGEMENT.enter,
              phase === 'doubt' && COURSE_JUDGEMENT.doubt
            )}
          >
            <h3 className={COURSE_JUDGEMENT.decisionTitle}>
              {phase === 'doubt' ? block.doubt.title : block.question}
            </h3>
            {phase === 'doubt' && (
              <Markdown source={block.doubt.text} className={COURSE_JUDGEMENT.decisionText} />
            )}
            <div className={COURSE_JUDGEMENT.answers}>
              <Button variant="primary" onClick={() => answer(true)}>
                {block.answers.yes}
              </Button>
              <Button variant="secondary" onClick={() => answer(false)}>
                {block.answers.no}
              </Button>
            </div>
          </section>
        )}

        {(phase === 'reveal' || phase === 'warn') && (
          <section className={cn(COURSE_JUDGEMENT.decision, COURSE_JUDGEMENT.reveal)}>
            <h3 className={COURSE_JUDGEMENT.decisionTitle}>{block.reveal.title}</h3>
            <Markdown source={block.reveal.text} className={COURSE_JUDGEMENT.decisionText} />
            {phase === 'reveal' && (
              <div className={COURSE_JUDGEMENT.answers}>
                <Button variant="primary" icon="modWarn" onClick={() => setPhase('warn')}>
                  {block.reveal.action}
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
    </ExerciseFrame>
  )
}
