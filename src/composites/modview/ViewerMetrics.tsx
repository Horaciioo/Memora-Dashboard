import { DeltaMark } from '@/components/elements/display/DeltaMark'
import { Tip } from '@/components/elements/feedback/Tip'
import { MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_USER } from '@/declarations/ui/variants'

export interface ViewerMetricsProps {
  // Null while loading
  messages: number | null
  sanctions: number | null
  // Rise over this live
  liveMessages: number
  liveSanctions: number
}

/**
 * Messages and sanctions of a viewer, with the rise of the live beside each
 * @param {ViewerMetricsProps} props - Totals and live rises
 * @return {JSX.Element}
 */

export const ViewerMetrics = ({
  messages,
  sanctions,
  liveMessages,
  liveSanctions,
}: ViewerMetricsProps) => {
  const figures = [
    {
      icon: ICONS.chat,
      label: MODVIEW_USER_COPY.statMessages,
      value: messages,
      rise: liveMessages,
      tone: 'good' as const,
    },
    {
      icon: ICONS.sanctionsPanel,
      label: MODVIEW_USER_COPY.statTotal,
      value: sanctions,
      rise: liveSanctions,
      tone: 'bad' as const,
    },
  ]

  return (
    <div className={MODVIEW_USER.stats}>
      {figures.map(({ icon: Icon, label, value, rise, tone }) => (
        <Tip floating below key={label} label={label} className={MODVIEW_USER.stat}>
          <Icon className={MODVIEW_USER.statIcon} aria-hidden="true" />
          <span className={MODVIEW_USER.statRow}>
            <span className={MODVIEW_USER.statValue}>{value ?? '–'}</span>
            <DeltaMark value={rise} tone={tone} />
          </span>
          <span className="sr-only">{label}</span>
        </Tip>
      ))}
    </div>
  )
}
