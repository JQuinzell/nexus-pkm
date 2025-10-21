import { createContext, useContext, type PropsWithChildren } from 'react'

type FileTreeItem = string | [string, ...FileTreeItem[]]
type FileTree = FileTreeItem[]

const data: FileTree = [
  [
    'app',
    [
      'api',
      ['hello', ['route.ts']],
      'page.tsx',
      'layout.tsx',
      ['blog', ['page.tsx']],
    ],
  ],
  ['components', ['ui', 'button.tsx', 'card.tsx'], 'header.tsx', 'footer.tsx'],
  ['lib', ['util.ts']],
  ['public', 'favicon.ico', 'vercel.svg'],
  '.eslintrc.json',
  '.gitignore',
  'next.config.js',
  'tailwind.config.js',
  'package.json',
  'README.md',
]

const FileTreeContext = createContext<FileTree>([])

export function useFileTree() {
  const context = useContext(FileTreeContext)

  return context
}

export function FileTreeProvider({ children }: PropsWithChildren) {
  return (
    <FileTreeContext.Provider value={data}>{children}</FileTreeContext.Provider>
  )
}
