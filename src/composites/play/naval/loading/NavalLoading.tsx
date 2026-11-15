'use client'

import { NavalLoadScene } from '@/composites/play/naval/loading/NavalLoadScene'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { NAVAL_LOADING_TIPS } from '@/declarations/play/naval/loadingTips'

/**
 * Naval loading: its scene and its tips on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const NavalLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={NavalLoadScene} tips={NAVAL_LOADING_TIPS} />
)
