import type { FileTree } from './FileTree/FileTree'

export interface ElectronAPI {
  getFileTree: () => FileTree
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
