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
}

const FileTreeContext = createContext<FileTreeContextValue | null>(null)

export function useFileTree() {
  const context = useContext(FileTreeContext)

  if (!context) {
    throw new Error('useFileTree must be used within a FileTreeProvider')
  }

  return context
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

  const value = {
    tree,
    selectedFile,
    setSelectedFile,
    fileMap,
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
