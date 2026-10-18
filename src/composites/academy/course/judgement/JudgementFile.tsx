import { nameColour } from '@/declarations/academy/chat'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { JudgementFact } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CHAT, COURSE_JUDGEMENT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface JudgementFileProps {
  viewer: string
  facts: JudgementFact[]
  // The facts flash
  isBlinking: boolean
  // Warning written in the history, with who wrote it
  warning: { text: string; actor: string } | null
}

/**
 * The viewer file: who they are, what they did, and the moderation history that keeps the warning
 * @param {JudgementFileProps} props - File
 * @return {JSX.Element}
 */

export const JudgementFile = ({ viewer, facts, isBlinking, warning }: JudgementFileProps) => {
  const WarnIcon = ICONS.modWarn

  return (
    <article className={COURSE_JUDGEMENT.file}>
      <div className={COURSE_JUDGEMENT.banner} />
      <div className={COURSE_JUDGEMENT.who}>
        <span className={COURSE_JUDGEMENT.avatar} style={{ background: nameColour(viewer) }}>
          {viewer.slice(0, 1).toUpperCase()}
        </span>
        <h3 className={COURSE_JUDGEMENT.name} style={{ color: nameColour(viewer) }}>
          {viewer}
        </h3>
      </div>
      <div className={COURSE_JUDGEMENT.facts}>
        {facts.map((fact) => {
          const Icon = ICONS[fact.icon]

          return (
            <div
              key={fact.key}
              className={cn(COURSE_JUDGEMENT.fact, isBlinking && fact.blink && 'judgement-blink')}
            >
              <p className={COURSE_JUDGEMENT.factHead}>
                <Icon className={COURSE_JUDGEMENT.factIcon} aria-hidden="true" />
                {fact.label}
              </p>
              <p className={COURSE_JUDGEMENT.factValue}>{fact.value}</p>
            </div>
          )
        })}
      </div>
      <div className={COURSE_JUDGEMENT.history}>
        <p className={COURSE_JUDGEMENT.factHead}>{COURSE_COPY.judgementHistory}</p>
        {warning ? (
          <div className={cn(COURSE_JUDGEMENT.entry, COURSE_CHAT.lineIn)}>
            <WarnIcon className={COURSE_JUDGEMENT.entryIcon} aria-hidden="true" />
            <div>
              <p className={COURSE_JUDGEMENT.entryTitle}>{COURSE_COPY.judgementWarnLabel}</p>
              <p>{warning.text}</p>
              <p className={COURSE_JUDGEMENT.entryMeta}>
                {`${COURSE_COPY.judgementBy(warning.actor)}, ${COURSE_COPY.judgementNow}`}
              </p>
            </div>
          </div>
        ) : (
          <p className={COURSE_JUDGEMENT.historyEmpty}>{COURSE_COPY.judgementHistoryEmpty}</p>
        )}
      </div>
    </article>
  )
}
