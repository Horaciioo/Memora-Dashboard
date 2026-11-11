import nexus from '@/configurations/system/nexus.json'
import { readInteger, readNode, readString } from '@/declarations/configurations/readers'

const window = readNode(nexus.window, 'system/nexus.window')

// Integer setting of the window
const size = (key: string, fallback: number, min: number, max: number): number =>
  readInteger(window[key], { path: `system/nexus.window.${key}`, fallback, min, max })

/**
 * Window geometry and terminal bounds
 * @type {Record<string, number | string>}
 */

export const NEXUS_WINDOW = {
  shortcut: readString(window.shortcut, {
    path: 'system/nexus.window.shortcut',
    fallback: 'Mod+Shift+M',
  }),
  defaultWidth: size('defaultWidth', 760, 320, 2000),
  defaultHeight: size('defaultHeight', 460, 200, 1400),
  minWidth: size('minWidth', 420, 280, 1000),
  minHeight: size('minHeight', 260, 160, 800),
  maxWidth: size('maxWidth', 1400, 600, 3000),
  maxHeight: size('maxHeight', 1000, 400, 2000),
  historySize: size('historySize', 200, 10, 1000),
  blocksKept: size('blocksKept', 100, 10, 1000),
  pollSeconds: size('pollSeconds', 60, 10, 600),
  edgeMargin: size('edgeMargin', 8, 0, 64),
} as const
