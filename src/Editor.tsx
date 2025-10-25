import {
  type InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import EditorTheme from './EditorTheme'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useEffect, type PropsWithChildren } from 'react'
import { useFileContents, useFileTree } from './FileTree/FileTreeContext'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
function onError(error: unknown) {
  console.error(error)
}

export function EditorProvider({ children }: PropsWithChildren) {
  const initialConfig: InitialConfigType = {
    namespace: 'nexus-pkm-editor',
    onError,
    theme: EditorTheme,
    nodes: [HeadingNode, QuoteNode],
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>{children}</LexicalComposer>
  )
}

export function Editor() {
  const { selectedFile } = useFileTree()
  useFileContents(selectedFile)
  const placeholder = 'Enter your text here...'

  return (
    <div className='w-full h-full bg-background text-foreground border-none outline-none focus-within:outline-none'>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className='w-full h-full border-none ring-0 outline-none'
            aria-placeholder={placeholder}
            placeholder={<div>{placeholder}</div>}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  )
}
