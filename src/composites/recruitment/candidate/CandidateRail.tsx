'use client'

import { Byline } from '@/components/elements/display/Byline'
import type { ReactNode } from 'react'

import { CopyValue } from '@/components/elements/actions/CopyValue'
import { Avatar } from '@/components/elements/display/Avatar'
import { Markdown } from '@/components/elements/display/Markdown'
import { Status } from '@/components/elements/display/Status'
import { InlineText } from '@/components/structures/inline/InlineText'
import { CandidateTeam } from '@/composites/recruitment/candidate/CandidateTeam'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import type { RecordFile } from '@/core/hooks/data/work/useRecordFile'
import { formatDayTime } from '@/utils/format/dates'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import { RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import { MEMBER_FILE } from '@/declarations/ui/blocks'
import { CANDIDATE_RAIL } from '@/declarations/ui/variants'
import type { CandidateView } from '@/types/recruitment'

export interface CandidateRailProps {
  candidate: CandidateView
  record: RecordFile
  // Wheel glued under the rail
  footer: ReactNode
}

/**
 * Identity rail of a candidate
 * @param {CandidateView} candidate - Applicant followed
 * @param {RecordFile} record - Inline state of their fields
 * @param {ReactNode} footer - Wheel under the rail
 * @return {JSX.Element}
 */

export const CandidateRail = ({ candidate, record, footer }: CandidateRailProps) => {
  const { detail, can } = useRecruitmentState()
  const pinned = candidate.comments.filter((comment) => comment.pinned)

  return (
    <>
      <aside className={MEMBER_FILE.rail}>
        <div className={CANDIDATE_RAIL.head}>
          <Avatar
            name={candidate.name}
            src={candidate.avatarUrl}
            size="lg"
            className="md:h-24 md:w-24 md:text-2xl"
          />
          <InlineText
            id="candidate-display-name"
            value={candidate.name}
            disabled={!can.writeCandidates}
            maxLength={80}
            placeholder={RECRUITMENT_FIELD_COPY.displayName}
            className={CANDIDATE_RAIL.name}
            onCommit={(next) => record.saveField('displayName', next)}
          />
          {/* An observer never reads how to reach a candidate */}
          {!can.observing && (
            <span className="flex items-center gap-3">
              <CopyValue value={candidate.discordId} />
              {detail.bannedIds.includes(candidate.discordId) && (
                <Status label={HISTORY_COPY.banned} tone="danger" />
              )}
            </span>
          )}
        </div>
        <div className={MEMBER_FILE.body}>
          <CandidateTeam candidate={candidate} record={record} />
          {pinned.length > 0 && (
            <div className={MEMBER_FILE.pinned}>
              <span className={MEMBER_FILE.pinnedLabel}>{CANDIDATE_COPY.pinned}</span>
              {pinned.map((comment) => (
                <article key={comment.id} className={MEMBER_FILE.pinnedNote}>
                  <span className={MEMBER_FILE.noteHead}>
                    <Byline
                      name={comment.authorName}
                      avatar={comment.authorAvatar}
                      date={formatDayTime(comment.createdAt)}
                    />
                  </span>
                  <Markdown source={comment.body} mentions className={MEMBER_FILE.noteBody} />
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>
      {footer}
    </>
  )
}
