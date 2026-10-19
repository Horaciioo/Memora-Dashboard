'use client'

import { Checkbox } from '@/components/elements/forms/inputs/Toggle'
import { Section } from '@/components/structures/page/Section'
import { DoneCourses } from '@/composites/academy/junior/DoneCourses'
import { JuniorLives } from '@/composites/academy/junior/JuniorLives'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { TrainingStatuses } from '@/utils/constants/hierarchy'
import { formatDay } from '@/utils/format/dates'

/**
 * Progression of the junior: finished courses on the left, past lives on the right
 * @return {JSX.Element}
 */

export const ProgressionTab = () => {
  const { file, can, courses } = useJuniorState()
  const done = courses.filter((course) => course.status === TrainingStatuses.Done)
  // Trainings with no course behind them are ticked by a responsable
  const manual = file.junior.trainings.filter((training) => training.exercises === null)

  return (
    <div {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiTrainings }}>
      <Section title={ACADEMY_COPY.progression} description={ACADEMY_COPY.progressionLead} bare>
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <DoneCourses courses={done} />
            <JuniorLives />
          </div>

          {manual.length > 0 && (
            <div
              className={cn(
                SECTION_STYLES.panel,
                SECTION_STYLES.panelPadded,
                'flex flex-col gap-0.5'
              )}
            >
              {manual.map((training) => (
                <Checkbox
                  key={training.id}
                  checked={training.completedAt !== null}
                  disabled={!can.manage || file.isSaving}
                  onChange={(checked) => void file.setTraining(training.id, checked)}
                  label={training.name}
                  hint={
                    [
                      training.completedAt ? formatDay(training.completedAt) : null,
                      training.completedAt ? training.validatorName : null,
                      !training.completedAt && training.mandatory ? ACADEMY_COPY.mandatory : null,
                    ]
                      .filter(Boolean)
                      .join(', ') || undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
