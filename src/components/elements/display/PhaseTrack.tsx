import { accentVars } from '@/declarations/ui/theme'
import { PHASE_TRACK } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PhaseTrackProps {
  // Phases in order
  phases: string[]
  current: string
  label: string
  accent: string | null
}

/**
 * Segments lit up to the phase in force
 * @param {string[]} phases - Phases in order
 * @param {string} current - Phase in force
 * @param {string} label - Words of the phase in force
 * @param {string | null} accent - Colour of the phase
 * @return {JSX.Element}
 */

export const PhaseTrack = ({ phases, current, label, accent }: PhaseTrackProps) => {
  const reached = phases.indexOf(current)

  return (
    <div className={PHASE_TRACK.root} style={accentVars(accent)}>
      <div className={PHASE_TRACK.segments} aria-hidden="true">
        {phases.map((phase, index) => (
          <span
            key={phase}
            className={cn(PHASE_TRACK.segment, index <= reached && PHASE_TRACK.segmentLit)}
          />
        ))}
      </div>
      <span className={PHASE_TRACK.label}>{label}</span>
    </div>
  )
}
