'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { ANNOUNCEMENT_PARAM } from '@/declarations/work/announcements'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Section } from '@/components/structures/page/Section'
import { AnnouncementDrawer } from '@/composites/recruitment/file/AnnouncementDrawer'
import { LIVE_PALETTE } from '@/composites/recruitment/file/planningImage'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { WeekPlanning } from '@/composites/recruitment/file/WeekPlanning'
import { useRecruitmentAnnouncement } from '@/core/hooks/data/recruitment/useRecruitmentAnnouncement'
import { useDiscordIdentifiers } from '@/core/hooks/data/recruitment/useDiscordIdentifiers'
import { identifierEntries, waitingRoleToken } from '@/core/lib/discord/identifiers'
import { genericAnnouncement } from '@/core/lib/recruitment/announcement'
import { openingWeek, planWeek } from '@/core/lib/recruitment/weekPlanning'
import { PLANNING_COPY, RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { INTERVIEW_AGENDA } from '@/declarations/ui/variants'
import type { FormValues } from '@/types/forms'
import { periodLabel, shiftAnchor } from '@/utils/format/calendar'
import { toDisplay } from '@/utils/format/discord'

/**
 * Calendar of the session: one week at a time, ready to post on Discord
 * @return {JSX.Element}
 */

export const CalendarTab = () => {
  const { detail, file, can } = useRecruitmentState()
  const { identifiers, isSaving, store } = useDiscordIdentifiers(
    detail.summary.id,
    detail.identifiers
  )
  const params = useSearchParams()
  const announcement = useRecruitmentAnnouncement(detail.summary.id)
  const [drawerOpen, setDrawerOpen] = useState(() => params.has(ANNOUNCEMENT_PARAM))
  const [withImage, setWithImage] = useState(true)
  const [weekStart, setWeekStart] = useState(() => openingWeek(file.candidates))
  const plan = useMemo(() => planWeek(file.candidates, weekStart), [file.candidates, weekStart])
  const entries = useMemo(() => identifierEntries(identifiers), [identifiers])
  // The wording already announced reopens as it was posted
  const [draft, setDraft] = useState<string | null>(() =>
    detail.summary.announcement ? toDisplay(detail.summary.announcement, entries) : null
  )

  // Generic wording until edited
  const generic = toDisplay(
    genericAnnouncement(waitingRoleToken(identifiers, detail.summary.youtuber.id)),
    entries
  )
  const text = draft ?? generic

  // Store then name the token
  const storeIdentifier = async (values: FormValues): Promise<boolean> => {
    const saved = await store(values)
    if (saved) setDraft(toDisplay(text, identifierEntries([...identifiers, saved])))

    return saved !== null
  }

  const hasInterviews = file.candidates.some((candidate) => candidate.interviewAt !== null)

  return (
    <Section title={RECRUITMENT_COPY.tabCalendar} bare>
      {!hasInterviews ? (
        <EmptyState
          figure="meetings"
          title={RECRUITMENT_COPY.calendarEmptyTitle}
          description={RECRUITMENT_COPY.calendarEmptyDescription}
          action={null}
        />
      ) : (
        <div className={INTERVIEW_AGENDA.root}>
          <div className={INTERVIEW_AGENDA.bar}>
            <Button
              icon="back"
              variant="square"
              aria-label={PLANNING_COPY.previousWeek}
              onClick={() => setWeekStart(shiftAnchor(weekStart, 'week', -1))}
            />
            <span className={INTERVIEW_AGENDA.period}>{periodLabel(weekStart, 'week')}</span>
            <Button
              icon="next"
              variant="square"
              aria-label={PLANNING_COPY.nextWeek}
              onClick={() => setWeekStart(shiftAnchor(weekStart, 'week', 1))}
            />
            <Button onClick={() => setDrawerOpen(true)}>{PLANNING_COPY.showAnnouncement}</Button>
          </div>

          <div className={INTERVIEW_AGENDA.picture}>
            <WeekPlanning plan={plan} palette={LIVE_PALETTE} />
          </div>
          {plan.count === 0 && <p className={INTERVIEW_AGENDA.empty}>{PLANNING_COPY.weekEmpty}</p>}
        </div>
      )}

      <AnnouncementDrawer
        open={drawerOpen}
        text={text}
        isModified={draft !== null && draft !== generic}
        withImage={withImage}
        plan={plan}
        entries={entries}
        isSaving={isSaving || announcement.isSaving}
        canManage={can.manage}
        onAnnounce={announcement.announce}
        onText={setDraft}
        onRestore={() => setDraft(null)}
        onWithImage={setWithImage}
        onStore={storeIdentifier}
        onClose={() => setDrawerOpen(false)}
      />
    </Section>
  )
}
