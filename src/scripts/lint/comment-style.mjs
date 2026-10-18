const TAG_PATTERN = /@(param|return|returns|type|typedef|property)\b/
const SEPARATOR_PATTERN = /^\s*[=\-*_]{4,}\s*$/

const isDecorative = (value) => SEPARATOR_PATTERN.test(value.trim())
const isJsDocBlock = (comment) => comment.type === 'Block' && comment.value.startsWith('*')

const commentStyle = {
  rules: {
    'no-decorative-separators': {
      meta: {
        type: 'problem',
        schema: [],
        messages: { decorative: 'Decorative comment separators are banned.' },
      },
      create(context) {
        return {
          Program() {
            const sourceCode = context.sourceCode ?? context.getSourceCode()

            for (const comment of sourceCode.getAllComments()) {
              if (isDecorative(comment.value))
                context.report({ loc: comment.loc, messageId: 'decorative' })
            }
          },
        }
      },
    },
    'jsdoc-structure': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          tagless: 'JSDoc block needs @param, @return, @type or @typedef, or use // instead.',
          stacked: 'Never combine a JSDoc block with a // comment on the same declaration.',
          noBlankLine: 'Leave one blank line between a JSDoc block and its declaration.',
        },
      },
      create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode()

        return {
          Program() {
            for (const comment of sourceCode.getAllComments()) {
              if (!isJsDocBlock(comment)) continue

              if (!TAG_PATTERN.test(comment.value)) {
                context.report({ loc: comment.loc, messageId: 'tagless' })
                continue
              }

              const next = sourceCode.getTokenAfter(comment, { includeComments: true })
              if (!next) continue

              if (next.type === 'Line') {
                context.report({ loc: next.loc, messageId: 'stacked' })
                continue
              }

              if (next.loc.start.line - comment.loc.end.line < 2) {
                context.report({ loc: comment.loc, messageId: 'noBlankLine' })
              }
            }
          },
        }
      },
    },
  },
}

export default commentStyle
