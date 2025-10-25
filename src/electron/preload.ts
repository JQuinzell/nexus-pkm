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

  const tree: FileTree = entries.map((entry) => {
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
    return node
  })

  return tree
}

async function getFile(file: FileTreeNode) {
  const contents = await fs.promises.readFile(file.id)
  return contents.toString()
}

contextBridge.exposeInMainWorld('api', {
  getFileTree,
  getFile,
})
