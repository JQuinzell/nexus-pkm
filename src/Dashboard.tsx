import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useFileTree } from './FileTree/FileTreeContext'
import { Editor, EditorProvider } from './Editor'
import { Button } from './components/ui/button'
import { X } from 'lucide-react'
import { ButtonGroup } from './components/ui/button-group'

function FileTabs() {
  const { selectedFile, tabs, openFile, removeTab } = useFileTree()

  return (
    <div className='flex gap-2 items-center'>
      {tabs.map((file) => {
        const variant = selectedFile?.id === file.id ? 'secondary' : 'ghost'
        return (
          <ButtonGroup key={file.id}>
            <Button
              key={file.id}
              variant={variant}
              onClick={() => openFile(file)}
              size='sm'
            >
              {file.name}
            </Button>
            <Button size='sm' variant={variant} onClick={() => removeTab(file)}>
              <X />
            </Button>
          </ButtonGroup>
        )
      })}
    </div>
  )
}

export function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='mr-2 data-[orientation=vertical]:h-4'
          />
          <FileTabs />
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4'>
          <EditorProvider>
            <Editor />
          </EditorProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
