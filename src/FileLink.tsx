import { useFileTree } from './FileTree/FileTreeContext'

type Props = {
  fileId: string
}

export function FileLink({ fileId }: Props) {
  const { fileMap, setSelectedFile } = useFileTree()
  const file = fileMap.get(fileId)

  function handleClick() {
    if (file) {
      setSelectedFile(file)
    }
  }
  return (
    <span className='text-primary cursor-pointer' onClick={handleClick}>
      [[{fileId}]]
    </span>
  )
}
