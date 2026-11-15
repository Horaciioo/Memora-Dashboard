'use client'

import { CroquisLoadScene } from '@/composites/play/croquis/loading/CroquisLoadScene'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { CROQUIS_LOADING_TIPS } from '@/declarations/play/croquis/loadingTips'

/**
 * Croquis loading: its scene and its tips on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const CroquisLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={CroquisLoadScene} tips={CROQUIS_LOADING_TIPS} />
)
