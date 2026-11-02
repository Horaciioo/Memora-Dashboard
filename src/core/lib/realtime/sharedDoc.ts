import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness'

/**
 * Shared document and its carets
 * @typedef {Object} SharedDoc
 */

export interface SharedDoc {
  doc: Y.Doc
  awareness: Awareness
  // Provider shape the editor extensions read
  provider: SharedProvider
}

/**
 * Carets and the first sync, as Tiptap expects a provider
 * @typedef {Object} SharedProvider
 */

export interface SharedProvider {
  awareness: Awareness
  on: (event: string, listener: () => void) => void
  off: (event: string, listener: () => void) => void
  // Server state merged once
  markSynced: () => void
}

// Only event the extensions listen to
const SYNCED = 'synced'

/**
 * Provider over a document's carets
 * @param {Awareness} awareness - Carets
 * @return {SharedProvider} - Provider
 */

const providerOf = (awareness: Awareness): SharedProvider => {
  const listeners = new Set<() => void>()

  return {
    awareness,
    on: (event, listener) => void (event === SYNCED && listeners.add(listener)),
    off: (event, listener) => void (event === SYNCED && listeners.delete(listener)),
    markSynced: () => [...listeners].forEach((listener) => listener()),
  }
}

// Effects holding each document
const holders = new WeakMap<SharedDoc, number>()

/**
 * Document seeded with a stored state
 * @param {Uint8Array} state - Yjs state
 * @return {SharedDoc} - Document
 */

export const createSharedDoc = (state: Uint8Array): SharedDoc => {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, state)

  const awareness = new Awareness(doc)

  return { doc, awareness, provider: providerOf(awareness) }
}

/**
 * Hold a document, freed once nobody holds it
 * @param {SharedDoc} shared - Document
 * @return {() => void} - Release
 */

export const holdSharedDoc = (shared: SharedDoc): (() => void) => {
  holders.set(shared, (holders.get(shared) ?? 0) + 1)

  return () => {
    holders.set(shared, (holders.get(shared) ?? 1) - 1)
    // A remount takes it back first
    queueMicrotask(() => {
      if ((holders.get(shared) ?? 0) > 0) return
      shared.awareness.destroy()
      shared.doc.destroy()
    })
  }
}
