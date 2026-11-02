import type { AnyExtension, Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import { Placeholder } from '@tiptap/extensions'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { CalloutView } from '@/composites/pages/editor/nodes/CalloutView'
import { SubpageView } from '@/composites/pages/editor/nodes/SubpageView'
import { findBlock, moveBlock } from '@/core/lib/pages/operations'
import { looksLikeMarkdown, markdownToBlocks } from '@/core/lib/pages/markdownPaste'
import { Callout, PAGE_DOC_FIELD, Subpage, pageSchemaExtensions } from '@/core/lib/pages/schema'
import type { SharedDoc } from '@/core/lib/realtime/sharedDoc'
import { tintColor } from '@/core/lib/realtime/tint'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'

/**
 * Move the block holding the caret
 * @param {Editor} editor - Editor
 * @param {-1 | 1} direction - Up or down
 * @return {boolean} - Moved
 */

export const moveCaretBlock = (editor: Editor, direction: -1 | 1): boolean => {
  const { $from } = editor.state.selection

  // Closest block carrying an id
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const id = $from.node(depth).attrs.id as string | undefined
    const block = id ? findBlock(editor.state.doc, id) : null
    const tr = block ? moveBlock(editor.state, block.pos, direction) : null
    if (tr) {
      editor.view.dispatch(tr.scrollIntoView())
      return true
    }
  }

  return false
}

// Colour variable of a caret
const CARET_TINT = '--caret-tint'

// Keyboard moves and markdown paste
const PageKeys = Extension.create({
  name: 'pageKeys',

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-ArrowUp': ({ editor }) => moveCaretBlock(editor, -1),
      'Mod-Shift-ArrowDown': ({ editor }) => moveCaretBlock(editor, 1),
    }
  },
})

/**
 * Turn pasted plain markdown into blocks
 * @param {Editor} editor - Editor
 * @param {ClipboardEvent} event - Paste
 * @return {boolean} - Handled
 */

export const pasteMarkdown = (editor: Editor, event: ClipboardEvent): boolean => {
  const data = event.clipboardData
  // Rich clipboards go through the schema
  if (!data || data.types.includes('text/html')) return false

  const text = data.getData('text/plain')
  if (!looksLikeMarkdown(text) || editor.state.selection.$from.parent.type.spec.code) return false

  editor.chain().focus().insertContent(markdownToBlocks(text)).run()

  return true
}

// Empty but laid out, PeerCarets reads its place
const caretAnchor = (): HTMLElement => document.createElement('span')

/**
 * Browser extensions of the page editor, bound to its shared document
 * @param {SharedDoc} shared - Document and carets
 * @param {{ name: string, image: string | null, tint: number }} user - Who types here
 * @return {AnyExtension[]} - Extensions
 */

export const pageEditorExtensions = (
  shared: SharedDoc,
  user: { name: string; image: string | null; tint: number }
): AnyExtension[] => [
  Collaboration.configure({ document: shared.doc, field: PAGE_DOC_FIELD }),
  CollaborationCaret.configure({
    provider: shared.provider,
    user,
    render: caretAnchor,
    selectionRender: (peer) => ({
      class: 'collaboration-carets__selection',
      style: `${CARET_TINT}: ${tintColor(peer.tint)}`,
    }),
  }),
  ...pageSchemaExtensions().map((extension) => {
    if (extension.name === Callout.name)
      return Callout.extend({ addNodeView: () => ReactNodeViewRenderer(CalloutView) })
    if (extension.name === Subpage.name)
      return Subpage.extend({ addNodeView: () => ReactNodeViewRenderer(SubpageView) })

    return extension
  }),
  Placeholder.configure({
    placeholder: ({ node, editor }) => {
      if (node.type.name === 'heading') return PAGE_EDITOR_COPY.headingPlaceholder
      if (editor.isEmpty) return PAGE_EDITOR_COPY.placeholder

      return node.type.name === 'paragraph' ? PAGE_EDITOR_COPY.emptyPlaceholder : ''
    },
  }),
  PageKeys,
]
