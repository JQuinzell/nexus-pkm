import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { FileTree } from './FileTree'

const FileTreeContext = createContext<FileTree>([])

export function useFileTree() {
  const context = useContext(FileTreeContext)

  return context
}

export function FileTreeProvider({ children }: PropsWithChildren) {
  const [value, setValue] = useState<FileTree>([])

  useEffect(() => {
    const tree = window.api.getFileTree()
    setValue(tree)
  }, [])

  return (
    <FileTreeContext.Provider value={value}>
      {children}
    </FileTreeContext.Provider>
  )
}
