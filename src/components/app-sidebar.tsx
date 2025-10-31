import * as React from 'react'
import {
  ChevronRight,
  File,
  FilePlus,
  Folder,
  FolderPlus,
  MoreHorizontal,
} from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useFileTree } from '@/FileTree/FileTreeContext'
import type { FileTreeNode } from '..'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { tree, setSelectedFile, selectedFile, createFile, createFolder } =
    useFileTree()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <ButtonGroup>
          <Button variant='ghost' size='icon' onClick={() => createFile()}>
            <FilePlus />
          </Button>
          <Button variant='ghost' size='icon' onClick={() => createFolder()}>
            <FolderPlus />
          </Button>
        </ButtonGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tree.map((item, index) => (
                <Tree
                  key={index}
                  item={item}
                  onClick={(selectedItem) => {
                    setSelectedFile(selectedItem)
                  }}
                  selectedFile={selectedFile}
                  onCreateFile={(parent) => createFile(parent)}
                  onCreateFolder={(parent) => createFolder(parent)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function Tree({
  item,
  onClick,
  selectedFile,
  onCreateFile,
  onCreateFolder,
}: {
  item: FileTreeNode
  onClick?: (item: FileTreeNode) => void
  selectedFile: FileTreeNode | null
  onCreateFile: (parent: FileTreeNode) => void
  onCreateFolder: (parent: FileTreeNode) => void
}) {
  const name = item.name
  const items = item.children

  function handleClick(node: FileTreeNode) {
    onClick?.(node)
  }

  if (item.type === 'file') {
    return (
      <SidebarMenuButton
        isActive={item.id === selectedFile?.id}
        className='data-[active=true]:bg-accent'
        onClick={() => handleClick(item)}
      >
        <File />
        {name}
      </SidebarMenuButton>
    )
  }

  return (
    <ContextMenu>
      <SidebarMenuItem>
        <Collapsible
          className='group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90'
          defaultOpen={name === 'components' || name === 'ui'}
        >
          <CollapsibleTrigger asChild>
            <ContextMenuTrigger asChild>
              <SidebarMenuButton>
                <ChevronRight className='transition-transform' />
                <Folder />
                {name}
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => onCreateFile(item)}>
                    <FilePlus /> New File
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onCreateFolder(item)}>
                    <FolderPlus /> New Folder
                  </ContextMenuItem>
                </ContextMenuContent>
              </SidebarMenuButton>
            </ContextMenuTrigger>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {items.map((subItem, index) => (
                <Tree
                  key={index}
                  item={subItem}
                  onClick={handleClick}
                  selectedFile={selectedFile}
                  onCreateFile={() => onCreateFile(subItem)}
                  onCreateFolder={() => onCreateFolder(subItem)}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    </ContextMenu>
  )
}
