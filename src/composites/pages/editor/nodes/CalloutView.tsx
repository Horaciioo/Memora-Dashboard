'use client'

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import type { ReactNodeViewProps } from '@tiptap/react'

import { CALLOUT_ICONS } from '@/declarations/pages/blocks'
import { PAGE_BLOCK_STYLES } from '@/declarations/ui/variants'

/**
 * Callout box, its glyph cycles on click
 * @param {ReactNodeViewProps} props - Node view props
 * @return {JSX.Element}
 */

export const CalloutView = ({ node, updateAttributes, editor }: ReactNodeViewProps) => {
  const icon = String(node.attrs.icon ?? CALLOUT_ICONS[0])
  const next = CALLOUT_ICONS[(CALLOUT_ICONS.indexOf(icon) + 1) % CALLOUT_ICONS.length] ?? icon

  return (
    <NodeViewWrapper as="aside" data-callout="" className={PAGE_BLOCK_STYLES.callout}>
      <button
        type="button"
        contentEditable={false}
        disabled={!editor.isEditable}
        className={PAGE_BLOCK_STYLES.calloutIcon}
        onClick={() => updateAttributes({ icon: next })}
        aria-hidden="true"
        tabIndex={-1}
      >
        {icon}
      </button>
      <NodeViewContent className={PAGE_BLOCK_STYLES.calloutBody} />
    </NodeViewWrapper>
  )
}
