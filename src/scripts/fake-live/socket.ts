import { createHash } from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'

/**
 * Server side of one WebSocket
 * @typedef {Object} FakeSocket
 * @property {(text: string) => void} send - Send a text frame
 * @property {() => void} close - Close politely
 * @property {() => void} kill - Drop without a close frame
 * @property {(listener: () => void) => void} onClose - Called once closed
 */

export interface FakeSocket {
  send: (text: string) => void
  close: () => void
  kill: () => void
  onClose: (listener: () => void) => void
}

// RFC 6455 magic string
const HANDSHAKE_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

const OPCODES = { text: 0x1, close: 0x8, ping: 0x9, pong: 0xa } as const

/**
 * Encode one unmasked frame
 * @param {number} opcode - Frame opcode
 * @param {Buffer} payload - Payload
 * @return {Buffer} - Frame
 */

const frameOf = (opcode: number, payload: Buffer): Buffer => {
  const length = payload.length
  const head = length < 126 ? 2 : length < 65536 ? 4 : 10
  const header = Buffer.alloc(head)
  header[0] = 0x80 | opcode

  // Length in one, two or eight bytes
  if (length < 126) header[1] = length
  else if (length < 65536) {
    header[1] = 126
    header.writeUInt16BE(length, 2)
  } else {
    header[1] = 127
    header.writeBigUInt64BE(BigInt(length), 2)
  }

  return Buffer.concat([header, payload])
}

/**
 * Read the complete frames of a buffer
 * @param {Buffer} buffer - Received bytes
 * @return {{ frames: { opcode: number, payload: Buffer }[], rest: Buffer }} - Frames and leftover
 */

const readFrames = (buffer: Buffer) => {
  const frames: { opcode: number; payload: Buffer }[] = []
  let offset = 0

  while (buffer.length - offset >= 2) {
    const opcode = (buffer[offset] ?? 0) & 0x0f
    const second = buffer[offset + 1] ?? 0
    const masked = (second & 0x80) !== 0
    let length = second & 0x7f
    let cursor = offset + 2

    // Extended lengths
    if (length === 126) {
      if (buffer.length < cursor + 2) break
      length = buffer.readUInt16BE(cursor)
      cursor += 2
    } else if (length === 127) {
      if (buffer.length < cursor + 8) break
      length = Number(buffer.readBigUInt64BE(cursor))
      cursor += 8
    }

    const maskLength = masked ? 4 : 0
    if (buffer.length < cursor + maskLength + length) break

    // Clients always mask
    const mask = buffer.subarray(cursor, cursor + maskLength)
    const payload = Buffer.from(buffer.subarray(cursor + maskLength, cursor + maskLength + length))
    if (masked) payload.forEach((byte, index) => (payload[index] = byte ^ (mask[index % 4] ?? 0)))

    frames.push({ opcode, payload })
    offset = cursor + maskLength + length
  }

  return { frames, rest: buffer.subarray(offset) }
}

/**
 * Accept an upgrade request
 * @param {IncomingMessage} request - Upgrade request
 * @param {Duplex} stream - Raw socket
 * @return {FakeSocket | null} - Socket, or nothing if refused
 */

export const acceptSocket = (request: IncomingMessage, stream: Duplex): FakeSocket | null => {
  const key = request.headers['sec-websocket-key']
  if (typeof key !== 'string') {
    stream.destroy()
    return null
  }

  // Handshake answer
  const accept = createHash('sha1').update(`${key}${HANDSHAKE_GUID}`).digest('base64')
  stream.write(
    `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`
  )

  let pending = Buffer.alloc(0)
  let closed = false
  const listeners: (() => void)[] = []
  const finish = () => {
    if (closed) return
    closed = true
    listeners.forEach((listener) => listener())
  }

  // Answer pings and closes
  stream.on('data', (chunk: Buffer) => {
    const { frames, rest } = readFrames(Buffer.concat([pending, chunk]))
    pending = Buffer.from(rest)
    for (const frame of frames) {
      if (frame.opcode === OPCODES.ping) stream.write(frameOf(OPCODES.pong, frame.payload))
      if (frame.opcode === OPCODES.close) {
        stream.end(frameOf(OPCODES.close, Buffer.alloc(0)))
        finish()
      }
    }
  })
  stream.on('close', finish)
  stream.on('error', finish)

  return {
    send: (text) => {
      if (!closed) stream.write(frameOf(OPCODES.text, Buffer.from(text)))
    },
    close: () => {
      if (!closed) stream.end(frameOf(OPCODES.close, Buffer.alloc(0)))
      finish()
    },
    kill: () => {
      stream.destroy()
      finish()
    },
    onClose: (listener) => {
      listeners.push(listener)
    },
  }
}
