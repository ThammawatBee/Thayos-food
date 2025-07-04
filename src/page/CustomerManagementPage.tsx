import useCustomerStore from "../store/customerStore"
import AppBar from "../component/AppBar"
import { Box, Button, ButtonGroup, Field, IconButton, Input, Pagination, Table, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FiEdit } from "react-icons/fi"
import { Customer } from "../interface/customer"
import PageSizeSelect from "../component/PageSizeSelect"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import CustomerDialog from "../component/CustomerDialog"
import { FaRegTrashAlt } from "react-icons/fa"
import DeleteCustomerDialog from "../component/DeleteCustomerDialog"

const CustomerManagement = () => {
  const { customers, limit, onPageSizeChange, onPageChange, offset, count, search, setSearch, fetchCustomers } = useCustomerStore()
  useEffect(() => {
    if (!customers) {
      fetchCustomers()
    }
  }, [])

  const [openModal, setOpenModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)
  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      <Text marginBottom={"20px"} textStyle={'xl'} color={'#1A69AA'} fontWeight='bold'>Customer Management</Text>
      <Box mt="10px" display="flex" mb="35px" justifyContent='space-between' alignItems='end'>
        <Field.Root width="30%">
          <Field.Label>Customer ID/Name</Field.Label>
          <Input
            value={search.customerCode}
            onChange={(e) => {
              setSearch({ customerCode: e.currentTarget.value })
            }} />
        </Field.Root>
        <Button onClick={() => {
          fetchCustomers({ reset: true })
        }}>Search</Button>
      </Box>
      <Table.Root size="md">
        <Table.Header>
          <Table.Row background={"#F9FAFB"}>
            <Table.ColumnHeader>รหัสลูกค้า</Table.ColumnHeader>
            <Table.ColumnHeader>ชื่อลูกค้า</Table.ColumnHeader>
            <Table.ColumnHeader>ที่อยู่</Table.ColumnHeader>
            <Table.ColumnHeader>Remark</Table.ColumnHeader>
            <Table.ColumnHeader>ชื่อเต็ม</Table.ColumnHeader>
            <Table.ColumnHeader>เบอร์ติดต่อ</Table.ColumnHeader>
            <Table.ColumnHeader>E-mail</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            customers?.length ? customers.slice(offset * limit, (offset + 1) * limit).map(customer =>
              <Table.Row>
                <Table.Cell>{customer.customerCode}</Table.Cell>
                <Table.Cell>{customer.name}</Table.Cell>
                <Table.Cell>{customer.address}</Table.Cell>
                <Table.Cell>{customer.remark}</Table.Cell>
                <Table.Cell>{customer.fullname}</Table.Cell>
                <Table.Cell>{customer.mobileNumber}</Table.Cell>
                <Table.Cell>{customer.email}</Table.Cell>
                <Table.Cell>
                  <IconButton
                    variant="outline"
                    size={"sm"}
                    onClick={() => {
                      setEditCustomer(customer)
                      setOpenModal(true)
                    }}
                  >
                    <FiEdit />
                  </IconButton></Table.Cell>
                <Table.Cell>
                  <IconButton
                    variant="outline"
                    size={"sm"}
                    onClick={() => {
                      setDeleteCustomer(customer)
                      setOpenDeleteModal(true)
                    }}
                  >
                    <FaRegTrashAlt />
                  </IconButton></Table.Cell>
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
      <Box marginTop="20px" display='flex' justifyContent='flex-end'>
        <Button background={'#385723'} onClick={() => setOpenModal(true)}>Add new Customer</Button>
      </Box>
    </Box>
    <DeleteCustomerDialog isOpenDialog={openDeleteModal} setOpenDialog={setOpenDeleteModal} customer={deleteCustomer} />
    <CustomerDialog isOpenDialog={openModal} setOpenDialog={setOpenModal} customer={editCustomer} />
  </Box>
}

export default CustomerManagement