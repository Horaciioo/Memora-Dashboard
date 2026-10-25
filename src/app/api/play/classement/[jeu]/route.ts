import { notFound } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readLeaderboards } from '@/core/services/play'
import { PLAY_ERRORS, PLAY_GAMES } from '@/declarations/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read the best players of a game by measure', tags: ['play'] },
  handler: async ({ params }) => {
    const game = PLAY_GAMES.keys.find((key) => PLAY_GAMES.get(key).slug === params.jeu)
    if (!game) throw notFound(PLAY_ERRORS.unknownGame)

    return readLeaderboards(game)
  },
})
