'use client'

import { useEffect } from 'react'
import type { Editor } from '@tiptap/core'

import { BLOCK_HASH_PREFIX, PAGE_TARGET_SETTINGS } from '@/declarations/pages/editor'

/**
 * Scroll to and light the block a deep link names
 * @param {Editor | null} editor - Editor
 * @return {void}
 */

export const useBlockTarget = (editor: Editor | null): void => {
  useEffect(() => {
    if (!editor) return
    let timer: ReturnType<typeof setTimeout> | undefined

    const reach = () => {
      const { hash } = window.location
      if (!hash.startsWith(BLOCK_HASH_PREFIX)) return

      const id = decodeURIComponent(hash.slice(BLOCK_HASH_PREFIX.length))
      const element = editor.view.dom.querySelector(`[data-id="${CSS.escape(id)}"]`)
      if (!element) return

      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
      element.classList.add('block-target')
      clearTimeout(timer)
      timer = setTimeout(() => element.classList.remove('block-target'), PAGE_TARGET_SETTINGS.highlightMs)
    }

    reach()
    window.addEventListener('hashchange', reach)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('hashchange', reach)
    }
  }, [editor])
}
