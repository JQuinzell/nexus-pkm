import { contextBridge } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

// TOD: how can I bridge the types between these projects? Right now I'm just redeclaring to avoid build issues
type FileTreeItem = string | [string, ...FileTreeItem[]]
type FileTree = FileTreeItem[]

const vaultPath = path.join(__dirname, '../../data')

function getFileTree(dirPath: string = vaultPath): FileTree {
  // Read all items in the current directory
  const entries = fs.readdirSync(dirPath)

  const tree: FileTree = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry)
    const stats = fs.statSync(fullPath)

    if (stats.isDirectory()) {
      const subTree = getFileTree(fullPath)
      tree.push([entry, ...subTree])
    } else {
      tree.push(entry)
    }
  }

  return tree
}

contextBridge.exposeInMainWorld('api', {
  getFileTree,
})
