import Link from 'next/link'
import type { ReactNode } from 'react'

import type { RichTextNode } from '@/lib/brain2/lesson-contract'
import { isExternalLessonHref, isInternalLessonHref } from '@/lib/brain2/lesson-hrefs'

export function Brain2SafeLink({ href, children }: { href: string; children: ReactNode }) {
  if (isExternalLessonHref(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  }
  if (isInternalLessonHref(href)) return <Link href={href}>{children}</Link>
  throw new Error(`Unsafe Brain2 lesson href: ${href}`)
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  switch (node.type) {
    case 'text':
      return node.value
    case 'break':
      return <br key={key} />
    case 'strong':
      return <strong key={key}>{renderNodes(node.children, key)}</strong>
    case 'em':
      return <em key={key}>{renderNodes(node.children, key)}</em>
    case 'code':
      return <code key={key}>{renderNodes(node.children, key)}</code>
    case 'link': {
      const children = renderNodes(node.children, key)
      return <Brain2SafeLink key={key} href={node.href}>{children}</Brain2SafeLink>
    }
    default: {
      const unreachable: never = node
      throw new Error(`Unknown Brain2 rich-text node: ${JSON.stringify(unreachable)}`)
    }
  }
}

function renderNodes(nodes: RichTextNode[], prefix: string) {
  return nodes.map((node, index) => renderNode(node, `${prefix}-${index}`))
}

export default function Brain2RichText({ nodes }: { nodes: RichTextNode[] }) {
  return <>{renderNodes(nodes, 'rich')}</>
}
