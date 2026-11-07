import { createLinkStartRoute } from '@/core/lib/platforms/linkRoutes'
import { LivePlatforms } from '@/utils/constants/lives'

export const GET = createLinkStartRoute(LivePlatforms.Twitch)
