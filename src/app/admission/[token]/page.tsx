import type { Metadata } from 'next'
import { AdmissionForm } from '@/composites/academy/AdmissionForm'
import { admissionFields, resolveInvite } from '@/core/services/academy/AdmissionService'
import { ADMISSION_COPY } from '@/declarations/academy/copy'
import { AuthShell } from '@/layouts/AuthShell'

export const metadata: Metadata = { title: ADMISSION_COPY.title }

/**
 * Public admission form, reachable without a session
 * @param {Object} context - Route context
 * @param {Promise<{ token: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Admission page
 */

export default async function AdmissionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await resolveInvite(token).catch(() => null)

  return (
    <AuthShell title={ADMISSION_COPY.title} subtitle={ADMISSION_COPY.subtitle}>
      {invite ? (
        <AdmissionForm token={token} fields={await admissionFields(invite)} />
      ) : (
        <div className="flex flex-col gap-1">
          <p className="font-medium">{ADMISSION_COPY.invalidTitle}</p>
          <p className="text-sm text-[var(--color-ink-subtle)]">
            {ADMISSION_COPY.invalidDescription}
          </p>
        </div>
      )}
    </AuthShell>
  )
}
