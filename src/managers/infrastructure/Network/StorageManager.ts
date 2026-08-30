import 'server-only'

import crypto from 'crypto'

import { prisma } from '@/core/lib/db'
import { sniffMimeType } from '@/declarations/system/signatures'
import { STORAGE_BUCKETS } from '@/declarations/system/storage'
import type Sharding from '@/managers/infrastructure/Core/Sharding'
import type LoggerManager from '@/managers/infrastructure/Core/LoggerManager'
import type { StorageConfig, StorageDriver } from '@/types/infrastructure'
import type { StorageInfo, StorageLocation, StorageObject, StorageWrite } from '@/types/storage'

/**
 * Cache entry
 * @typedef {Object} CacheEntry
 * @property {StorageInfo} data - Metadata
 * @property {number} timestamp - Epoch ms
 */

interface CacheEntry {
  data: StorageInfo
  timestamp: number
}

/**
 * Storage manager
 * @typedef {Object} StorageManager
 * @property {Sharding} client - Client instance
 * @constructor
 */

export default class StorageManager {
  private readonly client: Sharding

  /**
   * Metadata cache
   * @type {Map<string, CacheEntry>}
   * @private
   */

  private readonly _cache = new Map<string, CacheEntry>()

  /**
   * Upload queue
   * @type {(() => Promise<void>)[]}
   * @private
   */

  private readonly _uploadQueue: (() => Promise<void>)[] = []

  /**
   * Active uploads
   * @type {number}
   * @private
   */

  private _activeUploads = 0

  /**
   * Create StorageManager
   * @param {Sharding} client - Client instance
   */

  constructor(client: Sharding) {
    this.client = client

    // Bind for context
    this._processUploadQueue = this._processUploadQueue.bind(this)
    this._handleUploadRetry = this._handleUploadRetry.bind(this)
  }

  /**
   * Get storage config
   * @return {StorageConfig} - Config
   */

  get config(): StorageConfig {
    return this.client.config.get('storage')
  }

  /**
   * Get logger instance
   * @return {LoggerManager} - Logger
   */

  get logger(): LoggerManager {
    return this.client.logger
  }

  /**
   * Get active driver
   * @return {StorageDriver} - Driver
   */

  get driver(): StorageDriver {
    return this.config.driver
  }

  /**
   * Get max file size
   * @return {number} - Bytes
   */

  get maxBytes(): number {
    return this.config.maxBytes
  }

  /**
   * Calculate file size MB
   * @param {Uint8Array<ArrayBufferLike>} data - Bytes
   * @return {number} - Megabytes
   */

  calculateSizeInMB(data: Uint8Array<ArrayBufferLike>): number {
    return data.byteLength / (1024 * 1024)
  }

  /**
   * Get file MIME type
   * @param {Uint8Array<ArrayBufferLike>} data - Bytes
   * @return {string} - Type
   */

  getContentType(data: Uint8Array<ArrayBufferLike>): string {
    return sniffMimeType(data)
  }

  /**
   * Load storage
   * @return {Promise<void>} - Completion
   */

  async load(): Promise<void> {
    const config = this.config

    if (!config.enabled) return

    // Remote driver requires SDK
    if (config.driver === 'remote') {
      this.logger.error(
        'Remote driver requested but unavailable, install @aws-sdk/client-s3 and implement driver, storage uses database'
      )

      return
    }

    this.logger.info(`Storage ready on ${config.driver} driver`)
  }

  /**
   * Put object
   * @param {StorageLocation} location - Location
   * @param {StorageWrite} write - Write
   * @return {Promise<StorageInfo>} - Metadata
   */

  async put(location: StorageLocation, write: StorageWrite): Promise<StorageInfo> {
    const mimeType = write.mimeType || this.getContentType(write.data)

    this._validate(write, mimeType)

    return new Promise<StorageInfo>((resolve, reject) => {
      // Queue write
      this._uploadQueue.push(async () => {
        try {
          const info = await this._handleUploadRetry(() => this._write(location, write, mimeType))

          this._cache.set(this._cacheKey(location), { data: info, timestamp: Date.now() })

          resolve(info)
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)))
        }
      })

      void this._processUploadQueue()
    })
  }

  /**
   * Read object
   * @param {StorageLocation} location - Location
   * @return {Promise<StorageObject | null>} - Object
   */

  async read(location: StorageLocation): Promise<StorageObject | null> {
    const row = await prisma.storageEntry.findUnique({
      where: { bucket_key: { bucket: location.bucket, key: location.key } },
      select: { data: true, mimeType: true, updatedAt: true },
    })

    return row ? { data: row.data, mimeType: row.mimeType, updatedAt: row.updatedAt } : null
  }

  /**
   * Get object info
   * @param {StorageLocation} location - Location
   * @return {Promise<StorageInfo | null>} - Metadata
   */

  async info(location: StorageLocation): Promise<StorageInfo | null> {
    const key = this._cacheKey(location)

    // Check cache
    const cached = this._cache.get(key)

    if (cached && Date.now() - cached.timestamp < this.config.cache.ttlMs) return cached.data

    const info = await this._info(location)

    if (info) this._cache.set(key, { data: info, timestamp: Date.now() })

    return info
  }

  /**
   * Remove object
   * @param {StorageLocation} location - Location
   * @return {Promise<void>} - Completion
   */

  async remove(location: StorageLocation): Promise<void> {
    await prisma.storageEntry.deleteMany({
      where: { bucket: location.bucket, key: location.key },
    })

    this._cache.delete(this._cacheKey(location))
  }

  /**
   * Remove multiple
   * @param {StorageLocation[]} locations - Locations
   * @return {Promise<void>} - Completion
   */

  async removeAll(locations: StorageLocation[]): Promise<void> {
    await Promise.all(locations.map((location) => this.remove(location)))
  }

  /**
   * Clear cache
   * @return {void}
   */

  clearCache(): void {
    this._cache.clear()
  }

  /**
   * Validate write
   * @param {StorageWrite} write - Write
   * @param {string} mimeType - Type
   * @return {void}
   * @throws When refused
   * @private
   */

  private _validate(write: StorageWrite, mimeType: string): void {
    const config = this.config
    const ceiling = Math.min(config.maxBytes, write.maxBytes ?? config.maxBytes)

    if (write.data.byteLength === 0) throw new Error('Empty file')

    if (write.data.byteLength > ceiling) {
      throw new Error(`File too large, max ${Math.round(ceiling / 1024 / 1024)} MB`)
    }

    // Check caller types
    if (write.allowedTypes && write.allowedTypes.length > 0) {
      if (!write.allowedTypes.includes(mimeType)) throw new Error('File type refused')
    }

    const extension = mimeType.split('/')[1] ?? ''

    if (config.files.blocked.includes(extension)) throw new Error('File type blocked')

    if (config.files.authorized.length > 0 && !config.files.authorized.includes(extension)) {
      throw new Error('File type not authorized')
    }
  }

  /**
   * Write object
   * @param {StorageLocation} location - Location
   * @param {StorageWrite} write - Write
   * @param {string} mimeType - Type
   * @return {Promise<StorageInfo>} - Metadata
   * @private
   */

  private async _write(
    location: StorageLocation,
    write: StorageWrite,
    mimeType: string
  ): Promise<StorageInfo> {
    const byteSize = write.data.byteLength
    const metadata = write.metadata ? { metadata: write.metadata } : {}

    // Unique buckets keep one object per key
    if (STORAGE_BUCKETS.get(location.bucket).unique) {
      const stored = await prisma.storageEntry.upsert({
        where: { bucket_key: { bucket: location.bucket, key: location.key } },
        update: { data: write.data, mimeType, byteSize, ...metadata },
        create: {
          bucket: location.bucket,
          key: location.key,
          data: write.data,
          mimeType,
          byteSize,
          ...metadata,
        },
        select: { updatedAt: true },
      })

      return {
        bucket: location.bucket,
        key: location.key,
        mimeType,
        byteSize,
        updatedAt: stored.updatedAt,
      }
    }

    // Append buckets mint their own key
    const stored = await prisma.storageEntry.create({
      data: {
        bucket: location.bucket,
        key: crypto.randomUUID(),
        data: write.data,
        mimeType,
        byteSize,
        ...metadata,
      },
      select: { key: true, updatedAt: true },
    })

    return {
      bucket: location.bucket,
      key: stored.key,
      mimeType,
      byteSize,
      updatedAt: stored.updatedAt,
    }
  }

  /**
   * Get object metadata
   * @param {StorageLocation} location - Location
   * @return {Promise<StorageInfo | null>} - Metadata
   * @private
   */

  private async _info(location: StorageLocation): Promise<StorageInfo | null> {
    const row = await prisma.storageEntry.findUnique({
      where: { bucket_key: { bucket: location.bucket, key: location.key } },
      select: { mimeType: true, byteSize: true, updatedAt: true },
    })

    return row ? { bucket: location.bucket, key: location.key, ...row } : null
  }

  /**
   * Process upload queue
   * @return {Promise<void>} - Completion
   * @private
   */

  private async _processUploadQueue(): Promise<void> {
    // Process while slots available
    while (this._uploadQueue.length > 0 && this._activeUploads < this.config.concurrency) {
      const upload = this._uploadQueue.shift()

      if (!upload) return

      this._activeUploads += 1

      try {
        await upload()
      } catch (error) {
        // Error already rejected promise
        this.logger.error('File write failed', error)
      } finally {
        this._activeUploads -= 1
      }
    }
  }

  /**
   * Handle upload retry
   * @template TResult - Result type
   * @param {() => Promise<TResult>} run - Write function
   * @return {Promise<TResult>} - Result
   * @private
   */

  private async _handleUploadRetry<TResult>(run: () => Promise<TResult>): Promise<TResult> {
    const { attempts, initialDelayMs } = this.config.retry

    let lastError: unknown

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await run()
      } catch (error) {
        lastError = error

        // Wait before next
        if (attempt < attempts - 1) {
          const delay = initialDelayMs * Math.pow(2, attempt)

          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError))
  }

  /**
   * Build cache key
   * @param {StorageLocation} location - Location
   * @return {string} - Key
   * @private
   */

  private _cacheKey(location: StorageLocation): string {
    return `${location.bucket}:${location.key}`
  }
}
