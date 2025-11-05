import { useFileTree } from './FileTree/FileTreeContext'

type Props = {
  fileId: string
}

export function FileLink({ fileId }: Props) {
  const { fileMap, openFile } = useFileTree()
  const file = fileMap.get(fileId)

  function handleClick() {
    if (file) {
      openFile(file)
    }
  }
  return (
    <span className='text-primary cursor-pointer' onClick={handleClick}>
      [[{fileId}]]
    </span>
  )
}
