'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import { playedCourse } from '@/core/lib/play/golf'
import type { GolfGameSettings } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_RULES_COPY, GOLF_SETUP_COPY } from '@/declarations/play/golf/copy'
import { GOLF_COURSES, GOLF_RANDOM_COURSE } from '@/declarations/play/golf/courses'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'

export interface GolfRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: GolfGameSettings
}

/**
 * Rules chosen for a golf game, read only
 * @param {GolfRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const GolfRulesDrawer = ({ open, onClose, settings }: GolfRulesDrawerProps) => {
  const rows = [
    { label: GOLF_RULES_COPY.victory, value: GOLF_RULES_COPY.victoryValue },
    {
      label: GOLF_RULES_COPY.course,
      value:
        settings.course === GOLF_RANDOM_COURSE
          ? settings.drawn
            ? fillPlayMessage(GOLF_RULES_COPY.drawn, {
                random: GOLF_SETUP_COPY.random,
                course: GOLF_COURSES.label(playedCourse(settings)),
              })
            : GOLF_SETUP_COPY.random
          : GOLF_COURSES.label(settings.course),
    },
    {
      label: GOLF_RULES_COPY.holes,
      value: fillPlayMessage(GOLF_SETUP_COPY.holesCount, { count: settings.holes }),
    },
    {
      label: GOLF_RULES_COPY.holeSeconds,
      value: fillPlayMessage(GOLF_SETUP_COPY.seconds, { seconds: settings.holeSeconds }),
    },
    {
      label: GOLF_RULES_COPY.maxStrokes,
      value: fillPlayMessage(GOLF_SETUP_COPY.strokes, { count: settings.maxStrokes }),
    },
    {
      label: GOLF_RULES_COPY.collisions,
      value: settings.collisions ? GOLF_SETUP_COPY.on : GOLF_SETUP_COPY.off,
    },
    {
      label: GOLF_RULES_COPY.powers,
      value: settings.powers.length
        ? settings.powers.map((power) => GOLF_POWERS.label(power)).join(', ')
        : GOLF_RULES_COPY.noPowers,
    },
  ]

  return <PlayRulesDrawer open={open} onClose={onClose} title={GOLF_RULES_COPY.title} rows={rows} />
}
