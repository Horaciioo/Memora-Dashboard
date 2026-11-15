import type { ReactElement } from 'react'

import { CroquisLoading } from '@/composites/play/croquis/loading/CroquisLoading'
import { EchoLoading } from '@/composites/play/echo/loading/EchoLoading'
import { GlitchLoading } from '@/composites/play/glitch/loading/GlitchLoading'
import { GolfLoading } from '@/composites/play/golf/loading/GolfLoading'
import { JumbleLoading } from '@/composites/play/jumble/loading/JumbleLoading'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { LudoLoading } from '@/composites/play/ludo/loading/LudoLoading'
import { NavalLoading } from '@/composites/play/naval/loading/NavalLoading'
import { StopGoLoading } from '@/composites/play/stopgo/loading/StopGoLoading'
import { SuspensLoading } from '@/composites/play/suspens/loading/SuspensLoading'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

// Loading of each game, living in its own folder; the others wear the shared frame
export const PLAY_LOADINGS: Partial<
  Record<PlayGameName, (props: PlayLoadingProps) => ReactElement>
> = {
  [PlayGames.Echo]: (props) => <EchoLoading {...props} />,
  [PlayGames.Golf]: (props) => <GolfLoading {...props} />,
  [PlayGames.Naval]: (props) => <NavalLoading {...props} />,
  [PlayGames.Jumble]: (props) => <JumbleLoading {...props} />,
  [PlayGames.Ludo]: (props) => <LudoLoading {...props} />,
  [PlayGames.Glitch]: (props) => <GlitchLoading {...props} />,
  [PlayGames.Croquis]: (props) => <CroquisLoading {...props} />,
  [PlayGames.Suspens]: (props) => <SuspensLoading {...props} />,
  [PlayGames.StopGo]: (props) => <StopGoLoading {...props} />,
}
