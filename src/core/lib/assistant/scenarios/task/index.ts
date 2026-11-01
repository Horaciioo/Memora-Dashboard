import {
  askProp,
  multiAnswer,
  multiFind,
  multiMenu,
  multiPick,
  propDate,
  propFind,
  propPick,
  propText,
} from '@/core/lib/assistant/scenarios/task/edit'
import {
  askWho,
  fileAnswer,
  fileOffer,
  fileProps,
  menu,
  menuAnswer,
  nextProp,
  whoAnswer,
  whoPick,
} from '@/core/lib/assistant/scenarios/task/find'
import type { Scenario } from '@/types/scenario'

/**
 * Everything Memora does to update a task
 * @type {Scenario}
 */

export const TASK_SCENARIO: Scenario = {
  entries: { offer: 'askWho', edit: 'askWho', onFile: 'fileOffer' },
  steps: {
    askWho,
    whoAnswer,
    whoPick,
    menu,
    menuAnswer,
    fileOffer,
    fileAnswer,
    fileProps,
    nextProp,
    askProp,
    propText,
    propDate,
    propFind,
    propPick,
    multiMenu,
    multiAnswer,
    multiFind,
    multiPick,
  },
}
