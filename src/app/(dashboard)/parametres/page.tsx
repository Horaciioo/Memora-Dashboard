import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PageHeader } from '@/components/structures/PageHeader'
import { PreferencesPanel } from '@/composites/preferences/PreferencesPanel'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { readSealState, sealFields, sealValues } from '@/core/services/auth/SealService'
import { readSessions } from '@/core/services/auth/SessionService'
import { profileFields, readProfile } from '@/core/services/preferences/ProfileService'
import { requireUser } from '@/core/wrappers/requireUser'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: PREFERENCES_COPY.title }

/**
 * Personal settings of the signed-in member
 * @return {Promise<JSX.Element>} - Settings page
 */

export default async function PreferencesPage() {
  const { session } = await requireUser()
  const cookieStore = await cookies()

  const [profile, sessions, seal] = await Promise.all([
    readProfile(session.id),
    readSessions(session.id, cookieStore.get(SESSION_COOKIE)?.value),
    readSealState(),
  ])

  // A member's own contact details are sealed just like anyone else's
  const sealed = { ...profile, values: sealValues(profile.values, seal.isUnsealed) }

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PREFERENCES_COPY.title} lead={PREFERENCES_COPY.lead} />
      <PreferencesPanel
        initialProfile={sealed}
        fields={sealFields(profileFields(), seal.isUnsealed)}
        sessions={sessions}
      />
    </div>
  )
}
