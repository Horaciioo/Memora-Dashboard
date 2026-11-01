import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Default glyph of a callout
 * @type {string}
 */

export const CALLOUT_ICON = '💡'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      // Wrap selection in a callout
      setCallout: () => ReturnType
    }
  }
}

/**
 * Highlighted box holding blocks
 * @type {Node}
 */

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      icon: {
        default: CALLOUT_ICON,
        parseHTML: (element) => element.getAttribute('data-icon') ?? CALLOUT_ICON,
        renderHTML: (attributes) => ({ 'data-icon': attributes.icon as string }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'aside[data-callout]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['aside', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0]
  },

  addCommands() {
    return {
      setCallout:
        () =>
        ({ commands }) =>
          commands.wrapIn(this.name),
    }
  },
})
