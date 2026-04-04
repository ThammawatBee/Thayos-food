import AppBar from "../component/AppBar"
import { Box, Button, ButtonGroup, Field, IconButton, Input, NativeSelect, Pagination, Table, Text } from "@chakra-ui/react"
import { useEffect } from "react"
import useBagPageStore from "../store/bagPageStore"
import DatePicker from "react-datepicker"
import { DateTime } from "luxon"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { displayMenuDays } from "../utils/renderOrderMenu"
import PageSizeSelect from "../component/PageSizeSelect"
import { DuplicateOrderItem, OrderItem } from "../interface/bag"


const BagPage = () => {
  const { setSearch, search, fetchBags, bags, offset, limit, onPageChange, onPageSizeChange, count } = useBagPageStore()

  useEffect(() => {
    if (!bags) {
      fetchBags()
    }
  }, [])

  const renderMenu = (orderItems: OrderItem[], duplicateOrderItems: DuplicateOrderItem[]) => {
    const renderOrderItem = (menus: { text: string, type: string }[], orderItems: OrderItem[]) => {
      return menus.map(menu => {
        const orderItemByType = orderItems.filter(orderItem => orderItem.type === menu.type)
        const duplicateOrderItemByType = duplicateOrderItems.filter(duplicateOrderItem => duplicateOrderItem.type === menu.type && orderItemByType.filter(orderItem => orderItem.id === duplicateOrderItem.orderItemId).length)
        const successOrderItem = orderItemByType.filter(orderItem => orderItem.inBagStatus)
        return <Box marginRight={"10px"} display={'flex'}>
          <Text>{menu.text} {orderItemByType.length}</Text>
          <Text marginLeft={"5px"} color={orderItemByType.length === successOrderItem.length + duplicateOrderItemByType.length ? '#06B050' : '#EF5350'}>{`(${successOrderItem.length + duplicateOrderItemByType.length})`}</Text>
        </Box>
      })
    }

    return displayMenuDays.map(day => {
      const menus = orderItems?.filter(orderItem => DateTime.fromISO(orderItem.deliveryAt).toFormat('ccc').toUpperCase() === day)
      if (menus?.length) {
        return <Box display={'flex'} marginBottom={"10px"}>
          <Box minWidth={"30px"} marginRight={"20px"}>
            <Text>
              {day}
            </Text>
          </Box>
          <Box>
            <Box display={'flex'} alignItems={'center'} marginBottom={"10px"}>
              <Box width={"30px"} height={"20px"} border={"1px solid"}></Box>
              <Box display='flex' marginLeft={"20px"}>
                {renderOrderItem([{ type: "breakfast", text: "เช้า" }, { type: "lunch", text: "กลางวัน" }, { type: "dinner", text: "เย็น" }], menus || [],)}
              </Box>
            </Box>
            <Box display={'flex'} alignItems={'center'}>
              <Box width={"30px"} height={"30px"} border={"1px solid"} borderRadius={"50%"}></Box>
              <Box display='flex' marginLeft={"20px"}>
                {renderOrderItem([{ type: "breakfastSnack", text: "เช้า" }, { type: "lunchSnack", text: "กลางวัน" }, { type: "dinnerSnack", text: "เย็น" }], menus || [],)}
              </Box>
            </Box>
          </Box>
        </Box>
      }
      return <Box />
    })
  }

  const renderBagsPagination = () => {
    return <Box>
      {bags?.length ? <Box mt={'15px'} mb={'15px'} display='flex' justifyContent={'space-between'}>
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

  const renderMenuStatus = (orderItems: OrderItem[], duplicateOrderItems: DuplicateOrderItem[]) => {
    if (duplicateOrderItems.length) {
      return <Text color={'#EF5350'}>Error Duplicate</Text>
    }
    if (orderItems.every(orderItem => orderItem.inBagStatus)) {
      return <Text color={'#06B050'}>Complete</Text>
    }
    return <Text color={'#06B050'}>Processing</Text>
  }

  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      <Text marginBottom={"20px"} textStyle={'xl'} color={'#1A69AA'} fontWeight='bold'>Bag Management</Text>
      <Box display='flex' marginTop='20px' justifyContent='space-between' alignItems='end'>
        <Box display='flex'>
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
              customInput={<Input width={'240px'} readOnly={true} background={'white'} />}
            />
          </Field.Root>
          <Field.Root marginLeft="30px">
            <Field.Label>Customer ID/Full Name</Field.Label>
            <Input
              value={search.customer}
              onChange={(e) => {
                setSearch({ customer: e.currentTarget.value })
              }}
            />
          </Field.Root>
          <Field.Root marginLeft="30px">
            <Field.Label>Menu Type</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Select menu type"
                onChange={(e) => setSearch({ type: e.currentTarget.value })}
                name="type"
                value={search.type}
              >
                <option value="ALL">All</option>
                <option value="breakfast">มื้อเช้า</option>
                <option value="breakfastSnack">ของว่างเช้า</option>
                <option value="lunch">มื้อกลางวัน</option>
                <option value="lunchSnack">ของว่างกลางวัน</option>
                <option value="dinner">มื้อเย็น</option>
                <option value="dinnerSnack">ของว่างเย็น</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
        </Box>
        <Button onClick={() => {
          fetchBags({ reset: true })
        }}>Search</Button>
      </Box>

      <Box display={'flex'} marginTop='20px' alignItems='end'>
        <Box width={'240px'}>
          <Field.Root>
            <Field.Label>Remark Type</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Select remark type"
                onChange={(e) => setSearch({ remark: e.currentTarget.value })}
                name="remark"
                value={search.remark}
              >
                <option value="ALL">All</option>
                <option value="Remark">Remark</option>
                <option value="NoRemark">No Remark</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
        </Box>
        <Box marginLeft={'30px'} width={'240px'}>
          <Field.Root>
            <Field.Label>Order Type</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Select order type"
                onChange={(e) => setSearch({ orderType: e.currentTarget.value })}
                name="orderType"
                value={search.orderType}
              >
                <option value="ALL">All</option>
                <option value="HEALTHY">HEALTHY</option>
                <option value="DIET">DIET</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
        </Box>
      </Box>

      <Box marginTop="25px">
        <Table.Root size="md">
          <Table.Header>
            <Table.Row background={"#F9FAFB"}>
              <Table.ColumnHeader>วันที่</Table.ColumnHeader>
              <Table.ColumnHeader>รหัสลูกค้า</Table.ColumnHeader>
              <Table.ColumnHeader>ชื่อลูกค้า</Table.ColumnHeader>
              <Table.ColumnHeader>Basket</Table.ColumnHeader>
              <Table.ColumnHeader>เมนู</Table.ColumnHeader>
              <Table.ColumnHeader>Menu Status</Table.ColumnHeader>
              <Table.ColumnHeader>Basket Status</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              bags?.length ? bags.slice(offset * limit, (offset + 1) * limit).map(bag => <Table.Row>
                <Table.Cell>{bag.deliveryAt}</Table.Cell>
                <Table.Cell>{bag.order.customer.customerCode}</Table.Cell>
                <Table.Cell>{bag.order.customer.fullname}</Table.Cell>
                <Table.Cell>{bag.basket || ''}</Table.Cell>
                <Table.Cell>{renderMenu(bag.orderItems, bag.duplicateOrderItems)}</Table.Cell>
                <Table.Cell>{renderMenuStatus(bag.orderItems, bag.duplicateOrderItems)}</Table.Cell>
                <Table.Cell>{bag.basket ? <Text color={'#06B050'}>Complete</Text> : <Text color={'#EF5350'}>Pending</Text>}</Table.Cell>
              </Table.Row>) : null
            }
          </Table.Body>
        </Table.Root>
        {renderBagsPagination()}
      </Box>
    </Box>
  </Box>
}

export default BagPage
