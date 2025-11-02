export type FileTreeNode = {
  id: string
  name: string
  path: string[]
  type: 'file' | 'folder'
  parent?: FileTreeNode
  children: FileTreeNode[]
}
/**
 *   type: z.literal('match'),
  data: z.object({
    path: z.object({
      text: z.string(),
    }),
    lines: z.object({
      text: z.string(),
    }),
    line_number: z.number(),
    absolute_offset: z.number(),
    submatches: z.array(
      z.object({
        match: z.object({
          text: z.string(),
        }),
        start: z.number(),
        end: z.number(),
      })
    ),
  }),

 */
export type SearchResult = {
  path: {
    text: string
  }
  lines: {
    text: string
  }
  line_number: number
  absolute_offset: number
  submatches: Array<{
    match: {
      text: string
    }
    start: number
    end: number
  }>
}

export type FileTree = FileTreeNode[]

export interface ElectronAPI {
  getFileTree: () => FileTree
  getFile: (file: FileTreeNode) => Promise<string>
  writeFile: (file: FileTreeNode, contents: string) => Promise<void>
  createFile: (name: string, parent?: FileTreeNode) => Promise<FileTreeNode>
  createFolder: (name: string, parent?: FileTreeNode) => Promise<FileTreeNode>
  search: (query: string) => Promise<SearchResult[]>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
