import crypto from 'crypto'

import { DISCORD_WEBHOOK } from '@/declarations/access/discord'

/**
 * Wrap a raw public key in the DER header an Ed25519 verifier expects
 * @param {string} publicKey - Hex encoded public key
 * @return {crypto.KeyObject} - Key object
 */

const toKeyObject = (publicKey: string): crypto.KeyObject =>
  crypto.createPublicKey({
    key: Buffer.concat([
      Buffer.from(DISCORD_WEBHOOK.derPrefix, 'hex'),
      Buffer.from(publicKey, 'hex'),
    ]),
    format: 'der',
    type: 'spki',
  })

/**
 * Check that a payload really comes from Discord and is not a replay
 * @param {Object} input - Received request
 * @param {string} input.body - Raw body, byte for byte
 * @param {string | null} input.signature - Ed25519 signature header
 * @param {string | null} input.timestamp - Timestamp header
 * @param {string | null} input.publicKey - Application public key
 * @return {boolean} - Payload is authentic and fresh
 */

export const isSignedByDiscord = ({
  body,
  signature,
  timestamp,
  publicKey,
}: {
  body: string
  signature: string | null
  timestamp: string | null
  publicKey: string | null
}): boolean => {
  if (!signature || !timestamp || !publicKey) return false

  // An old timestamp is a replay, whatever the signature says
  const sentAt = Number(timestamp)
  if (!Number.isFinite(sentAt)) return false
  if (Math.abs(Date.now() / 1000 - sentAt) > DISCORD_WEBHOOK.toleranceSeconds) return false

  try {
    return crypto.verify(
      null,
      Buffer.from(timestamp + body),
      toKeyObject(publicKey),
      Buffer.from(signature, 'hex')
    )
  } catch {
    return false
  }
}
