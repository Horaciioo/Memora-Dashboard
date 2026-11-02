'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { yXmlFragmentToProsemirrorJSON } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

import { keepDocState, readOfflinePage, rememberPage } from '@/core/lib/pages/offline/store'
import { PAGE_DOC_FIELD } from '@/core/lib/pages/schema'
import { fromBase64, toBase64 } from '@/core/lib/realtime/codec'
import { linkDoc } from '@/core/lib/realtime/docLink'
import { createSharedDoc, holdSharedDoc } from '@/core/lib/realtime/sharedDoc'
import type { DocLinkStatus } from '@/core/lib/realtime/docLink'
import { PAGE_TOPICS } from '@/declarations/pages/topics'
import { REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { PageDetail, PageDocument } from '@/types/pages'

// Origin of the device copy
const DEVICE = 'device'

/**
 * Open the shared document, keep a device copy, link it to the socket
 * @param {PageDetail} page - Page opened
 * @param {string} accountId - Signed-in account
 * @param {boolean} canWrite - Sends its changes
 * @return {{ shared: SharedDoc, status: DocLinkStatus }} - Document and save state
 */

export const usePageDoc = (page: PageDetail, accountId: string, canWrite: boolean) => {
  // One document per page, server state first
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shared = useMemo(() => createSharedDoc(fromBase64(page.yState)), [page.id])
  const [status, setStatus] = useState<DocLinkStatus>('saved')
  const isPending = useRef(false)
  const pageRef = useRef(page)
  const scheduleSave = useRef<() => void>(() => undefined)

  // Freed once nothing holds it
  useEffect(() => holdSharedDoc(shared), [shared])

  // Unsent changes of this device join in
  useEffect(() => {
    let isLive = true
    void readOfflinePage(accountId, page.id).then((entry) => {
      if (!isLive) return
      if (entry?.yState) Y.applyUpdate(shared.doc, fromBase64(entry.yState), DEVICE)
      else void rememberPage(accountId, pageRef.current)
    })

    return () => {
      isLive = false
    }
  }, [shared, accountId, page.id])

  useEffect(() => {
    return linkDoc({
      topic: PAGE_TOPICS.page(page.id),
      doc: shared.doc,
      awareness: shared.awareness,
      canWrite,
      onSynced: shared.provider.markSynced,
      onStatus: (next) => {
        isPending.current = next !== 'saved'
        setStatus(next)
      },
    })
  }, [shared, canWrite, page.id])

  // Device copy, debounced
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    const save = () => {
      timer = null
      const content = yXmlFragmentToProsemirrorJSON(shared.doc.getXmlFragment(PAGE_DOC_FIELD))
      void keepDocState(
        accountId,
        { ...pageRef.current, content: content as PageDocument },
        { yState: toBase64(Y.encodeStateAsUpdate(shared.doc)), isPending: isPending.current }
      )
    }
    const onUpdate = () => {
      timer ??= setTimeout(save, REALTIME_SETTINGS.docDeviceMs)
    }
    shared.doc.on('update', onUpdate)
    scheduleSave.current = onUpdate

    return () => {
      shared.doc.off('update', onUpdate)
      scheduleSave.current = () => undefined
      if (timer) {
        clearTimeout(timer)
        save()
      }
    }
  }, [shared, accountId])

  // Acknowledged, the copy stops waiting
  useEffect(() => {
    if (status === 'saved') scheduleSave.current()
  }, [status])

  return { shared, status }
}
