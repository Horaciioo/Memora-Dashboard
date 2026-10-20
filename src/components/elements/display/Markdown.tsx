import { Fragment } from 'react'
import { parseMarkdown } from '@/core/lib/markdown'
import type { BlockNode, InlineNode } from '@/core/lib/markdown'
import { COMMENT_THREAD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { splitMentions } from '@/utils/format/mentions'

/**
 * Render inline nodes as React elements
 * @param {InlineNode[]} nodes - Inline nodes
 * @param {boolean} [lit] - Lights up the members a text names
 * @return {JSX.Element[]} - Rendered nodes
 */

const renderInline = (nodes: InlineNode[], lit = false) =>
  nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return lit ? (
          <Fragment key={index}>
            {splitMentions(node.value).map((piece, at) =>
              piece.isMention ? (
                <mark key={at} className={COMMENT_THREAD.mention}>
                  {piece.text}
                </mark>
              ) : (
                piece.text
              )
            )}
          </Fragment>
        ) : (
          <Fragment key={index}>{node.value}</Fragment>
        )
      case 'break':
        return <br key={index} />
      case 'code':
        return <code key={index}>{node.value}</code>
      case 'bold':
        return <strong key={index}>{renderInline(node.children, lit)}</strong>
      case 'italic':
        return <em key={index}>{renderInline(node.children, lit)}</em>
      case 'underline':
        return <u key={index}>{renderInline(node.children, lit)}</u>
      case 'strike':
        return <s key={index}>{renderInline(node.children, lit)}</s>
      case 'spoiler':
        return (
          <span key={index} className="spoiler" tabIndex={0}>
            {renderInline(node.children, lit)}
          </span>
        )
      case 'link':
        return (
          <a key={index} href={node.href} target="_blank" rel="noreferrer noopener">
            {renderInline(node.children, lit)}
          </a>
        )
    }
  })

/**
 * Render one block node
 * @param {BlockNode} block - Block node
 * @param {number} index - Position in the document
 * @param {boolean} [lit] - Lights up the members a text names
 * @return {JSX.Element} - Rendered block
 */

const renderBlock = (block: BlockNode, index: number, lit = false) => {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3'
      return <Tag key={index}>{renderInline(block.children, lit)}</Tag>
    }
    case 'quote':
      return <blockquote key={index}>{renderInline(block.children, lit)}</blockquote>
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, lit)}</li>
          ))}
        </Tag>
      )
    }
    case 'code':
      return (
        <pre key={index}>
          <code>{block.value}</code>
        </pre>
      )
    case 'rule':
      return <hr key={index} />
    case 'paragraph':
      return <p key={index}>{renderInline(block.children, lit)}</p>
  }
}

export interface MarkdownProps {
  source: string
  className?: string
  // Lights up the members the text names
  mentions?: boolean
}

/**
 * Render Discord flavoured markdown without injecting raw HTML
 * @param {string} source - Raw markdown
 * @param {string} [className] - Extra classes merged onto the wrapper
 * @param {boolean} [mentions] - Lights up the members the text names
 * @return {JSX.Element}
 */

export const Markdown = ({ source, className, mentions }: MarkdownProps) => (
  <div className={cn('markdown-body', className)}>
    {parseMarkdown(source).map((block, index) => renderBlock(block, index, mentions))}
  </div>
)
