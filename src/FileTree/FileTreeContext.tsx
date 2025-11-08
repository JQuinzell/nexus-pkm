import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { FileMetadata, FileTree, FileTreeNode } from '..'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown'
import { FILE_LINK_TRANSFORMER, FileLinkNode } from '@/FileLinkNode'
import { $getRoot, createEditor, type LexicalEditor } from 'lexical'
import { LinkNode } from '@lexical/link'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeNode } from '@lexical/code'
import {
  $isFrontMatterNode,
  FRONT_MATTER_TRANSFORMER,
  FrontMatterNode,
} from '@/FrontMatterNode'

export type FileTreeContextValue = {
  tree: FileTree
  selectedFile: FileTreeNode | null
  setSelectedFile: (file: FileTreeNode) => void
  fileMap: Map<string, FileTreeNode>
  createFile: (parent?: FileTreeNode) => void
  createFolder: (parent?: FileTreeNode) => void
  tabs: FileTreeNode[]
  addTab: (file: FileTreeNode) => void
  removeTab: (file: FileTreeNode) => void
  openFile: (file: FileTreeNode) => void
}

const FileTreeContext = createContext<FileTreeContextValue | null>(null)

export function useFileTree() {
  const context = useContext(FileTreeContext)

  if (!context) {
    throw new Error('useFileTree must be used within a FileTreeProvider')
  }

  return context
}

function generateUniqueName(
  fileMap: Map<string, FileTreeNode>,
  getName: (i: number) => string
) {
  let i = 1
  let newName = getName(i)

  while (fileMap.has(newName)) {
    i++
    newName = getName(i)
  }

  return newName
}

// TODO don't really like this algorithm I could probably use the path to be a bit more efficient but it works
function addNode(
  nodes: FileTreeNode[],
  parent: FileTreeNode,
  childNode: FileTreeNode
): FileTreeNode[] {
  return nodes.map((node) => {
    if (node.id === parent.id) {
      return {
        ...node,
        children: [...node.children, childNode],
      }
    }

    if (node.children.length > 0) {
      return {
        ...node,
        children: addNode(node.children, parent, childNode),
      }
    }

    return node
  })
}

async function createMetadataIndex(tree: FileTree, editor: LexicalEditor) {
  const metadataMap: FileMetadata = {}
  async function parseNode(node: FileTreeNode) {
    if (node.type === 'file') {
      const contents = await window.api.getFile(node)
      editor.update(() => {
        $convertFromMarkdownString(contents, [
          ...TRANSFORMERS,
          FILE_LINK_TRANSFORMER,
          FRONT_MATTER_TRANSFORMER,
        ])
        const root = $getRoot()
        const frontMatter = root.getChildren().find($isFrontMatterNode)
        if (frontMatter) {
          metadataMap[node.path.concat(node.name).join('/')] = {
            properties: frontMatter.getProperties(),
          }
        }
      })
    } else {
      await Promise.all(node.children.map(parseNode))
    }
  }

  await Promise.all(tree.map(parseNode))
  await window.api.createMetadataIndex(metadataMap)
}

export function FileTreeProvider({ children }: PropsWithChildren) {
  const [tree, setTree] = useState<FileTree>([])
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null)
  const [tabs, setTabs] = useState<FileTreeNode[]>([])

  function addTab(file: FileTreeNode) {
    setTabs((tabs) => [...tabs, file])
  }

  function removeTab(file: FileTreeNode) {
    setTabs((tabs) => tabs.filter((tab) => tab.id !== file.id))
  }

  function flattenFiles(node: FileTreeNode): FileTreeNode[] {
    const allChildren = node.children.flatMap((child) => flattenFiles(child))
    return [node, ...allChildren]
  }

  const files = tree.flatMap(flattenFiles)

  const fileMap = new Map<string, FileTreeNode>(
    files.map((node) => [node.name, node])
  )

  useEffect(() => {
    const tree = window.api.getFileTree()
    setTree(tree)
    const editor = createEditor({
      namespace: 'nexus-pkm-index-editor',
      onError: console.error,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        LinkNode,
        FileLinkNode,
        FrontMatterNode,
      ],
    })
    createMetadataIndex(tree, editor)
  }, [])

  async function createFile(parent?: FileTreeNode) {
    const name = generateUniqueName(fileMap, (i) => `Untitled ${i}.md`)
    const node = await window.api.createFile(name, parent)
    if (parent) {
      setTree(addNode(tree, parent, node))
    } else {
      setTree([...tree, node])
    }
  }

  async function createFolder(parent?: FileTreeNode) {
    const name = generateUniqueName(fileMap, (i) => `folder ${i}`)
    const node = await window.api.createFolder(name, parent)
    if (parent) {
      setTree(addNode(tree, parent, node))
    } else {
      setTree([...tree, node])
    }
  }

  function openFile(file: FileTreeNode) {
    setSelectedFile(file)
    if (!tabs.find((tab) => tab.id === file.id)) {
      addTab(file)
    }
  }

  const value = {
    tree,
    selectedFile,
    setSelectedFile,
    fileMap,
    createFile,
    createFolder,
    tabs,
    addTab,
    removeTab,
    openFile,
  }

  return (
    <FileTreeContext.Provider value={value}>
      {children}
    </FileTreeContext.Provider>
  )
}

export function useFileContents(file: FileTreeNode | null) {
  const [editor] = useLexicalComposerContext()
  const [fileContents, setFileContents] = useState<string | null>(null)
  const { selectedFile } = useFileTree()

  useEffect(() => {
    if (!selectedFile) {
      setFileContents(null)
      return
    }

    window.api.getFile(selectedFile).then((contents) => {
      editor.update(() => {
        $convertFromMarkdownString(contents, [
          ...TRANSFORMERS,
          FILE_LINK_TRANSFORMER,
          FRONT_MATTER_TRANSFORMER,
        ])
      })
    })
  }, [file])

  useEffect(() => {
    if (!selectedFile) return
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        window.api.writeFile(
          selectedFile,
          $convertToMarkdownString([
            ...TRANSFORMERS,
            FILE_LINK_TRANSFORMER,
            FRONT_MATTER_TRANSFORMER,
          ])
        )
      })
    })
  }, [editor, selectedFile])

  return fileContents
}
