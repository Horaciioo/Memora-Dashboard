import type { IconName } from '@/declarations/ui/icons'
import { GOLF_SETUP_COPY } from '@/declarations/play/golf/copy'

/**
 * Tabs of the new golf game drawer, in order
 * @type {{ value: string, label: string, icon: IconName }[]}
 */

export const GOLF_SETUP_TABS = [
  { value: 'game', label: GOLF_SETUP_COPY.tabGame, icon: 'playRounds' },
  { value: 'powers', label: GOLF_SETUP_COPY.tabPowers, icon: 'golfBumper' },
  { value: 'rules', label: GOLF_SETUP_COPY.tabRules, icon: 'playRules' },
] as const satisfies readonly { value: string; label: string; icon: IconName }[]
