import { NativeSelectField, NativeSelectRoot, } from "@chakra-ui/react"

interface PageSizeSelectProps {
  limit: number
  onChangePageSize: (pageSize: number) => Promise<void>
}

const PageSizeSelect = ({ limit, onChangePageSize }: PageSizeSelectProps) => {
  return <NativeSelectRoot background={'white'} borderRadius={'4px'}>
    <NativeSelectField
      value={limit}
      onChange={async (e) => {
        onChangePageSize(+(e.currentTarget.value))
      }}
      paddingRight={'12px'}
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </NativeSelectField>
  </NativeSelectRoot>
}

export default PageSizeSelect