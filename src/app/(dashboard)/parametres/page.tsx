import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PageHeader } from '@/components/structures/PageHeader'
import { PreferencesPanel } from '@/composites/preferences/PreferencesPanel'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import {
  listOpenSessions,
  profileFields,
  readProfile,
} from '@/core/services/preferences/ProfileService'
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

  const [profile, sessions] = await Promise.all([
    readProfile(session.id),
    listOpenSessions(session.id, cookieStore.get(SESSION_COOKIE)?.value),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PREFERENCES_COPY.title} lead={PREFERENCES_COPY.lead} />
      <PreferencesPanel
        initialProfile={profile}
        fields={profileFields()}
        sessions={sessions}
        avatarUrl={session.avatarUrl}
      />
    </div>
  )
}
