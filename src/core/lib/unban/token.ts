import { randomInt } from 'node:crypto'

import { UNBAN_TOKEN } from '@/utils/constants/unban'

/**
 * Short readable code of a request
 * @return {string} - Reference such as DB-7K3QX
 */

export const createReference = (): string => {
  const { referenceAlphabet, referenceLength, referencePrefix } = UNBAN_TOKEN
  const code = Array.from(
    { length: referenceLength },
    () => referenceAlphabet[randomInt(referenceAlphabet.length)]
  ).join('')

  return `${referencePrefix}${code}`
}
