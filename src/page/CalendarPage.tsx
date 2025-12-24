import AppBar from "../component/AppBar"
import { Box, Button, ButtonGroup, Field, IconButton, Input, Pagination, Table, Text } from "@chakra-ui/react"
import HolidayCalendar from "../component/HolidayCalendar"
import { useEffect, useState } from "react"
import PageSizeSelect from "../component/PageSizeSelect"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { Customer } from "../interface/customer"
import { listCustomers } from "../service/thayos-food"
import pickBy from "lodash/pickBy"
import useCustomerCalendarStore from "../store/customerCalendarStore"
import YearCalendar from "../component/YearCalendar"
import isNil from "lodash/isNil"
import DatePicker from "react-datepicker"
import uniq from "lodash/uniq"

const CalendarPage = () => {
  const { activeCustomerId, setActiveCustomerId, year, customerCalendar, fetchCustomerOrderItem, setYear } = useCustomerCalendarStore()

  const [mode, setMode] = useState('customer')
  const [customers, setCustomer] = useState<Customer[]>([])
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null)
  const [count, setCount] = useState<number>(0)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)

  const initCustomerStep = async () => {
    const data = await listCustomers({ offset: 0, customerCode: search, limit })
    setCustomer(data.customers)
    setCount(data.count)
    setCount(data.count)
  }


  useEffect(() => {
    initCustomerStep()
  }, [])

  useEffect(() => {
    if (activeCustomerId) {
      if (isNil(customerCalendar?.[activeCustomerId]?.[year])) {
        fetchCustomerOrderItem(activeCustomerId, year)
      }
    }
  }, [activeCustomerId])


  const onPageSizeChange = async (pageSize: number) => {
    const response = await listCustomers({
      limit: pageSize,
      offset: 0,
      ...pickBy({ search }, (search) => !!search),
    });
    setCustomer(response.customers)
    setCount(response.count)
    setOffset(0)
    setLimit(pageSize)
  }

  const onPageChange = async (page: number) => {
    if (customers) {
      if (customers?.length < page * limit && customers?.length < count) {
        const response = await listCustomers({ offset: customers.length, limit: (page * limit) - customers?.length, ...pickBy({ search }, (search) => !!search) })
        setCustomer([...customers, ...response.customers])
        setCount(response.count)
        setOffset(page - 1)
      }
      else {
        setOffset(page - 1)
      }
    }
  }

  const generateCustomerTask = () => {
    if (activeCustomerId && customerCalendar?.[activeCustomerId]?.[year]?.length) {
      const tasks = customerCalendar?.[activeCustomerId]?.[year]
      const deliveryDates = tasks.map(task => task.deliveryAt)
      return uniq(deliveryDates)
    }
    return []
  }

  const renderSection = () => {
    if (mode === 'customer') {
      return activeCustomerId ? <Box>
        <Box>
          <Button onClick={() => setActiveCustomerId(null)}>Back</Button>
          <Text fontSize='xl' marginTop={'20px'}>{activeCustomer?.fullname} Order Calendar</Text>
        </Box>
        <Box>
          <Text marginBottom={"10px"}>Select Year</Text>
          <DatePicker
            selected={new Date(+year, 0, 1)}
            onChange={(date) => {
              if (date) {
                const year = `${date.getFullYear()}`
                setYear(`${date.getFullYear()}`)
                if (!customerCalendar[activeCustomerId][year]) {
                  fetchCustomerOrderItem(activeCustomerId, year)
                }
              }
            }}
            showYearPicker
            dateFormat="yyyy"
            customInput={<Input
              readOnly={true}
              value={year}
              background={'white'} />}
          />
        </Box>
        <YearCalendar year={+year}
          dateTasks={generateCustomerTask()}
          highlightColor={'#17391B'}
        />
      </Box> : <Box>
        <Box display='flex' justifyContent='space-between'>
          <Text fontSize={'xl'} color={'#1A69AA'} fontWeight='bold' marginBottom={'20px'}>Select Customer to see Order Calendar</Text>
          <Button onClick={() => { setMode("holiday") }}>Set up Holiday</Button>
        </Box>
        <Box mt="10px" display="flex" mb="35px" justifyContent='space-between' alignItems='end'>
          <Field.Root width="30%">
            <Field.Label>Customer ID/Full Name</Field.Label>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value)
              }} />
          </Field.Root>
          <Button onClick={async () => {
            const response = await listCustomers({ offset: 0, customerCode: search, limit })
            setCustomer(response.customers)
            setCount(response.count)
            setOffset(0)
          }}>Search</Button>
        </Box>
        <Table.Root size="md">
          <Table.Header>
            <Table.Row background={"#F9FAFB"}>
              <Table.ColumnHeader>รหัสลูกค้า</Table.ColumnHeader>
              <Table.ColumnHeader>ชื่อลูกค้า</Table.ColumnHeader>
              <Table.ColumnHeader>ที่อยู่</Table.ColumnHeader>
              <Table.ColumnHeader>Remark</Table.ColumnHeader>
              <Table.ColumnHeader>ชื่อเล่น</Table.ColumnHeader>
              <Table.ColumnHeader>เบอร์ติดต่อ</Table.ColumnHeader>
              <Table.ColumnHeader>E-mail</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              customers?.length ? customers.slice(offset * limit, (offset + 1) * limit).map(customer =>
                <Table.Row cursor={'pointer'} onClick={() => {
                  setActiveCustomerId(customer.id)
                  setActiveCustomer(customer)
                  // setSelectedCustomer(customer)
                  // setMode('form')
                }}>
                  <Table.Cell>{customer.customerCode}</Table.Cell>
                  <Table.Cell>{customer.fullname}</Table.Cell>
                  <Table.Cell>{customer.address}</Table.Cell>
                  <Table.Cell>{customer.name}</Table.Cell>
                  <Table.Cell>{customer.fullname}</Table.Cell>
                  <Table.Cell>{customer.mobileNumber}</Table.Cell>
                  <Table.Cell>{customer.email}</Table.Cell>
                </Table.Row>
              ) : null
            }
          </Table.Body>
        </Table.Root>
        {customers?.length ? <Box mt={'15px'} mb={'15px'} display='flex' justifyContent={'space-between'}>
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
    }
    else {
      return <Box>
        <Button marginBottom={'20px'} onClick={() => { setMode("customer") }}>Back to customer calendar</Button>
        <HolidayCalendar />
      </Box>
    }
  }

  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      {renderSection()}
    </Box>
  </Box>
}

export default CalendarPage

