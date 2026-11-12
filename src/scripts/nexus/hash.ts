import { readFileSync } from 'node:fs'
import { stdin, stdout } from 'node:process'

import { hash } from '@node-rs/argon2'

// Cost read from the same file the console reads
const { password: cost } = JSON.parse(
  readFileSync(new URL('../../configurations/system/nexus.json', import.meta.url), 'utf8')
) as { password: { memoryKib: number; iterations: number; parallelism: number; minLength: number } }

/**
 * Read a line without echoing it
 * @param {string} label - Prompt
 * @return {Promise<string>} - Typed line
 */

const askHidden = (label: string): Promise<string> =>
  new Promise((resolve) => {
    stdout.write(`${label} : `)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    let typed = ''
    const onKey = (chunk: string): void => {
      // A paste arrives as one chunk
      for (const key of chunk) {
        // Enter ends, Ctrl+C aborts
        if (key === '\r' || key === '\n') {
          stdin.setRawMode(false)
          stdin.pause()
          stdin.off('data', onKey)
          stdout.write('\n')
          resolve(typed)
          return
        }
        if (key === '\u0003') {
          stdout.write('\n')
          process.exit(130)
        }
        typed = key === '\u007f' ? typed.slice(0, -1) : typed + key
      }
    }

    stdin.on('data', onKey)
  })

if (!stdin.isTTY) {
  console.error('Lance cette commande dans un terminal.')
  process.exit(1)
}

const first = await askHidden('Mot de passe')
const second = await askHidden('Confirmation')

if (first !== second) {
  console.error('Les deux saisies diffèrent.')
  process.exit(1)
}

if (first.length < cost.minLength) {
  console.error(`Il faut au moins ${cost.minLength} caractères.`)
  process.exit(1)
}

const phc = await hash(first, {
  memoryCost: cost.memoryKib,
  timeCost: cost.iterations,
  parallelism: cost.parallelism,
})

// Base64 so no env loader expands the dollar signs
console.error('A coller dans .env :')
console.log(`NEXUS_OWNER_PASSWORD_HASH=${Buffer.from(phc, 'utf8').toString('base64')}`)
