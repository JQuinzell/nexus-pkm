import { contextBridge, ipcRenderer } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { FileMetadata, FileTree, FileTreeNode } from '..'

const vaultPath = path.join(__dirname, '../../data')

function getFileTree(
  dirPath: string = vaultPath,
  parent?: FileTreeNode
): FileTree {
  const entries = fs.readdirSync(dirPath)

  const tree: FileTree = entries
    .map((entry) => {
      if (entry.startsWith('.')) return
      const fullPath = path.join(dirPath, entry)
      const stats = fs.statSync(fullPath)
      const type = stats.isDirectory() ? 'folder' : 'file'
      const subPath = path
        .relative(vaultPath, dirPath)
        .split(path.sep)
        .filter(Boolean)
      const node: FileTreeNode = {
        id: fullPath,
        name: entry,
        path: subPath,
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
    .filter((node) => !!node)

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
  const subPath = path
    .relative(vaultPath, parent?.id ?? vaultPath)
    .split(path.sep)
    .filter(Boolean)
  await fs.promises.writeFile(filePath, '')
  return {
    id: filePath,
    name,
    path: subPath,
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
  const subPath = path
    .relative(vaultPath, parent?.id ?? vaultPath)
    .split(path.sep)
    .filter(Boolean)

  await fs.promises.mkdir(folderPath)
  return {
    id: folderPath,
    name,
    path: subPath,
    type: 'folder',
    children: [],
    parent: undefined,
  }
}

async function createMetadataIndex(metadata: FileMetadata) {
  fs.promises.writeFile(
    path.join(vaultPath, '.metadata'),
    JSON.stringify(metadata)
  )
}

function search(query: string) {
  return ipcRenderer.invoke('search', query)
}

contextBridge.exposeInMainWorld('api', {
  getFileTree,
  getFile,
  writeFile,
  createFile,
  createFolder,
  search,
  createMetadataIndex,
})
