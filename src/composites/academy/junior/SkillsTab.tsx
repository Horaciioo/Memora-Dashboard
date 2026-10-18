'use client'

import Link from '@/components/elements/navigation/AppLink'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Section } from '@/components/structures/page/Section'
import { SkillGrid } from '@/composites/academy/junior/SkillGrid'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { ROUTES } from '@/declarations/navigation'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'

/**
 * Competencies of the junior, graded in place under their category
 * @return {JSX.Element}
 */

export const SkillsTab = () => {
  const { file, can } = useJuniorState()

  return (
    <div {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiSkills }}>
      <Section title={ACADEMY_COPY.tabCompetences} description={ACADEMY_COPY.skillsLead} bare>
        {file.skills.length === 0 ? (
          <EmptyState
            figure="academy"
            title={ACADEMY_COPY.noTrainingsTitle}
            description={ACADEMY_COPY.noTrainingsDescription}
            action={
              <Link href={ROUTES.academy}>
                <Button variant="primary" icon="academy">
                  {ACADEMY_COPY.openSessions}
                </Button>
              </Link>
            }
          />
        ) : (
          <SkillGrid
            skills={file.skills}
            canWrite={can.writeSkills && !file.isSaving}
            onGrade={(skillId, percent) => void file.setSkill(skillId, percent)}
          />
        )}
      </Section>
    </div>
  )
}
