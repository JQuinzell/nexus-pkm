import { contextBridge } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { FileTree, FileTreeNode } from '..'

const vaultPath = path.join(__dirname, '../../data')

function getFileTree(
  dirPath: string = vaultPath,
  parent?: FileTreeNode
): FileTree {
  const entries = fs.readdirSync(dirPath)

  const tree: FileTree = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry)
    const stats = fs.statSync(fullPath)
    const type = stats.isDirectory() ? 'folder' : 'file'
    const node: FileTreeNode = {
      id: fullPath,
      name: entry,
      type,
      children: [],
      parent,
    }
    if (type === 'folder') {
      const subTrees = getFileTree(fullPath, node)
      node.children = subTrees
    }
    tree.push(node)
  }

  return tree
}

contextBridge.exposeInMainWorld('api', {
  getFileTree,
})
