import type { SanctionPanelView } from '@/types/sanctions'
import { SanctionGravities, SanctionKinds, SanctionPanels } from '@/utils/constants/moderation'

const timeout = {
  id: 'demo-timeout',
  name: 'Exclusion temporaire',
  kind: SanctionKinds.Timeout,
  durationMinutes: 10,
  permanent: false,
  accent: null,
  weight: 1,
}

const rung = { id: 'demo-rung', step: 0, condition: null, measures: [timeout] }

export const DEMO_PANEL: SanctionPanelView = {
  youtuberId: 'demo',
  panel: SanctionPanels.Twitch,
  levelId: null,
  offenses: [
    {
      id: 'demo-spam',
      name: 'Spam',
      gravity: SanctionGravities.Low,
      firstRung: rung,
      rungCount: 1,
      rungs: [rung],
      examples: ['Messages répétés'],
      tolerated: [],
      keywords: [],
    },
  ],
}
