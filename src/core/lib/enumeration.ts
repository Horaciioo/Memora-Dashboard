export interface EnumerationDefinition {
  // Stable numeric id
  id: number
  label: string
  // Kept resolvable
  deprecated?: boolean
}

export type EnumerationSource = Record<string, EnumerationDefinition>

export interface EnumerationEntry<TName extends string> extends EnumerationDefinition {
  name: TName
}

export interface EnumerationOption {
  value: number
  label: string
}

export interface Enumeration<TSource extends EnumerationSource> {
  ids: { [TName in keyof TSource]: TSource[TName]['id'] }
  names: (keyof TSource & string)[]
  list: EnumerationEntry<keyof TSource & string>[]
  options: EnumerationOption[]
  byId: (id: number) => EnumerationEntry<keyof TSource & string> | undefined
  byName: (name: keyof TSource & string) => EnumerationEntry<keyof TSource & string>
  label: (id: number) => string
  has: (id: number) => boolean
}

/**
 * Create enumeration
 * @param {TSource} source - Source
 * @return {Enumeration<TSource>} - Helpers
 */

export const createEnumeration = <const TSource extends EnumerationSource>(
  source: TSource
): Enumeration<TSource> => {
  type Name = keyof TSource & string

  const names = Object.keys(source) as Name[]
  const list = names.map((name) => ({ name, ...source[name] }))

  // Index for constant lookup
  const byIdIndex = new Map(list.map((entry) => [entry.id, entry]))
  const byNameIndex = new Map(list.map((entry) => [entry.name, entry]))

  const byId = (id: number) => byIdIndex.get(id)

  return {
    ids: Object.fromEntries(
      list.map((entry) => [entry.name, entry.id])
    ) as Enumeration<TSource>['ids'],
    names,
    list,
    options: list
      .filter((entry) => !entry.deprecated)
      .map((entry) => ({ value: entry.id, label: entry.label })),
    byId,
    byName: (name) => byNameIndex.get(name) as EnumerationEntry<Name>,
    label: (id) => byId(id)?.label ?? String(id),
    has: (id) => byIdIndex.has(id),
  }
}
