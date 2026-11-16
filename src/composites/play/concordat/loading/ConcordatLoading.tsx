'use client'

import { ConcordatLoadScene } from '@/composites/play/concordat/loading/ConcordatLoadScene'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { CONCORDAT_LOADING_TIPS } from '@/declarations/play/concordat/hudCopy'

/**
 * Concordat loading: a coast that draws itself on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const ConcordatLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={ConcordatLoadScene} tips={CONCORDAT_LOADING_TIPS} />
)
