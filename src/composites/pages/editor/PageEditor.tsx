'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import type { Editor } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'

import { BlockHandle } from '@/composites/pages/editor/BlockHandle'
import { insertSlashLineAfter } from '@/composites/pages/editor/blockMenu'
import { blockMenuItems, dividerMenuItems } from '@/composites/pages/editor/blockMenu'
import type { BlockCommandContext } from '@/composites/pages/editor/commands'
import { pageEditorExtensions, pasteMarkdown } from '@/composites/pages/editor/extensions'
import { PageFormatBar } from '@/composites/pages/editor/FormatBar'
import { LinkPopover } from '@/composites/pages/editor/LinkPopover'
import { MobileToolbar } from '@/composites/pages/editor/MobileToolbar'
import { PeerCarets } from '@/composites/pages/editor/PeerCarets'
import { PageSlashMenu } from '@/composites/pages/editor/SlashMenu'
import { useBlockTarget } from '@/composites/pages/editor/useBlockTarget'
import { useSlashMenu } from '@/composites/pages/editor/useSlashMenu'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'
import { PAGE_EDITOR_UI } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end/MenuManager'
import type { SharedDoc } from '@/core/lib/realtime/sharedDoc'
import { cn } from '@/utils/classnames'

export interface PageEditorProps {
  pageId: string
  shared: SharedDoc
  // Name and caret colour of this member
  user: { name: string; image: string | null; tint: number }
  editable: boolean
  onReady: (editor: Editor | null) => void
  uploadImage: (file: File) => Promise<string | null>
  createSubpage: () => Promise<string | null>
}

/**
 * Block editor of a private page
 * @param {PageEditorProps} props - Document, rights and gestures
 * @return {JSX.Element}
 */

export const PageEditor = ({
  pageId,
  shared,
  user,
  editable,
  onReady,
  uploadImage,
  createSubpage,
}: PageEditorProps) => {
  const isMobile = useIsMobileShell()
  const { openMenu } = useMenu()
  const copy = useCopy(PAGE_EDITOR_COPY.blockLinkCopied)
  const [frame, setFrame] = useState<HTMLDivElement | null>(null)
  const [isLinking, setLinking] = useState(false)
  const [, setTick] = useState(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const keyRef = useRef<(event: KeyboardEvent) => boolean>(() => false)
  const refreshRef = useRef<(current: Editor) => void>(() => undefined)
  const pasteRef = useRef<(event: ClipboardEvent) => boolean>(() => false)
  const extensions = useMemo(() => pageEditorExtensions(shared, user), [shared, user])

  const editor = useEditor(
    {
      extensions,
      editable,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          'aria-label': PAGE_EDITOR_COPY.label,
          role: 'textbox',
          'aria-multiline': 'true',
        },
        handleKeyDown: (_view, event) => keyRef.current(event),
        handlePaste: (_view, event) => pasteRef.current(event),
      },
      // Floating menus follow every change
      onTransaction: ({ editor: current }) => {
        refreshRef.current(current)
        setTick((tick) => tick + 1)
      },
    },
    [extensions]
  )

  const context: BlockCommandContext = {
    pickImage: () => fileInput.current?.click(),
    askLink: () => setLinking(true),
    createSubpage: () =>
      void createSubpage().then((id) => {
        if (id) editor?.chain().focus().insertSubpage(id).run()
      }),
  }
  const slash = useSlashMenu(editor, context)
  // Editor callbacks read the latest handlers
  useLayoutEffect(() => {
    keyRef.current = slash.onKey
    refreshRef.current = slash.refresh
    pasteRef.current = (event) => (editor ? pasteMarkdown(editor, event) : false)
  })

  useEffect(() => {
    onReady(editor)
    return () => onReady(null)
  }, [editor, onReady])

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  useBlockTarget(editor)

  const insertBelow = (blockId: string) => {
    if (editor) insertSlashLineAfter(editor, blockId)
  }

  // Right click on a divider
  const onDividerMenu = (event: MouseEvent<HTMLDivElement>) => {
    const target =
      event.target instanceof Element ? event.target.closest<HTMLElement>('hr[data-id]') : null
    if (!editor || !editable || !target?.dataset.id) return

    event.preventDefault()
    openMenu(
      dividerMenuItems({ editor, blockId: target.dataset.id, context, copyLink: () => undefined }),
      { x: event.clientX, y: event.clientY },
      PAGE_EDITOR_COPY.blockMenuTitle
    )
  }

  return (
    <>
      <div
        ref={setFrame}
        className={cn('page-editor', PAGE_EDITOR_UI.frame)}
        onContextMenu={onDividerMenu}
      >
        {editor && editable && !isMobile && (
          <BlockHandle
            editor={editor}
            frame={frame}
            onInsertBelow={insertBelow}
            onMenu={(blockId, origin) =>
              openMenu(
                blockMenuItems({
                  editor,
                  blockId,
                  context,
                  copyLink: (id) =>
                    void copy(`${window.location.origin}${ROUTES.pageBlock(pageId, id)}`),
                }),
                origin,
                undefined,
                true
              )
            }
          />
        )}
        <EditorContent editor={editor} />
        {editor && frame && (
          <PeerCarets editor={editor} awareness={shared.awareness} frame={frame} />
        )}
      </div>

      {editor && slash.menu && (
        <PageSlashMenu
          query={slash.menu.match.query}
          activeIndex={slash.menu.index}
          rect={slash.menu.rect}
          onPick={slash.pick}
          onHover={slash.hover}
        />
      )}
      {editor && editable && !isMobile && !slash.menu && !isLinking && editor.isFocused && (
        <PageFormatBar editor={editor} onLink={() => setLinking(true)} />
      )}
      {editor && isLinking && <LinkPopover editor={editor} onClose={() => setLinking(false)} />}
      {editor && editable && isMobile && editor.isFocused && (
        <MobileToolbar editor={editor} context={context} />
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          const src = file ? await uploadImage(file) : null
          if (src) editor?.chain().focus().setImage({ src, alt: PAGE_EDITOR_COPY.imageAlt }).run()
        }}
      />
    </>
  )
}
