import { GOLF_SCENE_COURSE } from '@/declarations/play/golf/scene/course'
import { GOLF_SCENE_OBSTACLES } from '@/declarations/play/golf/scene/obstacles'
import { GOLF_SCENE_BALL } from '@/declarations/play/golf/scene/ball'
import { GOLF_SCENE_POWERS } from '@/declarations/play/golf/scene/powers'
import { GOLF_SCENE_CAMERA } from '@/declarations/play/golf/scene/camera'
import { GOLF_SCENE_DECOR } from '@/declarations/play/golf/scene/decor'
import { GOLF_SCENE_GROUND } from '@/declarations/play/golf/scene/ground'

/**
 * Look of the 3D course, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE = {
  ...GOLF_SCENE_COURSE,
  ...GOLF_SCENE_OBSTACLES,
  ...GOLF_SCENE_BALL,
  ...GOLF_SCENE_POWERS,
  ...GOLF_SCENE_CAMERA,
  ...GOLF_SCENE_DECOR,
  ...GOLF_SCENE_GROUND,
} as const

// Rows the round table always shows, empty ones included
export const GOLF_PANEL_ROWS = 5
