import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'

import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { readUnlockWindow } from '@/core/services/auth/TwoFactorService'
import { isSensitiveField } from '@/declarations/access/sensitive'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { SealState } from '@/types/security'

/**
 * Read the session token
 * @return {Promise<string | null>} - Session token
 */

export const readSessionToken = cache(async (): Promise<string | null> => {
  const store = await cookies()

  return store.get(SESSION_COOKIE)?.value ?? null
})

/**
 * Read the seal
 * @return {Promise<SealState>} - Seal state
 */

export const readSealState = cache(async (): Promise<SealState> => {
  const token = await readSessionToken()
  if (!token) return { isUnsealed: false, closesAt: null }

  const closesAt = await readUnlockWindow(token)

  return { isUnsealed: closesAt !== null, closesAt }
})

/**
 * Blank sealed values
 * @param {FormValues} values - Record on its way to the client
 * @param {boolean} isUnsealed - Window still open
 * @return {FormValues} - Record without its sealed content
 */

export const sealValues = (values: FormValues, isUnsealed: boolean): FormValues => {
  if (isUnsealed) return values

  return Object.fromEntries(
    Object.entries(values).map(([name, value]) => [name, isSensitiveField(name) ? null : value])
  )
}

/**
 * Lock sealed fields
 * @param {FieldDefinition[]} fields - Form declarations
 * @param {boolean} isUnsealed - Window still open
 * @return {FieldDefinition[]} - Declarations, sealed ones read-only
 */

export const sealFields = (fields: FieldDefinition[], isUnsealed: boolean): FieldDefinition[] => {
  if (isUnsealed) return fields

  return fields.map((field) =>
    isSensitiveField(field.name) ? { ...field, readOnly: true } : field
  )
}

/**
 * Drop sealed columns
 * @param {T} data - Database payload
 * @return {Promise<Partial<T>>} - Payload without its sealed columns
 */

export const withoutSealedWrites = async <T extends object>(data: T): Promise<Partial<T>> => {
  const { isUnsealed } = await readSealState()
  if (isUnsealed) return data

  // A redacted value must never travel back and erase the column it stood in for
  return Object.fromEntries(
    Object.entries(data).filter(([name]) => !isSensitiveField(name))
  ) as Partial<T>
}
