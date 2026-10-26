/**
 * Stream shared by every listener of a tab
 * @typedef {Object} SharedStream
 */

interface SharedStream {
  source: EventSource
  listeners: number
}

// One connection per route
const streams = new Map<string, SharedStream>()

/**
 * Listen to a stream event, the connection shared and closed with its last listener
 * @param {string} url - Stream route
 * @param {string} event - Event name, open included
 * @param {() => void} handler - Listener
 * @return {() => void} - Stop listening
 */

export const listenStream = (url: string, event: string, handler: () => void): (() => void) => {
  // The browser reconnects on its own after a drop
  const stream = streams.get(url) ?? { source: new EventSource(url), listeners: 0 }
  streams.set(url, stream)
  stream.listeners += 1
  stream.source.addEventListener(event, handler)

  return () => {
    stream.source.removeEventListener(event, handler)
    stream.listeners -= 1
    if (stream.listeners > 0) return
    stream.source.close()
    streams.delete(url)
  }
}
