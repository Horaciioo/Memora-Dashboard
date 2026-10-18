'use client'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/inline/AddRow'
import { Section } from '@/components/structures/page/Section'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ReviewCard } from '@/composites/academy/review/ReviewCard'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'

/**
 * Voice check-ins held with the junior
 * @return {JSX.Element}
 */

export const ReviewsTab = () => {
  const { file, can, reviewForm } = useJuniorState()

  return (
    <div {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiReviewAdd }}>
      <Section title={ACADEMY_COPY.tabReviews} description={ACADEMY_COPY.reviewsLead} bare>
        {!can.readReviews ? (
          <EmptyState
            figure="notes"
            title={ACADEMY_COPY.confidential}
            description={ACADEMY_COPY.reviewLocked}
            action={
              <Button icon="blocked" disabled>
                {ACADEMY_COPY.confidential}
              </Button>
            }
          />
        ) : file.reviews.length === 0 ? (
          <EmptyState
            figure="notes"
            title={ACADEMY_COPY.reviewEmptyTitle}
            description={ACADEMY_COPY.reviewEmptyDescription}
            action={
              <Button
                variant="primary"
                icon="add"
                disabled={!can.writeReviews}
                onClick={() => reviewForm()}
              >
                {ACADEMY_COPY.reviewAdd}
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {file.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            <AddRow
              label={ACADEMY_COPY.reviewAdd}
              disabled={!can.writeReviews}
              onClick={() => reviewForm()}
            />
          </div>
        )}
      </Section>
    </div>
  )
}
