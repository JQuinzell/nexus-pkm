import * as React from 'react'
import {
  ChevronRight,
  File,
  FilePlus,
  Folder,
  FolderPlus,
  MoreHorizontal,
  Search,
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
import { useState } from 'react'

const navItems = [
  {
    title: 'Files',
    url: '#',
    icon: Folder,
  },
  {
    title: 'Search',
    url: '#',
    icon: Search,
  },
] as const

function NavSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = useState<(typeof navItems)[number]>(
    navItems[0]
  )
  return (
    <Sidebar
      collapsible='none'
      className='w-[calc(var(--sidebar-width-icon)+1px)]! border-r'
    >
      {/* <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild className='md:h-8 md:p-0'>
              <a href='#'>
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <Command className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Acme Inc</span>
                  <span className='truncate text-xs'>Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader> */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className='px-1.5 md:px-0'>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                    onClick={() => {
                      setActiveItem(item)
                      // setOpen(true)
                    }}
                    isActive={activeItem?.title === item.title}
                    className='px-2.5 md:px-2'
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function MainSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { tree, setSelectedFile, selectedFile, createFile, createFolder } =
    useFileTree()
  return (
    <Sidebar {...props} collapsible='none' className='hidden flex-1 md:flex'>
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible='icon'
      className='overflow-hidden *:data-[sidebar=sidebar]:flex-row'
      {...props}
    >
      <NavSidebar />
      <MainSidebar />
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
