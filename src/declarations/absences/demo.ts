/**
 * What Memora does on her own to show how an absence is declared
 * @typedef {Object} AbsenceAutopilot
 * @property {string} reason - Reason typed letter by letter
 * @property {number} startInDays - Days from today to the first day
 * @property {number} extraDays - Days beyond the shortest absence that has to be declared
 * @property {number} pauseMs - Rest between two gestures
 * @property {number} typingMsPerChar - Time per typed letter
 */

export interface AbsenceAutopilot {
  reason: string
  startInDays: number
  extraDays: number
  pauseMs: number
  typingMsPerChar: number
}

/**
 * The example played during the first visit, nothing of it is saved
 * @type {AbsenceAutopilot}
 */

export const ABSENCE_DEMO_SCRIPT: AbsenceAutopilot = {
  reason: 'Je pars en vacances au Portugal, connexion presque impossible.',
  startInDays: 3,
  extraDays: 5,
  pauseMs: 1100,
  typingMsPerChar: 45,
}
