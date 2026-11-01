'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { ANNOUNCEMENT_PARAM } from '@/declarations/work/announcements'

import { Button } from '@/components/elements/actions/Button'
import { DatePicker } from '@/components/elements/forms/date'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Section } from '@/components/structures/page/Section'
import { AnnouncementDrawer } from '@/composites/recruitment/file/AnnouncementDrawer'
import { LIVE_PALETTE } from '@/composites/recruitment/file/planningImage'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { RangePlanning } from '@/composites/recruitment/file/RangePlanning'
import { useRecruitmentAnnouncement } from '@/core/hooks/data/recruitment/useRecruitmentAnnouncement'
import { useDiscordIdentifiers } from '@/core/hooks/data/recruitment/useDiscordIdentifiers'
import { identifierEntries, waitingRoleToken } from '@/core/lib/discord/identifiers'
import { genericAnnouncement } from '@/core/lib/recruitment/announcement'
import { openingRange, planRange, rangeEnd, shiftRange } from '@/core/lib/recruitment/rangePlanning'
import { PLANNING_COPY, RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { ROUTES } from '@/declarations/navigation'
import { INTERVIEW_AGENDA, SECTION_STYLES } from '@/declarations/ui/variants'
import type { FormValues } from '@/types/forms'
import { toDisplay } from '@/utils/format/discord'

/**
 * Calendar of the session: the period asked, ready to post on Discord
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
  const [drawerOpen, setDrawerOpen] = useState(() => can.manage && params.has(ANNOUNCEMENT_PARAM))
  const [withImage, setWithImage] = useState(true)
  const [range, setRange] = useState(() => openingRange(file.candidates))
  const plan = useMemo(
    () => planRange(file.candidates, range[0], range[1]),
    [file.candidates, range]
  )
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
    <Section bare>
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
            <div className={INTERVIEW_AGENDA.periodField}>
              <h2 className={SECTION_STYLES.title}>{PLANNING_COPY.period}</h2>
              <div className={INTERVIEW_AGENDA.periodNav}>
                <Button
                  icon="previous"
                  variant="square"
                  aria-label={PLANNING_COPY.previousPeriod}
                  onClick={() => setRange(shiftRange(range, -1))}
                />
                <div className={INTERVIEW_AGENDA.periodPicker}>
                  <DatePicker
                    range
                    dayOnly
                    label={PLANNING_COPY.period}
                    value={range}
                    onChange={(next) =>
                      Array.isArray(next) &&
                      next.length === 2 &&
                      setRange([next[0], rangeEnd(next[0], next[1])])
                    }
                  />
                </div>
                <Button
                  icon="next"
                  variant="square"
                  aria-label={PLANNING_COPY.nextPeriod}
                  onClick={() => setRange(shiftRange(range, 1))}
                />
              </div>
            </div>
            {can.manage && (
              <Button onClick={() => setDrawerOpen(true)}>{PLANNING_COPY.showAnnouncement}</Button>
            )}
          </div>

          <div className={INTERVIEW_AGENDA.picture}>
            <RangePlanning
              plan={plan}
              palette={LIVE_PALETTE}
              hrefOf={(candidateId) => ROUTES.candidate(detail.summary.id, candidateId)}
            />
          </div>
          {plan.count === 0 && (
            <p className={INTERVIEW_AGENDA.empty}>{PLANNING_COPY.periodEmpty}</p>
          )}
        </div>
      )}

      <AnnouncementDrawer
        open={can.manage && drawerOpen}
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
