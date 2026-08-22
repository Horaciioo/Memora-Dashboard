export interface Registry<TKey extends string, TValue extends { label: string }> {
  map: Record<TKey, TValue>
  keys: TKey[]
  list: TValue[]
  get: (key: TKey) => TValue
  label: (key: TKey) => string
  has: (key: string) => key is TKey
}

/**
 * Create registry
 * @param {Record<TKey, TValue>} map - Map
 * @return {Registry<TKey, TValue>} - Registry
 */

export const createRegistry = <TKey extends string, TValue extends { label: string }>(
  map: Record<TKey, TValue>
): Registry<TKey, TValue> => {
  const keys = Object.keys(map) as TKey[]

  return {
    map,
    keys,
    list: keys.map((key) => map[key]),
    get: (key) => map[key],
    label: (key) => map[key].label,
    has: (key): key is TKey => Object.prototype.hasOwnProperty.call(map, key),
  }
}
