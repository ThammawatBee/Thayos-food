import DatePicker from "react-datepicker"
import AppBar from "../component/AppBar"
import { Box, Button, ButtonGroup, IconButton, Input, Pagination, Table, Text } from "@chakra-ui/react"
import usePaymentStore from "../store/paymentStore"
import { DateTime } from "luxon"
import PageSizeSelect from "../component/PageSizeSelect"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { useEffect } from "react"
import { downloadOrderSlip } from "../service/thayos-food"
import '../Datepicker.css'

const PaymentPage = () => {
  const { setSearch, search, fetchPayments, payments, offset, limit, onPageChange, onPageSizeChange, count } = usePaymentStore()

  useEffect(() => {
    if (!payments) {
      fetchPayments()
    }
  }, [])
  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      <Text marginBottom={"20px"} textStyle={'xl'} color={'#1A69AA'} fontWeight='bold'>Payment</Text>
      <Box display='flex' marginTop='20px' justifyContent='space-between'>
        <DatePicker
          dateFormat="dd-MM-yyyy"
          showMonthDropdown
          showYearDropdown
          isClearable
          onChange={(dates) => {
            const [start, end] = dates
            setSearch({
              dateStart: start,
              dateEnd: end
            })
          }}

          selectsRange={true}
          startDate={search.dateStart}
          endDate={search.dateEnd}
          onKeyDown={(e) => e.preventDefault()}
          customInput={<Input
            width={'240px'}
            readOnly={true}
            background={'white'} />}
        />
        <Button onClick={() => {
          fetchPayments({ reset: true })
        }}>Search</Button>
      </Box>
      <Box marginTop={'25px'}>
        <Table.Root size="md" showColumnBorder stickyHeader>
          <Table.Header>
            <Table.Row background={"#F6F6F6"}>
              <Table.ColumnHeader>ชื่อลูกค้า</Table.ColumnHeader>
              <Table.ColumnHeader>วันที่โอน</Table.ColumnHeader>
              <Table.ColumnHeader>โอนเข้าบัญชีบริษัท</Table.ColumnHeader>
              <Table.ColumnHeader>โอนเข้าบัญชีส่วนตัว</Table.ColumnHeader>
              <Table.ColumnHeader>Facebook</Table.ColumnHeader>
              <Table.ColumnHeader>อื่นๆ</Table.ColumnHeader>
              <Table.ColumnHeader>เช็คสลิป</Table.ColumnHeader>
              <Table.ColumnHeader>promotion</Table.ColumnHeader>
              <Table.ColumnHeader></Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>{
            payments?.length ?
              payments.slice(offset * limit, (offset + 1) * limit).map(payment => <Table.Row key={payment.id}>
                <Table.Cell>{payment.customer.fullname}</Table.Cell>
                <Table.Cell>{DateTime.fromISO(payment.createdAt).toFormat('dd/MM/yyyy')}</Table.Cell>
                <Table.Cell>{payment.paymentType === 'COMPANY_ACCOUNT' ? +payment.total : ''}</Table.Cell>
                <Table.Cell>{payment.paymentType === 'PERSONAL_ACCOUNT' ? +payment.total : ''}</Table.Cell>
                <Table.Cell>{payment.paymentType === 'CREDIT_CARD' ? +payment.total : ''}</Table.Cell>
                <Table.Cell>{!['COMPANY_ACCOUNT', 'PERSONAL_ACCOUNT', 'CREDIT_CARD'].includes(payment.paymentType) ? +payment.total : ''}</Table.Cell>
                <Table.Cell>เช็กแล้ว</Table.Cell>
                <Table.Cell>เช็กแล้ว</Table.Cell>
                <Table.Cell><Button onClick={async () => {
                  const response = await downloadOrderSlip(payment.id)
                  const url = window.URL.createObjectURL(new Blob([response as any]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', payment.slipFilename || 'download.jpg');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}>Download slip</Button></Table.Cell>
              </Table.Row>)
              : null}</Table.Body>
        </Table.Root>
        {payments?.length ? <Box mt={'15px'} mb={'15px'} display='flex' justifyContent={'space-between'}>
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

export default PaymentPage