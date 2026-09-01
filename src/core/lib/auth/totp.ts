import crypto from 'crypto'

import { TWO_FACTOR_SETTINGS } from '@/declarations/configurations/settings'

// RFC 4648 alphabet, the one every authenticator app reads
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

// Bits packed into one base32 symbol
const BASE32_BITS = 5

// A counter travels as eight big-endian bytes
const COUNTER_BYTES = 8

/**
 * Encode base32
 * @param {Buffer} bytes - Raw bytes
 * @return {string} - Base32 payload
 */

const toBase32 = (bytes: Buffer): string => {
  let bits = 0
  let value = 0
  let output = ''

  // Drain five bits at a time, whatever the byte boundary
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8

    while (bits >= BASE32_BITS) {
      output += BASE32_ALPHABET[(value >>> (bits - BASE32_BITS)) & 0x1f]
      bits -= BASE32_BITS
    }
  }

  // Left-align whatever is left of the last byte
  if (bits > 0) output += BASE32_ALPHABET[(value << (BASE32_BITS - bits)) & 0x1f]

  return output
}

/**
 * Decode base32
 * @param {string} payload - Base32 payload
 * @return {Buffer} - Raw bytes
 */

const fromBase32 = (payload: string): Buffer => {
  const clean = payload.toUpperCase().replace(/[^A-Z2-7]/g, '')
  const bytes: number[] = []
  let bits = 0
  let value = 0

  // Refill a byte every eight accumulated bits
  for (const symbol of clean) {
    value = (value << BASE32_BITS) | BASE32_ALPHABET.indexOf(symbol)
    bits += BASE32_BITS

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(bytes)
}

/**
 * Draw a secret
 * @return {string} - Base32 secret
 */

export const createSecret = (): string =>
  toBase32(crypto.randomBytes(TWO_FACTOR_SETTINGS.secretBytes))

/**
 * Code of one step
 * @param {string} secret - Base32 secret
 * @param {number} step - Counter step
 * @return {string} - Zero-padded code
 */

const codeAt = (secret: string, step: number): string => {
  const counter = Buffer.alloc(COUNTER_BYTES)
  counter.writeBigUInt64BE(BigInt(step))

  const digest = crypto.createHmac('sha1', fromBase32(secret)).update(counter).digest()

  // Dynamic truncation, the low nibble of the last byte points at the window
  const offset = digest[digest.length - 1] & 0x0f
  const binary = digest.readUInt32BE(offset) & 0x7fffffff

  return String(binary % 10 ** TWO_FACTOR_SETTINGS.digits).padStart(TWO_FACTOR_SETTINGS.digits, '0')
}

/**
 * Counter step
 * @param {number} [at] - Instant in milliseconds
 * @return {number} - Counter step
 */

export const stepAt = (at: number = Date.now()): number =>
  Math.floor(at / 1000 / TWO_FACTOR_SETTINGS.periodSeconds)

/**
 * Verify a code
 * @param {string} secret - Base32 secret
 * @param {string} code - Submitted code
 * @param {number} [afterStep] - Last step already spent
 * @return {number | null} - Matching step, null when rejected
 */

export const verifyCode = (secret: string, code: string, afterStep?: number): number | null => {
  const submitted = code.replace(/\D/g, '')
  if (submitted.length !== TWO_FACTOR_SETTINGS.digits) return null

  const current = stepAt()
  const { driftSteps } = TWO_FACTOR_SETTINGS

  // Walk the drift window, a replayed step never matching twice
  for (let offset = -driftSteps; offset <= driftSteps; offset += 1) {
    const step = current + offset
    if (afterStep !== undefined && step <= afterStep) continue

    const expected = codeAt(secret, step)
    const matches = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(submitted))
    if (matches) return step
  }

  return null
}

/**
 * Enrolment URI
 * @param {Object} input - Enrolment context
 * @param {string} input.secret - Base32 secret
 * @param {string} input.account - Label of the member
 * @param {string} input.issuer - Label of the application
 * @return {string} - otpauth URI
 */

export const otpauthUri = ({
  secret,
  account,
  issuer,
}: {
  secret: string
  account: string
  issuer: string
}): string => {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const query = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(TWO_FACTOR_SETTINGS.digits),
    period: String(TWO_FACTOR_SETTINGS.periodSeconds),
  })

  return `otpauth://totp/${label}?${query.toString()}`
}

/**
 * Draw fallback codes
 * @return {string[]} - Clear codes
 */

export const createRecoveryCodes = (): string[] =>
  Array.from({ length: TWO_FACTOR_SETTINGS.recoveryCodeCount }, () =>
    crypto.randomBytes(TWO_FACTOR_SETTINGS.recoveryCodeBytes).toString('hex').toUpperCase()
  )

/**
 * Digest a fallback code
 * @param {string} code - Clear code
 * @return {string} - Digest
 */

export const digestRecoveryCode = (code: string): string =>
  crypto
    .createHash('sha256')
    .update(code.replace(/[^0-9A-Za-z]/g, '').toUpperCase())
    .digest('hex')
