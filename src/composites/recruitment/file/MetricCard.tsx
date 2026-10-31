import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { MY_STATS } from '@/declarations/ui/variants'
import type { MetricSentence } from '@/declarations/recruitment/copy'

export interface MetricCardProps {
  title: string
  sentence: MetricSentence
  children: ReactNode
}

// Colour class of an emphasised figure
const FIGURES = {
  default: MY_STATS.figure,
  success: MY_STATS.figureSuccess,
  danger: MY_STATS.figureDanger,
} as const

/**
 * Metric box, a title, one sentence, a divider and a chart
 * @param {MetricCardProps} props - Title, sentence and chart
 * @return {JSX.Element}
 */

export const MetricCard = ({ title, sentence, children }: MetricCardProps) => (
  <section className={MY_STATS.card}>
    <h3 className={MY_STATS.cardTitle}>{title}</h3>
    <p className={MY_STATS.sentence}>
      {sentence.map((part, index) =>
        typeof part === 'string' ? (
          part
        ) : 'person' in part ? (
          <span key={index} className={MY_STATS.person}>
            <Avatar name={part.person.label} src={part.person.image} size="xs" />
            <span className={MY_STATS.figure}>{part.person.label}</span>
          </span>
        ) : (
          <span key={index} className={FIGURES[part.tone ?? 'default']}>
            {part.figure}
          </span>
        )
      )}
    </p>
    <div className={MY_STATS.divider} />
    {children}
  </section>
)
