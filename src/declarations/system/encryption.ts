/**
 * Columns written through the cipher
 * @type {string[]}
 */

export const ENCRYPTED_FIELDS = ['body', 'reason', 'reviewNote', 'accessToken', 'refreshToken']

/**
 * Whether one column name carries ciphertext
 * @param {string} column - Column name
 * @return {boolean} - Column is encrypted
 */

export const isEncryptedField = (column: string): boolean => ENCRYPTED_FIELDS.includes(column)
