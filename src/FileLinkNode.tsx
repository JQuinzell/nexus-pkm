import type { TextMatchTransformer } from '@lexical/markdown'
import {
  $applyNodeReplacement,
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical'
import type { JSXElementConstructor, ReactElement } from 'react'
import { FileLink } from './FileLink'

export class FileLinkNode extends DecoratorNode<ReactElement> {
  fileName: string

  static getType(): string {
    return 'pkm-file-link'
  }

  static clone(node: FileLinkNode) {
    return new FileLinkNode(node.fileName, node.__key)
  }

  // TODO: implement the rest of the methods or figure out how to use $config and NodeState

  constructor(text: string, key?: string) {
    super(key)
    this.fileName = text
  }

  createDOM(): HTMLElement {
    return document.createElement('span')
  }

  updateDOM(): boolean {
    return false
  }

  decorate() {
    return <FileLink fileId={this.fileName} />
  }
}

function $isFileLinkNode(node: LexicalNode): node is FileLinkNode {
  return node instanceof FileLinkNode
}

export function $createFileLinkNode(text: string): FileLinkNode {
  return $applyNodeReplacement(new FileLinkNode(text))
}

const fileLinkRegex = /\[\[(.*)\]\]/
export const FILE_LINK_TRANSFORMER: TextMatchTransformer = {
  dependencies: [FileLinkNode],
  export: (node, exportChildren) => {
    if (!$isFileLinkNode(node)) {
      return null
    }
    return `[[${node.fileName}]]`
  },
  regExp: fileLinkRegex,
  importRegExp: fileLinkRegex,
  replace: (textNode, match) => {
    const [, text] = match

    const node = $createFileLinkNode(text)
    textNode.replace(node)

    // TODO: how do I fix this type error
    return node as any
  },
  type: 'text-match',
}
