export type FileTreeNode = {
  id: string
  name: string
  path: string[]
  type: 'file' | 'folder'
  parent?: FileTreeNode
  children: FileTreeNode[]
}
export type FileTree = FileTreeNode[]

export interface ElectronAPI {
  getFileTree: () => FileTree
  getFile: (file: FileTreeNode) => Promise<string>
  writeFile: (file: FileTreeNode, contents: string) => Promise<void>
  createFile: (name: string, parent?: FileTreeNode) => Promise<FileTreeNode>
  createFolder: (name: string, parent?: FileTreeNode) => Promise<FileTreeNode>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
