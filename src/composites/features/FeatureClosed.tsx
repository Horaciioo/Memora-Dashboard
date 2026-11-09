'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import Link from '@/components/elements/navigation/AppLink'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FeatureModes } from '@/declarations/features'
import { FEATURE_COPY } from '@/declarations/features/copy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { useFeatures } from '@/managers/front-end/FeaturesManager'
import type { ClosedFeatures } from '@/types/features'

export interface FeatureClosedProps {
  featureKey: string
  verdict: ClosedFeatures[string]
}

/**
 * Screen standing in for a page whose feature is switched off
 * @param {string} featureKey - Closed feature
 * @param {ClosedFeatures[string]} verdict - Position and message
 * @return {JSX.Element}
 */

export const FeatureClosed = ({ featureKey, verdict }: FeatureClosedProps) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  const { canSwitch } = useFeatures()
  const isAdminsOnly = verdict.mode === FeatureModes.Admins

  // Only the root administrator sees the switch
  const enable = () =>
    run(
      () => apiPatch(API_ROUTES.features, { keys: [featureKey], mode: FeatureModes.On }),
      FEATURE_COPY.saved
    ).then(() => router.refresh())

  return (
    <div className={PAGE_STYLES.wrapper}>
      <EmptyState
        variant="filter"
        title={isAdminsOnly ? FEATURE_COPY.closedAdminsTitle : FEATURE_COPY.closedTitle}
        description={verdict.note ?? FEATURE_COPY.closedLead}
        action={
          <div className="flex items-center justify-center gap-2">
            <Link href={ROUTES.dashboard}>
              <Button variant="secondary">{FEATURE_COPY.closedHome}</Button>
            </Link>
            {canSwitch && (
              <Button variant="primary" isLoading={isSaving} onClick={enable}>
                {FEATURE_COPY.closedEnable}
              </Button>
            )}
          </div>
        }
      />
    </div>
  )
}
