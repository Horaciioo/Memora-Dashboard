/**
 * Transform snake_case
 * @param {string} text - Snake_case text
 * @return {string} - Capitalized words
 */

export function transformText(text: string): string {
  // Split and capitalize
  const words = text.toLowerCase().split('_')
  const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1))

  return capitalizedWords.join(' ')
}

/**
 * Capitalize first letter
 * @param {string} word - Text
 * @return {string} - Capitalized word
 */

export function capitalizeFirstLetter(word: string): string {
  // Capitalize first letter
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/**
 * Extract query parameters
 * @param {string} url - Full URL
 * @return {Record<string, string>} - Query params
 */

export function extractQueryFromURL(url: string): Record<string, string> {
  // Parse query string
  const queryParams: Record<string, string> = {}
  const queryString = url.split('?')[1]

  if (queryString) {
    // Build params map
    const pairs = queryString.split('&')

    for (const pair of pairs) {
      const [key, value] = pair.split('=')
      queryParams[key] = decodeURIComponent(value)
    }
  }

  return queryParams
}
