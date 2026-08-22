/**
 * Get object differences
 * @param {T} original - Original object
 * @param {T} modified - Modified object
 * @return {unknown} - Changes object
 */

export function getObjectDifferences<T>(original: T, modified: T): unknown {
  // Collect changes
  const changes: Record<string, unknown> = {}

  // Handle arrays
  if (Array.isArray(original) && Array.isArray(modified)) {
    if (JSON.stringify(original.sort()) !== JSON.stringify(modified.sort())) return modified
    return undefined
  }

  // Handle objects
  if (original && modified && typeof original === 'object' && typeof modified === 'object') {
    const originalRecord = original as Record<string, unknown>
    const modifiedRecord = modified as Record<string, unknown>

    // Compare properties
    Object.keys({ ...originalRecord, ...modifiedRecord }).forEach((key) => {
      const diff = getObjectDifferences(originalRecord[key], modifiedRecord[key])
      if (diff !== undefined) changes[key] = diff
    })

    return Object.keys(changes).length ? changes : undefined
  }

  // Compare values
  if (original !== modified) return modified

  return undefined
}
