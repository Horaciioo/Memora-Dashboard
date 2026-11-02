import { SettingsGroup } from '@/composites/preferences/SettingsGroup'
import { SECURITY_COPY } from '@/declarations/preferences/settings'
import { ICONS } from '@/declarations/ui/icons'
import { SECURITY_SCORE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * One point of the protection checklist
 * @typedef {Object} ProtectionCheck
 * @property {string} title - What is checked
 * @property {string} lead - What it says right now
 * @property {boolean} isOk - Point is secured
 */

export interface ProtectionCheck {
  title: string
  lead: string
  isOk: boolean
}

export interface ProtectionScoreProps {
  checks: ProtectionCheck[]
}

// Circumference of the ring, in the 36 unit square of its svg
const RING_RADIUS = 15.9155
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

/**
 * Ring and checklist telling how well the account is kept
 * @param {ProtectionCheck[]} checks - Points checked
 * @return {JSX.Element}
 */

export const ProtectionScore = ({ checks }: ProtectionScoreProps) => {
  const secured = checks.filter((check) => check.isOk).length
  const isFull = secured === checks.length
  const Ok = ICONS.success
  const Warn = ICONS.warning

  return (
    <SettingsGroup title={SECURITY_COPY.scoreTitle}>
      <div className={SECURITY_SCORE.root}>
        <div
          className={SECURITY_SCORE.ring}
          role="img"
          aria-label={`${secured} ${SECURITY_COPY.scoreOf} ${checks.length}`}
        >
          <svg viewBox="0 0 36 36" className={SECURITY_SCORE.ringSvg} aria-hidden="true">
            <circle
              cx="18"
              cy="18"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="3"
              className={SECURITY_SCORE.ringTrack}
            />
            <circle
              cx="18"
              cy="18"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - secured / checks.length)}
              className={cn(SECURITY_SCORE.ringValue, !isFull && SECURITY_SCORE.ringWarn)}
            />
          </svg>
          <div className={SECURITY_SCORE.ringLabel}>
            <span className={SECURITY_SCORE.ringNumber}>{secured}</span>
            <span className={SECURITY_SCORE.ringOf}>
              {SECURITY_COPY.scoreOf} {checks.length}
            </span>
          </div>
        </div>
        <ul className={SECURITY_SCORE.list}>
          {checks.map((check) => {
            const Mark = check.isOk ? Ok : Warn

            return (
              <li key={check.title} className={SECURITY_SCORE.item}>
                <Mark
                  className={cn(
                    SECURITY_SCORE.mark,
                    check.isOk ? SECURITY_SCORE.markOk : SECURITY_SCORE.markWarn
                  )}
                  aria-hidden="true"
                />
                <div>
                  <p className={SECURITY_SCORE.title}>{check.title}</p>
                  <p className={SECURITY_SCORE.lead}>{check.lead}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </SettingsGroup>
  )
}
