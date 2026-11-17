'use client'

import { useState } from 'react'

import { Tabs } from '@/components/elements/navigation/Tabs'
import { PlayAdminLogs } from '@/composites/play/admin/PlayAdminLogs'
import { PlayAdminPlayers } from '@/composites/play/admin/PlayAdminPlayers'
import { PlayAdminStatsView } from '@/composites/play/admin/PlayAdminStatsView'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import type { PlayAdminBoard, PlayAdminLogStats, PlayAdminStats } from '@/types/play'

// Rubriques of the page
const TABS = [
  { value: 'players', label: COPY.tabPlayers, icon: 'members' as const },
  { value: 'logs', label: COPY.tabLogs, icon: 'history' as const },
  { value: 'stats', label: COPY.tabStats, icon: 'dashboard' as const },
] as const

type Tab = (typeof TABS)[number]['value']

export interface PlayAdminBoardProps {
  board: PlayAdminBoard
  logStats: PlayAdminLogStats
  stats: PlayAdminStats
  // Only the admin level reaches several players
  canBulk: boolean
}

/**
 * Play administration: players first, journal and figures beside
 * @param {PlayAdminBoardProps} props - Data and reach
 * @return {JSX.Element}
 */

export const PlayAdminBoardView = ({ board, logStats, stats, canBulk }: PlayAdminBoardProps) => {
  const [tab, setTab] = useState<Tab>('players')

  return (
    <div className={PLAY_ADMIN.page}>
      <Tabs
        isPlay
        centered
        label={COPY.tabsLabel}
        items={[...TABS]}
        value={tab}
        onChange={(value) => setTab(value as Tab)}
      />
      {tab === 'players' && <PlayAdminPlayers board={board} canBulk={canBulk} />}
      {tab === 'logs' && <PlayAdminLogs stats={logStats} players={board.players} />}
      {tab === 'stats' && <PlayAdminStatsView stats={stats} totals={board.totals} />}
    </div>
  )
}
