'use client'

import { Section } from '@/components/structures/page/Section'
import { PromotionTimeline } from '@/composites/academy/timeline/PromotionTimeline'
import { ACADEMY_COPY } from '@/declarations/academy/copy'

/**
 * General timeline of the promotion
 * @return {JSX.Element}
 */

export const TimelineTab = () => (
  <Section title={ACADEMY_COPY.tabTimeline} bare>
    <PromotionTimeline />
  </Section>
)
