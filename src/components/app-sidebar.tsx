import * as React from 'react'
import {
  ChevronRight,
  File,
  FilePlus,
  FileSymlink,
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
import type { FileMetadata, FileTreeNode, SearchResult } from '..'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu'
import { useEffect, useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from './ui/item'

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
  {
    title: 'Incoming Links',
    url: '#',
    icon: FileSymlink,
  },
] as const

type NavItem = (typeof navItems)[number]

function NavSidebar({
  activeItem,
  setActiveItem,
}: {
  activeItem: NavItem
  setActiveItem: (item: NavItem) => void
}) {
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

function FileExplorerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { tree, openFile, selectedFile, createFile, createFolder } =
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
                    openFile(selectedItem)
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

function getPropertySearch(query: string) {
  const match = /\[(.*):(.*)\]/.exec(query)
  if (!match) return null
  const [, property, value] = match
  return { property, value }
}

function SearchSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchResults, setSearchResults] = useState<
    { file: string; text: string }[]
  >([])

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const query = event.target.value.trim()
    setSearchResults([])
    if (!query) return
    const propertyQuery = getPropertySearch(query)
    if (propertyQuery) {
      const propertiesIndex = await window.api.getMetadataIndex()
      const results = Object.entries(propertiesIndex)
        .map(([file, entry]) => {
          const property = Object.entries(entry.properties).find(
            ([key]) => key === propertyQuery.property
          )
          return property
            ? { file, text: `${property[0]}:${property[1]}` }
            : null
        })
        .filter((v) => !!v)
      setSearchResults(results)
    } else if (query) {
      const results = await window.api.search(query)
      setSearchResults(
        results.map((result) => ({
          file: result.path.text,
          text: result.lines.text,
        }))
      )
    }
  }

  return (
    <Sidebar {...props} collapsible='none' className='hidden flex-1 md:flex'>
      <SidebarHeader>
        <InputGroup>
          <InputGroupInput placeholder='Search...' onChange={handleChange} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Results</SidebarGroupLabel>
          <SidebarGroupContent>
            {searchResults.map((result) => (
              <Item key={result.file} className='border-b'>
                <ItemContent>
                  <ItemTitle>{result.file}</ItemTitle>
                  <ItemDescription>{result.text}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function IncomingLinksSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { selectedFile } = useFileTree()
  const [metadata, setMetadata] = useState<FileMetadata>({})
  useEffect(() => {
    window.api.getMetadataIndex().then((metadata) => {
      setMetadata(metadata)
    })
  }, [])

  const fileMetadata = selectedFile
    ? metadata[selectedFile.path.concat(selectedFile.name).join('/')]
    : null
  return (
    <Sidebar {...props} collapsible='none' className='hidden flex-1 md:flex'>
      <SidebarHeader>Incoming Links</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Incoming</SidebarGroupLabel>
          <SidebarGroupContent>
            {fileMetadata?.incoming.map((file) => (
              <Item key={file} className='border-b'>
                <ItemContent>
                  <ItemTitle>{file}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Outgoing</SidebarGroupLabel>
          <SidebarGroupContent>
            {fileMetadata?.outgoing.map((file) => (
              <Item key={file} className='border-b'>
                <ItemContent>
                  <ItemTitle>{file}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = useState<(typeof navItems)[number]>(
    navItems[0]
  )

  return (
    <Sidebar
      collapsible='icon'
      className='overflow-hidden *:data-[sidebar=sidebar]:flex-row'
      {...props}
    >
      <NavSidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      {activeItem.title === 'Files' && <FileExplorerSidebar />}
      {activeItem.title === 'Search' && <SearchSidebar />}
      {activeItem.title === 'Incoming Links' && <IncomingLinksSidebar />}
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
        <Collapsible className='group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90'>
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
