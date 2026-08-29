import React from 'react'
import { serializeLexical } from './serialize'
import { NodeTypes } from './serialize'

type Props = {
  content: {
    root: {
      children: NodeTypes[]
    }
  }
  className?: string
}

const RichText: React.FC<Props> = ({ content, className }) => {
  if (!content?.root?.children) {
    return null
  }

  return (
    <div className={`prose prose-lg max-w-none prose-slate ${className || ''}`}>
      {serializeLexical(content.root.children)}
    </div>
  )
}

export default RichText
