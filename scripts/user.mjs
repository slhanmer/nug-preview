#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

/*
 * pnpm user <email> [admin|editor]
 *
 * The password is asked for here and passed to the child as an env var. It is
 * never an argument — arguments land in shell history and in `ps` — and it is
 * never written to a file. Echo is suppressed while it is typed.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
/* Trimmed, because a stray space or quote off a shell survives all the way to
   Payload and comes back as "the following field is invalid". */
const email = (process.argv[2] ?? '').trim().replace(/^['"]|['"]$/g, '')
const role = (process.argv[3] ?? 'editor').trim()

if (!email || !email.includes('@')) {
  console.error('Usage: pnpm user <email> [admin|editor]')
  console.error('  editor — changes copy, images and menus. What a client gets.')
  console.error('  admin  — also composes pages and manages accounts.')
  process.exit(1)
}
if (role !== 'admin' && role !== 'editor') {
  console.error(`Role must be "admin" or "editor". Got "${role}".`)
  process.exit(1)
}

function askHidden(question) {
  /*
   * The documented readline mute: override _writeToOutput on the interface.
   * An earlier version attached its own 'data' listener to process.stdin
   * alongside readline's, which on Windows is a good way to get input back
   * that is not what was typed.
   */
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    })
    let muted = false
    rl._writeToOutput = (chunk) => {
      if (!muted) rl.output.write(chunk)
    }
    rl.question(question, (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer.trim())
    })
    muted = true
  })
}

const password = await askHidden(`Password for ${email}: `)
if (password.length < 8) {
  console.error('Payload requires at least 8 characters.')
  process.exit(1)
}

const child = spawn('pnpm', ['payload', 'run', './src/seed/user.ts'], {
  cwd: root,
  env: {
    ...process.env,
    NEW_USER_EMAIL: email,
    NEW_USER_PASSWORD: password,
    NEW_USER_ROLE: role,
  },
  stdio: 'inherit',
  shell: true,
})
child.on('exit', (code) => process.exit(code ?? 1))
