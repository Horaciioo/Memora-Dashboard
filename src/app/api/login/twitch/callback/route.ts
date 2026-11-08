import { createLinkReturnRoute } from '@/core/lib/platforms/linkRoutes'
import { LivePlatforms } from '@/utils/constants/lives'

export const GET = createLinkReturnRoute(LivePlatforms.Twitch)
