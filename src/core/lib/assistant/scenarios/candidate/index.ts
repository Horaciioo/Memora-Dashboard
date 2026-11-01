import {
  askAttended,
  askInterview,
  askOutcome,
  askText,
  attendedAnswer,
  interviewAnswer,
  interviewTime,
  outcomeAnswer,
  seatsAnswer,
  seatsFind,
  seatsMenu,
  seatsPick,
  textAnswer,
} from '@/core/lib/assistant/scenarios/candidate/edit'
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
} from '@/core/lib/assistant/scenarios/candidate/find'
import type { Scenario } from '@/types/scenario'

/**
 * Everything Memora does to update a candidate
 * @type {Scenario}
 */

export const CANDIDATE_SCENARIO: Scenario = {
  entries: { offer: 'askWho', edit: 'askWho', onFile: 'fileOffer' },
  steps: {
    askWho,
    fileOffer,
    fileAnswer,
    fileProps,
    nextProp,
    whoAnswer,
    whoPick,
    menu,
    menuAnswer,
    askInterview,
    interviewAnswer,
    interviewTime,
    askAttended,
    attendedAnswer,
    askOutcome,
    outcomeAnswer,
    askText,
    textAnswer,
    seatsMenu,
    seatsAnswer,
    seatsFind,
    seatsPick,
  },
}
