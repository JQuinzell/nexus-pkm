import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { FileTree, FileTreeNode } from '..'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  ELEMENT_TRANSFORMERS,
  HEADING,
  TEXT_FORMAT_TRANSFORMERS,
  TRANSFORMERS,
} from '@lexical/markdown'
import { FILE_LINK_TRANSFORMER } from '@/FileLinkNode'

export type FileTreeContextValue = {
  tree: FileTree
  selectedFile: FileTreeNode | null
  setSelectedFile: (file: FileTreeNode) => void
  fileMap: Map<string, FileTreeNode>
  createFile: (parent?: FileTreeNode) => void
  createFolder: (parent?: FileTreeNode) => void
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

export function FileTreeProvider({ children }: PropsWithChildren) {
  const [tree, setTree] = useState<FileTree>([])
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null)

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

  const value = {
    tree,
    selectedFile,
    setSelectedFile,
    fileMap,
    createFile,
    createFolder,
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
          $convertToMarkdownString([...TRANSFORMERS, FILE_LINK_TRANSFORMER])
        )
      })
    })
  }, [editor, selectedFile])

  return fileContents
}
