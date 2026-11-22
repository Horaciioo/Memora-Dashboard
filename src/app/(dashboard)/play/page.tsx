import type { Metadata } from 'next'

import { PlayCallouts } from '@/composites/play/hub/notices/PlayCallouts'
import { PlayLauncher } from '@/composites/play/hub/launcher/PlayLauncher'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { listLobbies, readCatalog, readPlayConfig, readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_CONFIG_COPY } from '@/declarations/play/config'
import { PLAY_LAUNCH } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.pageTitle }

/**
 * Games page: featured banner, then the library
 * @return {Promise<JSX.Element>} - Play page
 */

export default async function PlayPage() {
  const { session, access } = await requirePermission(Permissions.PlayAccess)
  const [profile, tables, { games }, config] = await Promise.all([
    readPlayProfile(session.id),
    listLobbies(session.id, null, access.can(Permissions.PlayManage)),
    readCatalog(access.isSystem),
    readPlayConfig(),
  ])

  return (
    <>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayCallouts isBanned={Boolean(profile.ban)} />
      {config.announcementOn && config.announcement && (
        <p className={PLAY_LAUNCH.announce}>{config.announcement}</p>
      )}
      {config.tablesPaused && <p className={PLAY_LAUNCH.announce}>{PLAY_CONFIG_COPY.paused}</p>}

      <PlayLauncher
        games={games}
        config={config}
        tables={[...tables.running, ...tables.lobbies]}
        isBanned={Boolean(profile.ban)}
      />
    </>
  )
}
