import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { PreferencesPanel } from '@/composites/preferences/PreferencesPanel'
import { readSealState, sealFields, sealValues } from '@/core/services/auth/SealService'
import { profileFields, readProfile } from '@/core/services/preferences/ProfileService'
import { listPlatformLinks } from '@/core/services/platforms/PlatformAccountService'
import { readPlayProfile } from '@/core/services/play'
import { requireUser } from '@/core/wrappers/requireUser'
import { reachableViews } from '@/core/services/auth/ViewService'
import { readPushSettings } from '@/core/services/push'
import { dockCandidatesOf } from '@/core/lib/pwa/dock'
import { visibleNavGroups } from '@/declarations/navigation'
import { isPushConfigured, VAPID_KEYS } from '@/declarations/pwa/vapid'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'
import { heldRoutes } from '@/declarations/ui/responsive'
import { LINK_PARAMS, LINK_RESULT } from '@/declarations/platforms/link'
import { isTwitchConfigured } from '@/declarations/platforms/twitch'
import { isYoutubeConfigured } from '@/declarations/platforms/youtube'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export interface PreferencesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Link the member just came back from
 * @param {Record<string, string | string[] | undefined>} query - Page query
 * @return {{ platform: LivePlatformName, result: string } | null} - Outcome or nothing
 */

const returnedLink = (
  query: Record<string, string | string[] | undefined>
): { platform: LivePlatformName; result: string } | null => {
  const platform = Object.values(LivePlatforms).find(
    (value) => value.toLowerCase() === query[LINK_PARAMS.platform]
  )
  const result = Object.values(LINK_RESULT).find((value) => value === query[LINK_PARAMS.result])

  return platform && result ? { platform, result } : null
}

export const metadata: Metadata = { title: PREFERENCES_COPY.title }

/**
 * Personal settings of the signed-in member
 * @param {PreferencesPageProps} props - Query of the link a platform sent back
 * @return {Promise<JSX.Element>} - Settings page
 */

export default async function PreferencesPage({ searchParams }: PreferencesPageProps) {
  const { session, access } = await requireUser()
  const query = await searchParams

  const [profile, seal, links, play, push] = await Promise.all([
    readProfile(session.id),
    readSealState(),
    listPlatformLinks(session.id),
    access.can(Permissions.PlayAccess) ? readPlayProfile(session.id) : null,
    readPushSettings(session.id),
  ])

  // Every page the member opens in any view they reach
  const reached = reachableViews(session).flatMap((view) =>
    visibleNavGroups(view, session, access.can)
  )
  const candidates = dockCandidatesOf(reached, heldRoutes(APP_ENVIRONMENT).phone)

  // A member's own contact details are sealed just like anyone else's
  const sealed = { ...profile, values: sealValues(profile.values, seal.isUnsealed) }

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PREFERENCES_COPY.title} image={profile.bannerUrl} />
      <PreferencesPanel
        initialProfile={sealed}
        fields={sealFields(profileFields(), seal.isUnsealed)}
        links={links}
        available={{
          [LivePlatforms.Twitch]: isTwitchConfigured(),
          [LivePlatforms.YouTube]: isYoutubeConfigured(),
        }}
        returned={returnedLink(query)}
        play={play}
        push={{ publicKey: isPushConfigured() ? VAPID_KEYS.publicKey : null, settings: push }}
        dock={{ candidates, saved: session.mobileDock }}
      />
    </div>
  )
}
