import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { AbsencesPanel } from '@/composites/absences/AbsencesPanel'
import { ABSENCE_FIELDS, listOwnAbsences } from '@/core/services/absences/AbsenceService'
import { requireUser } from '@/core/wrappers/requireUser'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ABSENCE_SETTINGS } from '@/declarations/configurations/settings'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: ABSENCE_COPY.title }

/**
 * Absence requests
 * @return {Promise<JSX.Element>} - Absence page
 */

export default async function AbsencesPage() {
  const { session, access } = await requireUser()
  const mine = await listOwnAbsences(session.id)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ABSENCE_COPY.title} />
      <AbsencesPanel
        mine={mine}
        fields={ABSENCE_FIELDS}
        thresholdDays={ABSENCE_SETTINGS.thresholdDays}
        canCreate={access.can(Permissions.AbsenceCreate)}
      />
    </div>
  )
}
