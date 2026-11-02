import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { Skeleton } from '@/components/elements/feedback/Skeleton'
import { ShowcaseBanner } from '@/composites/changelog/showcase/ShowcaseBanner'
import { ShowcaseChat } from '@/composites/changelog/showcase/ShowcaseChat'
import {
  SHOWCASE_COPY,
  SHOWCASE_SKELETONS,
  SHOWCASE_STEPS,
} from '@/declarations/changelog/showcase'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ASSISTANT_OFFERS } from '@/declarations/assistant/offers'
import { ROUTES } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcaseAbsencesProps {
  step: number
}

/**
 * The Absences page: banner, list, Memora button, chat, then the new row
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcaseAbsences = ({ step }: ShowcaseAbsencesProps) => {
  const AbsenceIcon = ICONS.absences
  const hasRow = step >= SHOWCASE_STEPS.row
  const isChatOpen = step >= SHOWCASE_STEPS.open && !hasRow

  return (
    <>
      <ShowcaseBanner
        route={ROUTES.absences}
        title={ABSENCE_COPY.title}
        crumbs={[NAV_COPY.home, ABSENCE_COPY.title]}
      />
      <div className={SHOWCASE.content}>
        <p className={SHOWCASE.pageLead}>{ABSENCE_COPY.lead}</p>
        <p className={SHOWCASE.sectionTitle}>{ABSENCE_COPY.listTitle}</p>
        <div className={SHOWCASE.list}>
          <div data-showcase="row" className={SHOWCASE.slot}>
            <Skeleton shape="row" className={cn(SHOWCASE.rowBone, hasRow && 'opacity-0')} />
            <div
              className={cn(
                SHOWCASE.row,
                SHOWCASE.reveal,
                hasRow ? SHOWCASE.shown : SHOWCASE.hidden,
                hasRow && SHOWCASE.rowGlow
              )}
            >
              <AbsenceIcon className={SHOWCASE.rowGlyph} aria-hidden="true" />
              <span className={SHOWCASE.rowDates}>{SHOWCASE_COPY.period}</span>
              <span className={SHOWCASE.rowMeta}>{SHOWCASE_COPY.duration}</span>
              <span className={SHOWCASE.rowTag}>{ABSENCE_COPY.statusPending}</span>
            </div>
          </div>
          {Array.from({ length: SHOWCASE_SKELETONS.rows }, (_, index) => (
            <Skeleton key={index} shape="row" className={SHOWCASE.rowBone} />
          ))}
        </div>
      </div>

      {step >= SHOWCASE_STEPS.offer && step < SHOWCASE_STEPS.open && (
        <p className={SHOWCASE.fabBubble}>{ASSISTANT_OFFERS.absence.ask}</p>
      )}
      {isChatOpen && <ShowcaseChat step={step} />}
      <span data-showcase="fab" className={SHOWCASE.fab} aria-hidden="true">
        <BrainMark className={SHOWCASE.fabMark} motion="idle" />
      </span>
    </>
  )
}
