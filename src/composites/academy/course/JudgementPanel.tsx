import { SanctionChip } from '@/composites/academy/course/SanctionChip'
import { useLevelLook } from '@/composites/academy/course/useLevelLook'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { JudgementCase } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { COURSE_JUDGEMENT, COURSE_PANELSTACK } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface JudgementPanelProps {
  panel: JudgementCase['panel']
}

/**
 * The Livecon in force and the sanctions the panel gives the offence
 * @param {JudgementPanelProps} props - Panel
 * @return {JSX.Element}
 */

export const JudgementPanel = ({ panel }: JudgementPanelProps) => {
  const level = useLevelLook()(panel.level)
  const LevelIcon = ICONS[level.icon]
  const PanelIcon = ICONS.liveconCrisis

  return (
    <section className={COURSE_JUDGEMENT.panel}>
      <p className={COURSE_JUDGEMENT.panelHead}>
        <PanelIcon className={COURSE_JUDGEMENT.panelHeadIcon} aria-hidden="true" />
        {COURSE_COPY.judgementPanel}
      </p>
      <div className={COURSE_JUDGEMENT.level} style={accentVars(panel.levelAccent)}>
        <LevelIcon className={COURSE_JUDGEMENT.levelIcon} aria-hidden="true" />
        <span className={COURSE_JUDGEMENT.levelName}>{level.name}</span>
      </div>
      <p className={COURSE_JUDGEMENT.offense}>{panel.offense}</p>
      <div className="flex flex-col gap-2">
        {panel.tiers.map((tier, index) => (
          <div
            key={tier.condition}
            className={cn(COURSE_PANELSTACK.tier, index === 0 && COURSE_PANELSTACK.tierLit)}
          >
            <span className={COURSE_PANELSTACK.tierName}>{tier.condition}</span>
            <span className={COURSE_PANELSTACK.measures}>
              {tier.measures.map((measure) => (
                <SanctionChip key={measure} measure={measure} />
              ))}
            </span>
            {index === 0 && (
              <span className={COURSE_JUDGEMENT.recommended}>
                {COURSE_COPY.judgementRecommended}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
