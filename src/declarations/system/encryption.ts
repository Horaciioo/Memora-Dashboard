/**
 * Columns written through the cipher, named once so every reader agrees.
 * A portable export and a future re-key both walk this list rather than
 * rediscovering which columns carry ciphertext
 * @type {string[]}
 */

export const ENCRYPTED_FIELDS = ['body', 'reason', 'reviewNote', 'accessToken', 'refreshToken']

/**
 * Whether one column name carries ciphertext
 * @param {string} column - Column name
 * @return {boolean} - Column is encrypted
 */

export const isEncryptedField = (column: string): boolean => ENCRYPTED_FIELDS.includes(column)
