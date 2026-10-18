import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { PreferencesPanel } from '@/composites/preferences/PreferencesPanel'
import { readSealState, sealFields, sealValues } from '@/core/services/auth/SealService'
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

  const [profile, seal] = await Promise.all([readProfile(session.id), readSealState()])

  // A member's own contact details are sealed just like anyone else's
  const sealed = { ...profile, values: sealValues(profile.values, seal.isUnsealed) }

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PREFERENCES_COPY.title} image={profile.bannerUrl} />
      <PreferencesPanel
        initialProfile={sealed}
        fields={sealFields(profileFields(), seal.isUnsealed)}
      />
    </div>
  )
}
