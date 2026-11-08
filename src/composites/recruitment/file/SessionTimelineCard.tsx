'use client'

import { ScrollCard } from '@/components/structures/data/ScrollCard'
import { Timeline, type TimelineItem } from '@/components/structures/data/Timeline'
import { AccountActivationStep } from '@/composites/onboarding/AccountActivationStep'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { stepState } from '@/core/lib/recruitment/stepState'
import { ACCOUNT_ACTIVATION_COPY } from '@/declarations/onboarding/copy'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { useMenu } from '@/managers/front-end'

/**
 * Timeline of the session, level with the first box: right click edits a step
 * @return {JSX.Element}
 */

export const SessionTimelineCard = () => {
  const { file, can, stepMenu, toggleStep, isStepMovable } = useRecruitmentState()
  const { contextMenu } = useMenu()
  const nextId = file.steps.find((step) => step.doneAt === null)?.id

  const items: TimelineItem[] = file.steps.map((step) => ({
    id: step.id,
    state: stepState(step, nextId),
    // Old rows keep their stored title
    title: step.emitsInvite ? ACCOUNT_ACTIVATION_COPY.title : step.title,
    onSelect: isStepMovable(step) ? () => toggleStep(step) : undefined,
    onContextMenu: contextMenu(stepMenu(step), step.title),
    children: step.emitsInvite && (
      <AccountActivationStep
        activation={file.activation}
        isSaving={file.isSaving}
        canManage={can.manageLinks}
        onActivate={file.activateAccounts}
      />
    ),
  }))

  return (
    <ScrollCard title={RECRUITMENT_COPY.timelineTitle}>
      <Timeline compact label={RECRUITMENT_COPY.timelineTitle} items={items} />
    </ScrollCard>
  )
}
