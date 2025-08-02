import AppBar from "../component/AppBar"
import { Box, Button, ButtonGroup, Field, IconButton, Input, NativeSelect, Pagination, Table, Text } from "@chakra-ui/react"
import useHistoryStore from "../store/historyStore"
import { DateTime } from "luxon"
import { useEffect } from "react"
import PageSizeSelect from "../component/PageSizeSelect"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import DatePicker from "react-datepicker"
import { getLogLabel, LogTypes } from "../utils/renderLogType"

const HistoryPage = () => {
  const { logs, limit, onPageSizeChange, onPageChange, offset, count, search, setSearch, fetchLogs } = useHistoryStore()
  useEffect(() => {
    if (!logs) {
      fetchLogs()
    }
  }, [])
  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      <Box display='flex' marginTop='20px' justifyContent='space-between' alignItems='end'>
        <Box display='flex'>
          <Field.Root marginRight="30px">
            <Field.Label>Operation</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Select operation"
                onChange={(e) => setSearch({ type: e.currentTarget.value })}
                name="type"
                value={search.type}
              >
                <option value="ALL">All</option>
                {LogTypes.map(logType => <option value={logType.value}>{logType.label}</option>)}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root>
            <Field.Label>Select Date</Field.Label>
            <DatePicker
              dateFormat="dd-MM-yyyy"
              showMonthDropdown
              showYearDropdown
              isClearable
              onChange={(dates) => {
                const [start, end] = dates
                setSearch({
                  startDate: start,
                  endDate: end
                })
              }}

              selectsRange={true}
              startDate={search.startDate}
              endDate={search.endDate}
              onKeyDown={(e) => e.preventDefault()}
              customInput={<Input
                width={'240px'}
                readOnly={true}
                background={'white'} />}
            />
          </Field.Root>
        </Box>
        <Button onClick={() => {
          fetchLogs({ reset: true })
        }}>Search</Button>
      </Box>
      <Box marginTop={'25px'}>
        <Table.Root size="md">
          <Table.Header>
            <Table.Row background={"#F6F6F6"}>
              <Table.ColumnHeader>Date Time</Table.ColumnHeader>
              <Table.ColumnHeader>Operation</Table.ColumnHeader>
              <Table.ColumnHeader>Operator</Table.ColumnHeader>
              <Table.ColumnHeader>Customer</Table.ColumnHeader>
              <Table.ColumnHeader>Detail</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>{
            logs?.length ?
              logs.slice(offset * limit, (offset + 1) * limit).map(log => <Table.Row key={log.id}>
                <Table.Cell>{DateTime.fromISO(log.createdAt).toFormat("dd/MM/yyyy-hh:mm")}</Table.Cell>
                <Table.Cell>{getLogLabel(log.type)}</Table.Cell>
                <Table.Cell>{log.user.name}</Table.Cell>
                <Table.Cell>{log.customer ? log.customer.fullname : ''}</Table.Cell>
                <Table.Cell>{log.detail}</Table.Cell>
                <Table.Cell>{log.status === 'success' ? <Text color={'#06B050'}>Success</Text> : <Text color={'#EF5350'}>Fail</Text>}</Table.Cell>
              </Table.Row>)
              : null}</Table.Body>
        </Table.Root>
        {logs?.length ? <Box mt={'15px'} mb={'15px'} display='flex' justifyContent={'space-between'}>
          <Box display={'flex'} fontSize={'14px'} alignItems={'center'}>
            Row per page
            <Box ml={"15px"} width={'50px'}>
              <PageSizeSelect limit={limit} onChangePageSize={async (pageSize: number) => {
                await onPageSizeChange(pageSize)
              }} />
            </Box>
            <Box ml={"15px"}>
              {(offset * limit) + 1} - {count < (limit * (offset + 1)) ? count : (limit * (offset + 1))} of {count}
            </Box>
          </Box>
          <Pagination.Root
            count={count}
            pageSize={limit}
            page={offset + 1}
            onPageChange={async (details: { page: number, pageSize: number }) => {
              await onPageChange(details.page)
            }}
          >
            <ButtonGroup variant="ghost">
              <Pagination.PrevTrigger asChild>
                <IconButton>
                  <LuChevronLeft />
                </IconButton>
              </Pagination.PrevTrigger>
              <Pagination.Items
                render={(page) => (
                  <IconButton variant={{ base: "ghost", _selected: "solid" }}>
                    {page.value}
                  </IconButton>
                )}
              />
              <Pagination.NextTrigger asChild>
                <IconButton>
                  <LuChevronRight />
                </IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        </Box> : <Box height={'75px'} />}
      </Box>
    </Box>
  </Box>
}

export default HistoryPage