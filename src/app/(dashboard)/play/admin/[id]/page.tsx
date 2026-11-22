import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PlayAdminFile } from '@/composites/play/admin/PlayAdminFile'
import { readPlayAdmin, readPlayAdminPlayer } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
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
 * File of one player: rank card, figures, gestures and journal
 * @param {PlayAdminPlayerProps} props - Route context
 * @return {Promise<JSX.Element>} - File page
 */

export default async function PlayAdminPlayerPage({ params }: PlayAdminPlayerProps) {
  const { id } = await params
  await requirePermission(Permissions.PlayManage)
  const player = await readPlayAdminPlayer(id)
  if (!player) notFound()

  const state = await readPlayAdmin(id)

  return <PlayAdminFile player={player} state={state} />
}
