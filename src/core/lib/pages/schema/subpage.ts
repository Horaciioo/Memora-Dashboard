import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    subpage: {
      // Link block to a child page
      insertSubpage: (pageId: string) => ReturnType
    }
  }
}

/**
 * Link block to a child page
 * @type {Node}
 */

export const Subpage = Node.create({
  name: 'subpage',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      pageId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-page-id'),
        renderHTML: (attributes) => ({ 'data-page-id': attributes.pageId as string | null }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-subpage]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-subpage': '' })]
  },

  addCommands() {
    return {
      insertSubpage:
        (pageId) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { pageId } }),
    }
  },
})
