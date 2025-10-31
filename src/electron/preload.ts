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

async function writeFile(file: FileTreeNode, contents: string) {
  await fs.promises.writeFile(file.id, contents)
}

async function createFile(
  name: string,
  parent?: FileTreeNode
): Promise<FileTreeNode> {
  const filePath = path.join(parent?.id ?? vaultPath, name)
  await fs.promises.writeFile(filePath, '')
  return {
    id: filePath,
    name,
    type: 'file',
    children: [],
    parent: undefined,
  }
}

async function createFolder(
  name: string,
  parent?: FileTreeNode
): Promise<FileTreeNode> {
  const folderPath = path.join(parent?.id ?? vaultPath, name)
  await fs.promises.mkdir(folderPath)
  return {
    id: folderPath,
    name,
    type: 'folder',
    children: [],
    parent: undefined,
  }
}

contextBridge.exposeInMainWorld('api', {
  getFileTree,
  getFile,
  writeFile,
  createFile,
  createFolder,
})
