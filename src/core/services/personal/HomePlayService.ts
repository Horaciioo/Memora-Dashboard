import 'server-only'

import { listLobbies, listPlayHistory, readLeaderboards } from '@/core/services/play'
import { HOME_PLAY_ROWS } from '@/declarations/personal/play'
import type { PlayHistoryEntry, PlayLeader, PlayLobbyCard } from '@/types/play'

/**
 * What the home shows about Play
 * @typedef {Object} HomePlay
 * @property {PlayLobbyCard[]} tables - Games being played or waiting, running first
 * @property {PlayHistoryEntry[]} recent - Latest games of the reader
 * @property {PlayLeader[]} leaders - Top of the level ranking
 */

export interface HomePlay {
  tables: PlayLobbyCard[]
  recent: PlayHistoryEntry[]
  leaders: PlayLeader[]
}

/**
 * Latest happenings on Play for the home
 * @param {string} accountId - Reader
 * @return {Promise<HomePlay>} - Tables, games and leaders
 */

export const readHomePlay = async (accountId: string): Promise<HomePlay> => {
  const [lobbies, history, boards] = await Promise.all([
    listLobbies(accountId),
    listPlayHistory(accountId, { size: HOME_PLAY_ROWS.recent }),
    readLeaderboards(null),
  ])

  return {
    tables: [...lobbies.running, ...lobbies.lobbies]
      .filter((table) => !table.isOverseen)
      .slice(0, HOME_PLAY_ROWS.tables),
    recent: history.entries,
    leaders: boards.level.slice(0, HOME_PLAY_ROWS.leaders),
  }
}
