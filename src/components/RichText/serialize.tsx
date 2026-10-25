import React, { Fragment, JSX } from 'react'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedTextNode,
  SerializedHeadingNode,
  SerializedListNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import { IS_BOLD, IS_ITALIC, IS_STRIKETHROUGH, IS_UNDERLINE, IS_CODE } from './nodeTypes'
import { SmartText } from '../SmartText'

export type NodeTypes = DefaultNodeTypes | SerializedBlockNode

/**
 * Converts a Lexical element-level `format` to a CSS `text-align` value.
 * Payload Lexical can store format as a STRING ("justify") or a NUMBER (4).
 */
const getTextAlign = (format?: string | number): React.CSSProperties | undefined => {
  if (!format && format !== 0) return undefined

  // Handle string values (e.g. "justify", "center", "right", "left", "start", "end")
  if (typeof format === 'string') {
    const validAligns = ['left', 'center', 'right', 'justify', 'start', 'end']
    if (validAligns.includes(format)) {
      // Convert absolute alignments to logical alignments for automatic RTL support
      let logicalAlign = format
      if (format === 'left') logicalAlign = 'start'
      if (format === 'right') logicalAlign = 'end'
      
      const style: React.CSSProperties = { textAlign: logicalAlign as React.CSSProperties['textAlign'] }
      return style
    }
    return undefined
  }

  // Handle number values (Lexical bitmask: 1=left/start, 2=center, 3=right/end, 4=justify)
  if (typeof format === 'number' && format > 0) {
    const alignMap: Record<number, React.CSSProperties['textAlign']> = {
      1: 'start', // Replaces left
      2: 'center',
      3: 'end',   // Replaces right
      4: 'justify',
      5: 'end',
    }
    const align = alignMap[format]
    if (align) {
      const style: React.CSSProperties = { textAlign: align }
      return style
    }
  }

  return undefined
}

/**
 * Guards against javascript:/data:/vbscript: URLs in CMS-authored link nodes.
 * Lexical's own link feature UI doesn't restrict the scheme an editor can type
 * into the URL field, and this function had no live call site in the app at
 * all until the News/Events article body was wired up to it (see UX-1) -- so
 * this is the first time a real visitor's browser ever evaluates one of these
 * hrefs. React doesn't sanitize `href` the way it sanitizes
 * dangerouslySetInnerHTML, so an editor (or a compromised editor account)
 * pasting `javascript:...` into a link would otherwise render as a clickable,
 * script-executing anchor. Allows relative paths, fragments, and the handful
 * of schemes real content links use; anything else falls back to a harmless
 * "#" rather than rendering the raw value.
 */
const sanitizeHref = (url: string | undefined | null): string => {
  if (!url) return '#'
  const trimmed = url.trim()
  // Relative paths, hash anchors, and protocol-relative URLs are always safe.
  if (/^(\/|#|\.\.?\/)/.test(trimmed)) return trimmed
  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed)
  if (!schemeMatch) return trimmed // no scheme at all, e.g. "example.com"
  const scheme = schemeMatch[1].toLowerCase()
  const allowedSchemes = new Set(['http', 'https', 'mailto', 'tel'])
  return allowedSchemes.has(scheme) ? trimmed : '#'
}

/**
 * Builds a combined style object from a Lexical element node's format & indent.
 */
const getElementStyle = (node: Record<string, unknown>): React.CSSProperties | undefined => {
  const style: React.CSSProperties = {}
  let hasStyle = false

  // Text alignment — handle both string and number format values
  const align = getTextAlign(node.format as string | number | undefined)
  if (align) {
    Object.assign(style, align)
    hasStyle = true
  }

  // Indentation
  const indent = node.indent as number | undefined
  if (indent && indent > 0) {
    style.paddingInlineStart = `${indent * 2}rem`
    hasStyle = true
  }

  return hasStyle ? style : undefined
}

export const serializeLexical = (nodes: NodeTypes[]): JSX.Element[] => {
  if (!nodes) return []

  return nodes.map((node, index): JSX.Element => {
    if (node.type === 'text') {
      const textNode = node as SerializedTextNode
      let text: React.ReactNode = <SmartText text={textNode.text} />

      if (textNode.format & IS_BOLD) {
        text = <strong key="bold">{text}</strong>
      }
      if (textNode.format & IS_ITALIC) {
        text = <em key="italic">{text}</em>
      }
      if (textNode.format & IS_UNDERLINE) {
        text = (
          <span key="underline" style={{ textDecoration: 'underline' }}>
            {text}
          </span>
        )
      }
      if (textNode.format & IS_STRIKETHROUGH) {
        text = (
          <span key="strikethrough" style={{ textDecoration: 'line-through' }}>
            {text}
          </span>
        )
      }
      if (textNode.format & IS_CODE) {
        text = <code key="code">{text}</code>
      }

      return <Fragment key={index}>{text}</Fragment>
    }

    // Handle linebreak nodes — preserves Enter / Shift+Enter from admin
    if (node.type === 'linebreak') {
      return <br key={index} />
    }

    if (!node) {
      return <Fragment key={index} />
    }

    // Safely check for children as some nodes (like horizontalrule) don't have them
    const children =
      'children' in node && Array.isArray(node.children)
        ? serializeLexical(node.children as NodeTypes[])
        : []

    // Cast once so we can read format / indent from any element-level node
    const elementNode = node as unknown as Record<string, unknown>
    const style = getElementStyle(elementNode)

    switch (node.type) {
      case 'heading': {
        const headingNode = node as SerializedHeadingNode
        const Tag = headingNode.tag as keyof JSX.IntrinsicElements
        return (
          <Tag key={index} className={`heading-${headingNode.tag}`} style={style}>
            {children}
          </Tag>
        )
      }
      case 'list': {
        const listNode = node as SerializedListNode
        const ListTag = listNode.listType === 'bullet' ? 'ul' : 'ol'
        return (
          <ListTag key={index} className="list-default" style={style}>
            {children}
          </ListTag>
        )
      }
      case 'listitem':
        return (
          <li key={index} style={style}>
            {children}
          </li>
        )
      case 'quote':
        return (
          <blockquote key={index} style={style}>
            {children}
          </blockquote>
        )
      case 'link': {
        const linkNode = node as SerializedLinkNode
        return (
          <a
            key={index}
            href={sanitizeHref(linkNode.fields?.url)}
            target={linkNode.fields?.newTab ? '_blank' : undefined}
            rel={linkNode.fields?.newTab ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        )
      }
      case 'horizontalrule':
        return <hr key={index} />
      case 'paragraph': {
        // Empty paragraphs (user pressed Enter for spacing) need a <br> to not collapse
        const isEmpty = children.length === 0
        return (
          <p key={index} style={style}>
            {isEmpty ? <br /> : children}
          </p>
        )
      }
      default:
        return <Fragment key={index}>{children}</Fragment>
    }
  })
}
