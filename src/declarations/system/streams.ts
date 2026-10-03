/**
 * Headers of a server-sent event stream
 * @type {Record<string, string>}
 */

export const STREAM_HEADERS = {
  'content-type': 'text/event-stream; charset=utf-8',
  'cache-control': 'no-cache, no-transform',
  connection: 'keep-alive',
  // Proxies must not buffer the stream
  'x-accel-buffering': 'no',
}
