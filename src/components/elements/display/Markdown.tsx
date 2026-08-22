import { Fragment } from 'react'
import { parseMarkdown } from '@/core/lib/markdown'
import type { BlockNode, InlineNode } from '@/core/lib/markdown'
import { cn } from '@/utils/classnames'

/**
 * Render inline nodes as React elements
 * @param {InlineNode[]} nodes - Inline nodes
 * @return {JSX.Element[]} - Rendered nodes
 */

const renderInline = (nodes: InlineNode[]) =>
  nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return <Fragment key={index}>{node.value}</Fragment>
      case 'break':
        return <br key={index} />
      case 'code':
        return <code key={index}>{node.value}</code>
      case 'bold':
        return <strong key={index}>{renderInline(node.children)}</strong>
      case 'italic':
        return <em key={index}>{renderInline(node.children)}</em>
      case 'underline':
        return <u key={index}>{renderInline(node.children)}</u>
      case 'strike':
        return <s key={index}>{renderInline(node.children)}</s>
      case 'spoiler':
        return (
          <span key={index} className="spoiler" tabIndex={0}>
            {renderInline(node.children)}
          </span>
        )
      case 'link':
        return (
          <a key={index} href={node.href} target="_blank" rel="noreferrer noopener">
            {renderInline(node.children)}
          </a>
        )
    }
  })

/**
 * Render one block node
 * @param {BlockNode} block - Block node
 * @param {number} index - Position in the document
 * @return {JSX.Element} - Rendered block
 */

const renderBlock = (block: BlockNode, index: number) => {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3'
      return <Tag key={index}>{renderInline(block.children)}</Tag>
    }
    case 'quote':
      return <blockquote key={index}>{renderInline(block.children)}</blockquote>
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
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
      return <p key={index}>{renderInline(block.children)}</p>
  }
}

export interface MarkdownProps {
  source: string
  className?: string
}

/**
 * Render Discord flavoured markdown without injecting raw HTML
 * @param {string} source - Raw markdown
 * @param {string} [className] - Extra classes merged onto the wrapper
 * @return {JSX.Element}
 */

export const Markdown = ({ source, className }: MarkdownProps) => (
  <div className={cn('markdown-body', className)}>{parseMarkdown(source).map(renderBlock)}</div>
)
