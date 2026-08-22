import 'server-only'

import crypto from 'crypto'

import type Sharding from '@/managers/infrastructure/Core/Sharding'
import type LoggerManager from '@/managers/infrastructure/Core/LoggerManager'
import type { EncryptionConfig, LegacyEncryptionKey } from '@/types/infrastructure'

// Packed into the first two bits of the vector, never written as a separate field
const FORMAT_VERSION = 0x02

// Block ciphers take a full block as their vector, authenticated modes take less
const BLOCK_IV_LENGTH = 16

/**
 * Derived legacy key
 * @typedef {Object} DerivedLegacyKey
 * @property {Buffer} key - Key
 * @property {Buffer} iv - Vector
 * @property {string} algorithm - Cipher
 * @property {Date} created - Date
 */

interface DerivedLegacyKey {
  key: Buffer
  iv: Buffer
  algorithm: string
  created: Date
}

/**
 * Encrypt options
 * @typedef {Object} EncryptOptions
 * @property {string} [algorithm] - Algorithm
 * @property {boolean} [stringify] - Stringify objects
 */

export interface EncryptOptions {
  algorithm?: string
  stringify?: boolean
}

/**
 * Decrypt options
 * @typedef {Object} DecryptOptions
 * @property {boolean} [parse] - Parse JSON
 * @property {boolean} [silent] - Suppress errors
 */

export interface DecryptOptions {
  parse?: boolean
  silent?: boolean
}

/**
 * Encryption manager
 * @typedef {Object} EncryptionManager
 * @property {Sharding} client - Client instance
 * @constructor
 */

export default class EncryptionManager {
  private readonly client: Sharding

  /**
   * Primary key
   * @type {?Buffer}
   * @private
   */

  private _key: Buffer | null = null

  /**
   * IV
   * @type {?Buffer}
   * @private
   */

  private _iv: Buffer | null = null

  /**
   * Legacy keys
   * @type {DerivedLegacyKey[]}
   * @private
   */

  private _legacyKeys: DerivedLegacyKey[] = []

  /**
   * Algorithm
   * @type {string}
   * @private
   */

  private _algorithm = 'aes-256-gcm'

  /**
   * Loaded state
   * @type {boolean}
   * @private
   */

  private _isLoaded = false

  /**
   * Key iterations
   * @type {number}
   * @private
   */

  private _keyIterations = 100000

  /**
   * Create EncryptionManager
   * @param {Sharding} client - Client instance
   */

  constructor(client: Sharding) {
    this.client = client
  }

  /**
   * Get encryption config
   * @return {EncryptionConfig} - Config
   */

  get config(): EncryptionConfig {
    return this.client.config.get('encryption')
  }

  /**
   * Get logger instance
   * @return {LoggerManager} - Logger
   */

  get logger(): LoggerManager {
    return this.client.logger
  }

  /**
   * Check initialized
   * @return {void}
   * @throws When not ready
   * @private
   */

  private _checkInitialization(): void {
    // Verify loaded and keys available
    if (!this._isLoaded || !this._key || !this._iv) {
      throw new Error('Encryption manager not initialized, call load() first')
    }
  }

  /**
   * Check authenticated
   * @param {string} algorithm - Algorithm
   * @return {boolean} - Authenticated
   * @private
   */

  private _isAuthenticated(algorithm: string): boolean {
    return algorithm.includes('gcm') || algorithm.includes('ccm')
  }

  /**
   * Get IV length
   * @param {string} algorithm - Algorithm
   * @return {number} - Bytes
   * @private
   */

  private _ivLength(algorithm: string): number {
    return this._isAuthenticated(algorithm) ? this.config.ivLength : BLOCK_IV_LENGTH
  }

  /**
   * Derive key
   * @param {string} password - Password
   * @param {string | Buffer} salt - Salt
   * @param {number} keyLength - Length
   * @param {number} [iterations] - Iterations
   * @return {Promise<Buffer>} - Key
   * @private
   */

  private async _deriveKey(
    password: string,
    salt: string | Buffer,
    keyLength: number,
    iterations: number = this._keyIterations
  ): Promise<Buffer> {
    // PBKDF2 with SHA-512
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, keyLength, 'sha512', (error, derivedKey) => {
        if (error) reject(error)
        else resolve(derivedKey)
      })
    })
  }

  /**
   * Generate IV
   * @param {number} length - Length
   * @return {Buffer} - IV
   * @private
   */

  private _generateIv(length: number): Buffer {
    // Random secure bytes
    const iv = crypto.randomBytes(length)

    // Embed version in first 2 bits
    iv[0] = ((iv[0] ?? 0) & 0xfc) | FORMAT_VERSION

    return iv
  }

  /**
   * Extract version
   * @param {Buffer} iv - IV
   * @return {number} - Version
   * @private
   */

  private _extractVersionFromIv(iv: Buffer): number {
    // Extract first 2 bits
    return (iv[0] ?? 0) & 0x03
  }

  /**
   * Encrypt value
   * @param {string | object} value - Value
   * @param {EncryptOptions} [options] - Options
   * @return {string} - Encrypted
   * @throws When failed
   */

  encrypt(value: string | object, options: EncryptOptions = {}): string {
    // Check initialized
    this._checkInitialization()

    try {
      // Prepare data
      const stringValue =
        options.stringify !== false && typeof value === 'object'
          ? JSON.stringify(value)
          : String(value)

      // Get algorithm
      const algorithm = options.algorithm || this._algorithm

      // Generate IV
      const operationIv = this._generateIv(this._ivLength(algorithm))

      // Create cipher
      const cipher = crypto.createCipheriv(algorithm, this._key as Buffer, operationIv)

      // Encrypt
      let encrypted = cipher.update(stringValue, 'utf8', 'base64')

      encrypted += cipher.final('base64')

      // Get auth tag
      const authTag = this._isAuthenticated(algorithm)
        ? (cipher as crypto.CipherGCM).getAuthTag().toString('base64')
        : ''

      // Return encrypted
      return [operationIv.toString('base64'), authTag, encrypted].join('.')
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)

      this.logger.error('Encryption failed', { reason })

      throw new Error(`Encryption failed: ${reason}`)
    }
  }

  /**
   * Decrypt value
   * @param {string} encrypted - Encrypted
   * @param {DecryptOptions} [options] - Options
   * @return {string | object | null} - Decrypted
   * @throws When failed
   */
  decrypt(encrypted: string, options: DecryptOptions = {}): string | object | null {
    // Check initialized
    this._checkInitialization()

    // Handle empty
    if (!encrypted) {
      if (options.silent) return null

      throw new Error('No encrypted data provided')
    }

    try {
      // Split parts
      const [ivBase64, authTagBase64, encryptedData] = encrypted.split('.')

      // Legacy format check
      if (ivBase64 && authTagBase64 && encryptedData === undefined) {
        return this._decryptLegacyV1Format(authTagBase64, ivBase64, options)
      }

      // Verify parts
      if (!ivBase64 || authTagBase64 === undefined || encryptedData === undefined) {
        throw new Error('Invalid encrypted data format')
      }

      // Convert IV
      const iv = Buffer.from(ivBase64, 'base64')

      // Verify version
      if (this._extractVersionFromIv(iv) !== FORMAT_VERSION) {
        throw new Error('Incompatible encryption version')
      }

      // Get algorithm
      const algorithm = authTagBase64 ? this._algorithm : 'aes-256-cbc'

      // Create decipher
      const decipher = crypto.createDecipheriv(algorithm, this._key as Buffer, iv)

      // Set auth tag
      if (authTagBase64 && this._isAuthenticated(algorithm)) {
        ;(decipher as crypto.DecipherGCM).setAuthTag(Buffer.from(authTagBase64, 'base64'))
      }

      // Decrypt
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8')

      decrypted += decipher.final('utf8')

      // Parse if requested
      if (options.parse) return JSON.parse(decrypted)

      // Return decrypted
      return decrypted
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)

      // Log error
      this.logger.error('Decryption failed', {
        reason,
        dataFormat: `${encrypted.split('.').length} parts`,
      })

      // Return null if silent
      if (options.silent) return null

      throw new Error(`Decryption failed: ${reason}`)
    }
  }

  /**
   * Decrypt legacy format
   * @param {string} encryptedData - Encrypted
   * @param {string} ivBase64 - IV
   * @param {DecryptOptions} options - Options
   * @return {string | object} - Decrypted
   * @private
   */

  private _decryptLegacyV1Format(
    encryptedData: string,
    ivBase64: string,
    options: DecryptOptions
  ): string | object {
    const iv = Buffer.from(ivBase64, 'base64')

    // Try key
    const attempt = (key: Buffer, algorithm: string): string => {
      const decipher = crypto.createDecipheriv(algorithm, key, iv)

      return decipher.update(encryptedData, 'base64', 'utf8') + decipher.final('utf8')
    }

    try {
      const decrypted = attempt(this._key as Buffer, 'aes-256-cbc')

      return options.parse ? JSON.parse(decrypted) : decrypted
    } catch (error) {
      // Try legacy keys
      for (const legacyKey of this._legacyKeys) {
        try {
          const decrypted = attempt(legacyKey.key, legacyKey.algorithm)

          this.logger.info('Decrypted with rotated key', {
            keyCreated: legacyKey.created.toISOString(),
          })

          return options.parse ? JSON.parse(decrypted) : decrypted
        } catch {
          // Continue
        }
      }

      // Re-throw
      throw error
    }
  }

  /**
   * Encrypt shared
   * @param {string | object} value - Value
   * @param {string} sharedKey - Key
   * @param {string} [algorithm] - Algorithm
   * @return {Promise<string>} - Encrypted
   */

  async encryptShared(
    value: string | object,
    sharedKey: string,
    algorithm = 'aes-256-gcm'
  ): Promise<string> {
    const config = this.config

    try {
      // Random salt
      const salt = crypto.randomBytes(config.shared.saltLength)

      // Derive key
      const keyBuffer = await this._deriveKey(
        sharedKey,
        salt,
        config.keyLength,
        config.shared.iterations
      )

      // Generate IV
      const iv = this._generateIv(this._ivLength(algorithm))

      // Convert to string
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)

      // Create cipher
      const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv)

      // Encrypt
      let encrypted = cipher.update(stringValue, 'utf8', 'base64')

      encrypted += cipher.final('base64')

      // Get auth tag
      const authTag = this._isAuthenticated(algorithm)
        ? (cipher as crypto.CipherGCM).getAuthTag().toString('base64')
        : ''

      return [algorithm, salt.toString('base64'), iv.toString('base64'), authTag, encrypted].join(
        '.'
      )
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)

      this.logger.error('Shared encryption failed', { reason })

      throw new Error(`Shared encryption failed: ${reason}`)
    }
  }

  /**
   * Decrypt shared
   * @param {string} encrypted - Encrypted
   * @param {string} sharedKey - Key
   * @param {DecryptOptions} [options] - Options
   * @return {Promise<string | object>} - Decrypted
   */

  async decryptShared(
    encrypted: string,
    sharedKey: string,
    options: DecryptOptions = {}
  ): Promise<string | object> {
    const config = this.config

    try {
      // Split parts
      const [algorithm, saltBase64, ivBase64, authTagBase64, encryptedData] = encrypted.split('.')

      // Verify format
      if (
        !algorithm ||
        !saltBase64 ||
        !ivBase64 ||
        authTagBase64 === undefined ||
        encryptedData === undefined
      ) {
        throw new Error('Invalid shared encrypted data format')
      }

      // Derive key
      const keyBuffer = await this._deriveKey(
        sharedKey,
        Buffer.from(saltBase64, 'base64'),
        config.keyLength,
        config.shared.iterations
      )

      // Create decipher
      const decipher = crypto.createDecipheriv(
        algorithm,
        keyBuffer,
        Buffer.from(ivBase64, 'base64')
      )

      // Set auth tag
      if (authTagBase64 && this._isAuthenticated(algorithm)) {
        ;(decipher as crypto.DecipherGCM).setAuthTag(Buffer.from(authTagBase64, 'base64'))
      }

      // Decrypt
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8')

      decrypted += decipher.final('utf8')

      // Parse if requested
      if (options.parse) return JSON.parse(decrypted)

      // Return decrypted
      return decrypted
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)

      this.logger.error('Shared decryption failed', { reason })

      throw new Error(`Shared decryption failed: ${reason}`)
    }
  }

  /**
   * Hash value
   * @param {string} value - Value
   * @param {string} [algorithm] - Algorithm
   * @return {string} - Hex
   */

  hash(value: string, algorithm = 'sha256'): string {
    return crypto.createHash(algorithm).update(value).digest('hex')
  }

  /**
   * Verify hash
   * @param {string} value - Value
   * @param {string} hash - Hash
   * @param {string} [algorithm] - Algorithm
   * @return {boolean} - Match
   */

  verifyHash(value: string, hash: string, algorithm = 'sha256'): boolean {
    // Calculate hash
    const calculated = Buffer.from(this.hash(value, algorithm), 'hex')
    const expected = Buffer.from(hash, 'hex')

    // Check length
    if (calculated.length !== expected.length) return false

    // Constant time
    return crypto.timingSafeEqual(calculated, expected)
  }

  /**
   * Generate random string
   * @param {number} [length] - Bytes
   * @param {BufferEncoding} [encoding] - Encoding
   * @return {Promise<string>} - String
   */

  async generateRandomString(length = 32, encoding: BufferEncoding = 'base64'): Promise<string> {
    // Random bytes
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (error, buffer) => {
        if (error) reject(error)
        else resolve(buffer.toString(encoding))
      })
    })
  }

  /**
   * Load encryption
   * @return {Promise<void>} - Completion
   */

  async load(): Promise<void> {
    const config = this.config

    if (!config.enabled) return

    try {
      // Set iterations
      this._keyIterations = config.iterations

      // Set algorithm
      this._algorithm = config.algorithm

      // Validate algorithm
      if (!crypto.getCiphers().includes(this._algorithm)) {
        this.logger.error(`Unsupported algorithm: ${this._algorithm}`)

        return
      }

      // Require key
      if (!config.key) {
        this.logger.error('Encryption key required')

        return
      }

      // Derive key
      this._key = await this._deriveKey(
        config.key,
        config.keySalt,
        config.keyLength,
        this._keyIterations
      )

      // Handle IV
      if (config.iv) {
        this._iv = await this._deriveKey(
          config.iv,
          config.ivSalt,
          this._ivLength(this._algorithm),
          10000
        )
      } else {
        // Random for authenticated modes
        this._iv = crypto.randomBytes(this._ivLength(this._algorithm))
      }

      // Load legacy keys
      await this._loadLegacyKeys(config.legacyKeys)

      // Mark loaded
      this._isLoaded = true

      this.logger.info(`Encryption ready with ${this._algorithm}`)
    } catch (error) {
      // Mark not loaded
      this._isLoaded = false

      this.logger.error('Encryption initialization failed', error)

      throw error
    }
  }

  /**
   * Load legacy keys
   * @param {LegacyEncryptionKey[]} legacyKeys - Keys
   * @return {Promise<void>} - Completion
   * @private
   */

  private async _loadLegacyKeys(legacyKeys: LegacyEncryptionKey[]): Promise<void> {
    // Initialize
    this._legacyKeys = []

    // Skip if empty
    if (legacyKeys.length === 0) return

    // Process each
    for (const legacyKey of legacyKeys) {
      try {
        // Derive key
        const keyBuffer = await this._deriveKey(
          legacyKey.key,
          legacyKey.salt,
          this.config.keyLength,
          legacyKey.iterations
        )

        const ivBuffer = await this._deriveKey(
          legacyKey.iv,
          legacyKey.ivSalt,
          this._ivLength(legacyKey.algorithm),
          5000
        )

        this._legacyKeys.push({
          key: keyBuffer,
          iv: ivBuffer,
          algorithm: legacyKey.algorithm,
          created: new Date(legacyKey.created),
        })
      } catch (error) {
        this.logger.warn('Legacy key unreadable', {
          reason: error instanceof Error ? error.message : error,
          created: legacyKey.created,
        })
      }
    }

    // Sort by date
    this._legacyKeys.sort((a, b) => b.created.getTime() - a.created.getTime())
  }

  /**
   * Re-encrypt with current
   * @param {string} encrypted - Data
   * @return {Promise<string>} - Re-encrypted
   */

  async reEncrypt(encrypted: string): Promise<string> {
    // Decrypt
    const decrypted = this.decrypt(encrypted)

    if (decrypted === null) throw new Error('Re-encryption failed, data unreadable')

    // Re-encrypt
    return this.encrypt(decrypted)
  }

  /**
   * Check if ready
   * @return {boolean} - Ready
   */

  isReady(): boolean {
    // Verify loaded and keys
    return this._isLoaded && !!this._key && !!this._iv
  }
}
