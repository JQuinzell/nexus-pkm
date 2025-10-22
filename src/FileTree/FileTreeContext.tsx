import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { FileTree, FileTreeNode } from '..'

export type FileTreeContextValue = {
  tree: FileTree
  selectedFile: FileTreeNode | null
  setSelectedFile: (file: FileTreeNode) => void
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

  useEffect(() => {
    const tree = window.api.getFileTree()
    setTree(tree)
  }, [])

  const value = {
    tree,
    selectedFile,
    setSelectedFile,
  }

  return (
    <FileTreeContext.Provider value={value}>
      {children}
    </FileTreeContext.Provider>
  )
}
