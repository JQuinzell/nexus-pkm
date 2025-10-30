import * as React from 'react'
import { ChevronRight, File, FilePlus, Folder, FolderPlus } from 'lucide-react'

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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useFileTree } from '@/FileTree/FileTreeContext'
import type { FileTreeNode } from '..'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { tree, setSelectedFile, selectedFile } = useFileTree()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <ButtonGroup>
          <Button variant='ghost' size='icon'>
            <FilePlus />
          </Button>
          <Button variant='ghost' size='icon'>
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
}: {
  item: FileTreeNode
  onClick?: (item: FileTreeNode) => void
  selectedFile: FileTreeNode | null
}) {
  const name = item.name
  const items = item.children

  function handleClick(node: FileTreeNode) {
    onClick?.(node)
  }

  if (!items.length) {
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
    <SidebarMenuItem>
      <Collapsible
        className='group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90'
        defaultOpen={name === 'components' || name === 'ui'}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className='transition-transform' />
            <Folder />
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem}
                onClick={handleClick}
                selectedFile={selectedFile}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
