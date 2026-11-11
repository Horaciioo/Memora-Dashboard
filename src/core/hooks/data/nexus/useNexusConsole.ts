'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { useNexusRegistry } from '@/core/hooks/data/nexus/useNexusRegistry'
import { useNexusSession } from '@/core/hooks/data/nexus/useNexusSession'
import { ApiClientError, apiPost } from '@/core/lib/api/client'
import { pushHistory } from '@/core/lib/nexus/terminal/history'
import { helpReply, historyReply, readLocal } from '@/core/lib/nexus/terminal/local'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import { NEXUS_TERMINAL_COPY } from '@/declarations/nexus/terminal'
import { NEXUS_UNLOCK_COMMAND } from '@/declarations/nexus/unlock'
import { NEXUS_WINDOW } from '@/declarations/nexus/window'
import type { NexusBlock, NexusPromptMode, NexusReply } from '@/types/nexus'
import { ErrorCodes } from '@/utils/constants/errors'

// Message of a failed call
const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : NEXUS_COPY.timedOut

/**
 * Open the Discord step in a popup and wait for its answer
 * @return {Promise<boolean>} - Second factor passed
 */

const askDiscord = (): Promise<boolean> =>
  new Promise((resolve) => {
    const popup = window.open(NEXUS_PATHS.discord, 'nexus-discord', 'width=520,height=720')
    if (!popup) return resolve(false)

    const finish = (passed: boolean) => {
      window.removeEventListener('message', onMessage)
      clearInterval(watch)
      resolve(passed)
    }
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== popup) return
      finish((event.data as { nexus?: string })?.nexus === 'unlocked')
    }
    // A closed popup is a refusal
    const watch = setInterval(() => popup.closed && finish(false), 500)
    window.addEventListener('message', onMessage)
  })

/**
 * State and actions of the console
 * @param {boolean} isOpen - Window is open
 * @return {Object} - Console state
 */

export const useNexusConsole = (isOpen: boolean) => {
  const { session, stage, refresh } = useNexusSession(isOpen)
  const registry = useNexusRegistry(Boolean(session?.unlocked))
  const [blocks, setBlocks] = useState<NexusBlock[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [mode, setMode] = useState<NexusPromptMode>('command')
  const [isBusy, setBusy] = useState(false)
  const counter = useRef(0)
  const retry = useRef('')

  const csrf = session?.csrf
  const csrfHeader = useMemo(
    () => (csrf ? { [NEXUS_PATHS.csrfHeader]: csrf } : undefined),
    [csrf]
  )

  const add = useCallback((block: Omit<NexusBlock, 'id' | 'at'>) => {
    counter.current += 1
    const id = counter.current
    setBlocks((current) =>
      [...current, { ...block, id, at: Date.now() }].slice(-NEXUS_WINDOW.blocksKept)
    )

    return id
  }, [])

  const patch = useCallback(
    (id: number, change: Partial<NexusBlock>) =>
      setBlocks((current) =>
        current.map((block) => (block.id === id ? { ...block, ...change } : block))
      ),
    []
  )

  // Locking empties what was shown
  const forget = useCallback(() => {
    setBlocks([])
    setHistory([])
    setMode('command')
  }, [])

  const afterReply = useCallback(
    (reply: NexusReply, input: string) => {
      const next = (reply.data as { next?: string } | null)?.next
      if (next === 'password') setMode('password')
      if (input.startsWith('$access.lock')) {
        forget()
        void refresh()
      } else if (input.startsWith('$access.')) void refresh()
    },
    [forget, refresh]
  )

  const run = useCallback(
    async (input: string, confirmToken?: string, id?: number) => {
      const blockId = id ?? add({ input, state: 'running' })
      if (id) patch(id, { state: 'running', error: undefined })
      setBusy(true)
      try {
        const reply = await apiPost<NexusReply>(
          NEXUS_PATHS.commands,
          { input, confirmToken },
          csrfHeader
        )
        patch(blockId, { state: reply.status === 'previewed' ? 'previewed' : 'done', reply })
        afterReply(reply, input)
      } catch (error) {
        patch(blockId, { state: 'failed', error: messageOf(error) })
        // A lapsed session or an old password
        if (error instanceof ApiClientError && error.code === ErrorCodes.NotAuthenticated) {
          if (session?.unlocked && error.message === NEXUS_COPY.reauthNeeded) {
            retry.current = input
            setMode('reauth')
          } else {
            forget()
            void refresh()
          }
        }
      } finally {
        setBusy(false)
      }
    },
    [add, patch, csrfHeader, afterReply, session, forget, refresh]
  )

  const unlock = useCallback(
    async (password: string) => {
      setBusy(true)
      try {
        await apiPost(NEXUS_PATHS.password, { password })
        setMode('discord')
        const passed = await askDiscord()
        add({ input: NEXUS_UNLOCK_COMMAND, state: passed ? 'done' : 'failed', error: passed ? undefined : NEXUS_COPY.discordRefused })
        setMode('command')
        if (passed) await refresh()
      } catch (error) {
        add({ input: NEXUS_UNLOCK_COMMAND, state: 'failed', error: messageOf(error) })
        setMode('command')
      } finally {
        setBusy(false)
      }
    },
    [add, refresh]
  )

  const reauthenticate = useCallback(
    async (password: string) => {
      setBusy(true)
      try {
        await apiPost(NEXUS_PATHS.reauth, { password }, csrfHeader)
        setMode('command')
        await refresh()
        const again = retry.current
        retry.current = ''
        if (again) await run(again)
      } catch (error) {
        add({ input: NEXUS_COPY.reauthNeeded, state: 'failed', error: messageOf(error) })
        setMode('command')
      } finally {
        setBusy(false)
      }
    },
    [csrfHeader, refresh, run, add]
  )

  const submit = useCallback(
    (text: string) => {
      if (mode === 'password') return void unlock(text)
      if (mode === 'reauth') return void reauthenticate(text)
      if (mode !== 'command') return

      // An empty line on a locked console asks to open it
      const input = text.trim() || (stage === 'locked' ? NEXUS_UNLOCK_COMMAND : '')
      if (!input) return
      setHistory((current) => pushHistory(current, input, NEXUS_WINDOW.historySize))

      const local = readLocal(input)
      if (!local) return void run(input)
      if (local.name === 'clear') return setBlocks([])

      const reply =
        local.name === 'help' ? helpReply(registry, local.rest) : historyReply(history)
      add({ input, state: 'done', reply })
    },
    [mode, stage, unlock, reauthenticate, run, registry, history, add]
  )

  const confirm = useCallback(
    (block: NexusBlock, retyped?: string) => {
      const suffix = retyped ? ` --confirm=${retyped}` : ''
      void run(block.input + suffix, block.reply?.confirmToken, block.id)
    },
    [run]
  )

  const cancel = useCallback((id: number) => patch(id, { state: 'failed', error: NEXUS_TERMINAL_COPY.cancelled }), [patch])

  return { session, stage, registry, blocks, history, mode, isBusy, submit, confirm, cancel, forget }
}
