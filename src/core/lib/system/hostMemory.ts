import 'server-only'

import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import os from 'node:os'
import { promisify } from 'node:util'

const run = promisify(execFile)

// Linux reports it in kilobytes
const KILOBYTE = 1024

// Pages macOS can hand back at once
const REUSABLE_PAGES = ['Pages free', 'Pages inactive', 'Pages speculative', 'Pages purgeable']

/**
 * Memory a program can still take, the cache the system gives back on demand counted in
 * @return {Promise<number>} - Bytes available
 */

export const readAvailableMemory = async (): Promise<number> => {
  try {
    if (process.platform === 'linux') {
      const meminfo = await readFile('/proc/meminfo', 'utf8')
      const kilobytes = /^MemAvailable:\s+(\d+)\s+kB/m.exec(meminfo)?.[1]

      if (kilobytes) return Number(kilobytes) * KILOBYTE
    }

    if (process.platform === 'darwin') {
      const { stdout } = await run('vm_stat')
      const pageSize = Number(/page size of (\d+) bytes/.exec(stdout)?.[1])
      const pages = REUSABLE_PAGES.reduce(
        (total, name) => total + Number(new RegExp(`${name}:\\s+(\\d+)`).exec(stdout)?.[1] ?? 0),
        0
      )

      if (pageSize > 0) return pages * pageSize
    }
  } catch {
    // Falls back to what the system calls free
  }

  return os.freemem()
}
