import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PlayAdminFile } from '@/composites/play/admin/PlayAdminFile'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { readPlayActivity, readPlayAdmin, readPlayAdminPlayer } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

interface PlayAdminPlayerProps {
  params: Promise<{ id: string }>
}

/**
 * Name the browser tab after the player
 * @param {PlayAdminPlayerProps} props - Route context
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({ params }: PlayAdminPlayerProps): Promise<Metadata> {
  const { id } = await params
  const player = await readPlayAdminPlayer(id)

  return { title: player?.name ?? PLAY_BOARD_ADMIN_COPY.title }
}

/**
 * File of one player: progression, access and journal
 * @param {PlayAdminPlayerProps} props - Route context
 * @return {Promise<JSX.Element>} - File page
 */

export default async function PlayAdminPlayerPage({ params }: PlayAdminPlayerProps) {
  const { id } = await params
  await requirePermission(Permissions.PlayManage)
  const player = await readPlayAdminPlayer(id)
  if (!player) notFound()

  const [state, journal] = await Promise.all([readPlayAdmin(id), readPlayActivity(id)])

  return (
    <div className={PLAY_ADMIN.page}>
      <PlayPageTitle>{player.name}</PlayPageTitle>
      <PlayAdminFile player={player} state={state} journal={journal} />
    </div>
  )
}
