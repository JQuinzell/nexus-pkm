export type FileTreeNode = {
  id: string
  name: string
  type: 'file' | 'folder'
  parent?: FileTreeNode
  children: FileTreeNode[]
}
export type FileTree = FileTreeNode[]

export interface ElectronAPI {
  getFileTree: () => FileTree
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
