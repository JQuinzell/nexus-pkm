import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { FileTree } from '..'

export type FileTreeContextValue = {
  tree: FileTree
  selectedFilePath: string[] | null
}

const FileTreeContext = createContext<FileTreeContextValue>({
  tree: [],
  selectedFilePath: null,
})

export function useFileTree() {
  const context = useContext(FileTreeContext)

  return context
}

export function FileTreeProvider({ children }: PropsWithChildren) {
  const [tree, setTree] = useState<FileTree>([])

  useEffect(() => {
    const tree = window.api.getFileTree()
    setTree(tree)
  }, [])

  const value = {
    tree,
    selectedFilePath: null,
  }

  return (
    <FileTreeContext.Provider value={value}>
      {children}
    </FileTreeContext.Provider>
  )
}
