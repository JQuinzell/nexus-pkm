import type { MultilineElementTransformer } from '@lexical/markdown'
import {
  $applyNodeReplacement,
  $createTextNode,
  $getState,
  $setState,
  createState,
  ElementNode,
  type LexicalNode,
} from 'lexical'
import z from 'zod'

const propertySchema = z.record(z.string(), z.string())

export const propertyState = createState('front-matter-properties', {
  parse: (value) => {
    const parsed = propertySchema.safeParse(value)
    if (parsed.success) {
      return parsed.data
    } else {
      return {}
    }
  },
})

export class FrontMatterNode extends ElementNode {
  static getType(): string {
    return 'pkm-frontmatter'
  }

  static clone(node: FrontMatterNode) {
    return new FrontMatterNode(node.__key)
  }

  constructor(key?: string) {
    super(key)
  }

  createDOM(): HTMLElement {
    return document.createElement('div')
  }

  updateDOM(): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return true
  }

  canInsertTextBefore(): boolean {
    return true
  }

  getProperties() {
    const properties = $getState(this, propertyState)
    return properties
  }
}

export function $isFrontMatterNode(node: LexicalNode): node is FrontMatterNode {
  return node instanceof FrontMatterNode
}

export function $createFrontMatterNode(): FrontMatterNode {
  return $applyNodeReplacement(new FrontMatterNode())
}

const regex = /---/
export const FRONT_MATTER_TRANSFORMER: MultilineElementTransformer = {
  dependencies: [FrontMatterNode],
  export: (node) => {
    if (!$isFrontMatterNode(node)) {
      return null
    }
    return '---\n' + node.getTextContent() + '\n---\n'
  },
  regExpEnd: regex,
  regExpStart: regex,
  replace: (
    rootNode,
    children,
    startMatch,
    endMatch,
    linesInBetween,
    isImport
  ) => {
    const frontMatterNode = $createFrontMatterNode()
    const propertyValues = linesInBetween?.filter(Boolean) ?? []
    const properties = Object.fromEntries(
      propertyValues
        .map((str) => {
          const match = str.match(/^(.*?):(.*)$/)
          if (!match) {
            return null
          }
          const [, key, value] = match
          return [key, value] as const
        })
        .filter((val): val is [string, string] => !!val)
    )
    $setState(frontMatterNode, propertyState, properties)
    const textNode = $createTextNode(
      linesInBetween?.filter(Boolean).join('\n') ?? ''
    )
    frontMatterNode.append(textNode)
    rootNode.append(frontMatterNode)
  },
  type: 'multiline-element',
}
