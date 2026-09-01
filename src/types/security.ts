/**
 * Second factor state
 * @typedef {Object} TwoFactorState
 * @property {boolean} isEnrolled - Factor confirmed
 * @property {string | null} confirmedAt - Instant it was confirmed
 * @property {number} recoveryCodesLeft - Fallback codes still unspent
 */

export interface TwoFactorState {
  isEnrolled: boolean
  confirmedAt: string | null
  recoveryCodesLeft: number
}

/**
 * Enrolment payload
 * @typedef {Object} TwoFactorEnrolment
 * @property {string} secret - Base32 secret
 * @property {string} uri - otpauth URI
 * @property {string} qrCode - Scannable QR code, inline SVG
 * @property {string[]} recoveryCodes - Clear fallback codes
 */

export interface TwoFactorEnrolment {
  secret: string
  uri: string
  qrCode: string
  recoveryCodes: string[]
}

/**
 * Unlock window state
 * @typedef {Object} SealState
 * @property {boolean} isUnsealed - Window still open
 * @property {string | null} closesAt - Instant it closes
 */

export interface SealState {
  isUnsealed: boolean
  closesAt: string | null
}
