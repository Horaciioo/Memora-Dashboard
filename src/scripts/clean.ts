import { execFileSync } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';

const BUSY = /server\.mjs|next-(build|server|dev)|\/\.next[\w-]*\//;

/** Refuse while Next runs */
const busy = execFileSync('ps', ['-Ao', 'pid,command'], { encoding: 'utf8' })
  .split('\n')
  .filter((line) => BUSY.test(line) && !line.includes(`${process.pid} `));

if (busy.length > 0) {
  console.error('Next tourne encore, arrête-le avant de nettoyer :');
  busy.forEach((line) => console.error(`  ${line.trim().slice(0, 120)}`));
  process.exit(1);
}

const targets = [
  '.next/dev',
  ...readdirSync('.').filter((name) => /^\.next-.+/.test(name)),
];

targets.forEach((target) => {
  rmSync(target, { recursive: true, force: true });
  console.log(`Supprimé : ${target}`);
});
