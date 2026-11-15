'use client'

import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { SuspensLoadScene } from '@/composites/play/suspens/loading/SuspensLoadScene'
import { SUSPENS_LOADING_TIPS } from '@/declarations/play/suspens/loadingTips'

/**
 * Suspens loading: its scene and its tips on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const SuspensLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={SuspensLoadScene} tips={SUSPENS_LOADING_TIPS} />
)
