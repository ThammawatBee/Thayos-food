import OrderDialog from "../component/OrderDialog"
import AppBar from "../component/AppBar"
import { Box, Button, ButtonGroup, Field, FileUpload, FileUploadTrigger, IconButton, Input, NativeSelect, Pagination, Table, Tabs, Text, useFileUpload } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import useBagStore, { generateParam } from "../store/bagStore"
import DatePicker from "react-datepicker"
import { Bag, GroupBag, OrderItem, OrderItemSummary } from "../interface/bag"
import sortBy from "lodash/sortBy"
import { FiEdit } from "react-icons/fi"
import { LuChevronLeft, LuChevronRight, LuPrinter } from "react-icons/lu"
import PageSizeSelect from "../component/PageSizeSelect"
import { exportBags, exportOrderItems, getBagQrCode, listBags, listBagsForPrint, updateBags, exportDelivery } from "../service/thayos-food"
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { toast } from "react-toastify"
import { checkErrorUploadHeader } from "../utils/checkFileHeader"
import BagDialog from "../component/BagDialog"
import { DateTime } from "luxon"
import useOrderStore from "../store/orderStore"
import { Order } from "../interface/order"
import get from "lodash/get"
import UpdateOrderDialog from "../component/UpdateOrderDialog"
import PrintBag from "../component/print/PrintBag"
import { useReactToPrint } from "react-to-print";
import { dayTitleMapping, displayMenu, renderMenu, SortDate, types } from "../utils/renderOrderMenu"
import PrintListBags from "../component/print/PrintListBags"
import PrintBox from "../component/print/PrintBox"
import PrintListBoxes from "../component/print/PrintListBoxes"
import { FaRegTrashAlt } from "react-icons/fa"
import DeleteBagDialog from "../component/DeleteBagDialog"
import keys from "lodash/keys"
import pickBy from "lodash/pickBy"

interface UploadRow {
  id: string;
  Basket: string;
}

const OrderPage = () => {
  const componentPrintBagRef = useRef(null);
  const componentPrintBagsRef = useRef(null);
  const componentPrintBoxRef = useRef(null);
  const componentPrintBoxesRef = useRef(null);
  const [openModal, setOpenModal] = useState(false)
  const [openBagModal, setOpenBagModal] = useState(false)
  const [openUpdateOrderModal, setOpenUpdateOrderModal] = useState(false)
  const [bag, setBag] = useState<Bag | null>(null)
  const [printBag, setPrintBag] = useState<GroupBag | null>(null)
  const [printBags, setPrintBags] = useState<GroupBag[] | null>(null)
  const [printBox, setPrintBox] = useState<{ bag: Bag, orderItem: OrderItem } | null>(null)
  const [printBoxes, setPrintBoxes] = useState<Bag[] | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const { setSearch, search, fetchBags, bags, offset, limit, onPageChange, onPageSizeChange, count, getOrderItemsSummary, orderItemsSummary } = useBagStore()
  const { fetchOrders, orders, search: searchOrder, setSearch: setSearchOrder, offset: orderOffset, limit: orderLimit, count: orderCount, onPageChange: orderOnPageChange, onPageSizeChange: orderOnPageSizeChange } = useOrderStore()
  const [mode, setMode] = useState('bag')
  const [pageMode, setPageMode] = useState('Delivery')
  const orderTypes = [
    { text: 'มื้อเช้า', value: 'preferBreakfast', countValue: "breakfastCount" },
    { text: 'ของว่างเช้า', value: 'preferBreakfastSnack', countValue: "breakfastSnackCount" },
    { text: 'มื้อกลางวัน', value: 'preferLunch', countValue: "lunchCount" },
    { text: 'ของว่างกลางวัน', value: 'preferLunchSnack', countValue: "lunchSnackCount" },
    { text: 'มื้อเย็น', value: 'preferDinner', countValue: "dinnerCount" },
    { text: 'ของว่างเย็น', value: 'preferDinnerSnack', countValue: "dinnerSnackCount" },
  ]
  const [selectDeleteBag, setDeleteBag] = useState<Bag | null>(null)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  const indexMap = new Map(types.map((val, idx) => [val.value, idx]));

  useEffect(() => {
    if (!bags) {
      fetchBags()
      getOrderItemsSummary()
    }
  }, [])

  useEffect(() => {
    if (pageMode === 'Order' && !orders) {
      fetchOrders()
    }
  }, [pageMode])


  useEffect(() => {
    if (printBox) {
      printBoxFn()
    }
  }, [printBox])

  const printFn = useReactToPrint({
    contentRef: componentPrintBagRef,
    pageStyle: `
    @media print {
      @page { size: 302.362px 150px; margin: 0; }
      body { background: white; }
    }
  `,
    onAfterPrint: () => {
      setPrintBag(null)
    }
  });

  const printBaglist = useReactToPrint({
    contentRef: componentPrintBagsRef,
    pageStyle: `
    @media print {
     @page {
      size: 302.362px 150px;
      margin: 0;
      background: white;
    }
    .page {
      page-break-after: always;
      background: white;
    }
    }`,
    onAfterPrint: () => {
      setPrintBags(null)
    }
  });

  const printBoxFn = useReactToPrint({
    contentRef: componentPrintBoxRef,
    pageStyle: `
    @media print {
      @page { size: 302.362px 90px; margin: 0; }
      body { background: white; }
    }`,
    onAfterPrint: () => {
      setPrintBox(null)
    }
  });

  const printBoxeslist = useReactToPrint({
    contentRef: componentPrintBoxesRef,
    pageStyle: `
    @media print {
     @page {
      size: 302.362px 90px;
      margin: 0;
      background: white;
    }
    .page {
      page-break-after: always;
      background: white;
    }
    }`,
    onAfterPrint: () => {
      setPrintBoxes(null)
    }
  });



  const renderOrderMenu = (order: Order) => {
    let text = ''
    if (order.deliveryOrderType === 'normal') {
      orderTypes.forEach(type => {
        const prefer = get(order, type.value, false)
        if (prefer) {
          text = text + `${type.text}(${get(order, type.countValue, 0)}) `
        }
      })
    }
    if (order.deliveryOrderType === 'individual') {
      const { deliveryOn, individualDelivery } = order;
      SortDate.forEach(day => {
        if (get(deliveryOn, day)) {
          text = text + `${get(dayTitleMapping, day) || ''} `
          const orderInIndividualDelivery = get(individualDelivery, day)
          orderTypes.forEach(type => {
            const prefer = get(orderInIndividualDelivery, type.value, false)
            if (prefer) {
              text = text + `${type.text}(${get(orderInIndividualDelivery, type.countValue, 0)}) `
            }
          })
        }
      })
    }
    return text
  }

  const handleUploadXlsFile = (file: File) => {
    const reader = new FileReader();
    let isUploadError = false
    let isCheckHeader = false
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const csv = XLSX.utils.sheet_to_csv(sheet); // ✅ Convert to CSV string

      // Now stream parse this CSV with PapaParse
      Papa.parse(csv, {
        header: true,
        chunkSize: 1024 * 1024, // 1MB chunk
        chunk: async (results: Papa.ParseResult<any>, parser: Papa.Parser) => {
          const rows: UploadRow[] = results.data;
          parser.pause();
          const headers = results.meta?.fields
          if (!isCheckHeader && (!headers?.length || checkErrorUploadHeader(headers))) {
            isUploadError = true
            parser.abort(); // Stop processing further
            toastUploadFileError(`Please check ${file.name} upload header file`)
            return
          }
          isCheckHeader = true
          try {
            await updateBags(rows.map(row => ({ id: row.id, basket: row.Basket })).filter(row => row.id))
            parser.resume(); // Resume parsing after successful upload
          } catch (error: any) {
            console.log('error', error)
            parser.pause()
            isUploadError = true
            parser.abort(); // Stop processing further
            let errorMessage = ''
            if (error?.data?.detail) {
              errorMessage = `Upload ${file.name} fail cause ${error?.data?.detail}`
            }
            else if (error?.data?.message === 'Validation failed') {
              errorMessage = `Upload ${file.name} fail cause Validation failed`
            }
            else {
              errorMessage = `Upload ${file.name} fail please check file upload`
            }
            toastUploadFileError(errorMessage)
            return
          }

        },
        complete: () => {
          if (!isUploadError) {
            toast.success(`Upload ${file.name} success`, {
              style: { color: '#18181B' },
              position: "top-right",
              autoClose: 3500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            isUploadError = false
            isCheckHeader = false
            fetchBags({ reset: true })
          }
        },
        error: (error: any) => {
          // setUploadLoading(false)
          console.log('Error parsing XLSX:', error);
        },
      });
    };

    reader.readAsArrayBuffer(file);
  }

  const toastUploadFileError = (message: string) => {
    toast.error(message, {
      style: { color: '#18181B' },
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }

  const renderBagsPagition = () => {
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

  const renderOrderItemSummary = (menus: string[], orderItemsSummary: OrderItemSummary[]) => {
    return menus.map(menu => {
      const summary = orderItemsSummary.find(orderItemSummary => orderItemSummary.value === menu)
      if (summary) {
        return <Box marginRight={"10px"}>{summary.text} : {summary.count} </Box>
      }
      return <Box />
    })
  }

  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      <Text marginBottom={"20px"} textStyle={'xl'} color={'#1A69AA'} fontWeight='bold'>Order Management</Text>
      <Tabs.Root value={pageMode} onValueChange={(e) => setPageMode(e.value)}>
        <Tabs.List>
          <Tabs.Trigger value="Delivery">Delivery</Tabs.Trigger>
          <Tabs.Trigger value="Order">Order</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="Delivery">
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
                  customInput={<Input
                    width={'240px'}
                    readOnly={true}
                    background={'white'} />}
                />
              </Field.Root>
              <Field.Root marginLeft="30px">
                <Field.Label>Customer ID/Name</Field.Label>
                <Input
                  value={search.customer}
                  onChange={(e) => {
                    setSearch({ customer: e.currentTarget.value })
                  }} />
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
              getOrderItemsSummary()
            }}>Search</Button>
          </Box>
          <Box display='flex' marginTop='20px' >
            <Button bg='#385723' fontWeight='bold'
              onClick={async () => {
                const response = await exportBags(generateParam(search) as any)
                const url = window.URL.createObjectURL(new Blob([response as any]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${DateTime.now().toFormat('yyyy-MM-dd-hh-mm')}-bags.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
            >Export Bag as Excel</Button>
            <FileUpload.Root marginLeft={"20px"} maxFiles={1} accept={['.xls', '.xlsx']} onFileChange={async (file) => {
              if (file.acceptedFiles?.[0]) {
                await handleUploadXlsFile(file.acceptedFiles?.[0])
              }
            }}>
              <FileUpload.HiddenInput />
              <FileUploadTrigger asChild>
                <Button fontWeight="bold">
                  Upload Bag file
                </Button>
              </FileUploadTrigger>
            </FileUpload.Root>
            <Button bg='#385723' fontWeight="bold" marginRight={"30px"}
              onClick={async () => {
                const response = await exportOrderItems(generateParam(search) as any)
                const url = window.URL.createObjectURL(new Blob([response as any]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${DateTime.now().toFormat('yyyy-MM-dd-hh-mm')}-order-items.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
            >
              Export Order Item
            </Button>
            <Button bg='#2F7F68' fontWeight="bold"
              onClick={async () => {
                const response = await exportDelivery(generateParam(search) as any)
                const url = window.URL.createObjectURL(new Blob([response as any]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${DateTime.now().toFormat('yyyy-MM-dd-hh-mm')}-delivery.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
            >
              Export Delivery
            </Button>
          </Box>
          <Box marginTop="25px" display={'flex'} justifyContent={'space-between'} alignItems='baseline'>
            <Box display={'flex'}>
              <Button background={"#002160"} onClick={async () => {
                const response = await listBagsForPrint({ ...generateParam(search) as any, getAll: true })
                setPrintBags(response.bags)
                setTimeout(() => printBaglist(), 500);
              }}>Print ติดถุง</Button>
              <Button background={"#BF5913"} marginLeft={"20px"} onClick={async () => {
                const response = await listBags({ ...generateParam(search) as any, getAll: true })
                setPrintBoxes(response.bags)
                setTimeout(() => printBoxeslist(), 500);
              }}>Print ติดกล่อง</Button>
            </Box>
            <Box>
              {
                orderItemsSummary?.length ?
                  <Box>
                    <Box display='flex'>
                      {renderOrderItemSummary(["breakfast", "lunch", "dinner"], orderItemsSummary)}
                    </Box>
                    <Box display='flex'>
                      {renderOrderItemSummary(["breakfastSnack", "lunchSnack", "dinnerSnack"], orderItemsSummary)}
                    </Box>
                  </Box> : null
              }
            </Box>
          </Box>
          <Tabs.Root value={mode} onValueChange={(e) => setMode(e.value)} marginTop="25px">
            <Tabs.List>
              <Tabs.Trigger value="bag">Bag</Tabs.Trigger>
              <Tabs.Trigger value="orderItem">Order Item</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="bag">
              <Table.Root size="md">
                <Table.Header>
                  <Table.Row background={"#F9FAFB"}>
                    <Table.ColumnHeader>วันที่</Table.ColumnHeader>
                    <Table.ColumnHeader>รหัสลูกค้า</Table.ColumnHeader>
                    <Table.ColumnHeader>ชื่อลูกค้า</Table.ColumnHeader>
                    <Table.ColumnHeader>ที่อยู่</Table.ColumnHeader>
                    <Table.ColumnHeader>Delivery Time</Table.ColumnHeader>
                    <Table.ColumnHeader>Delivery Time End</Table.ColumnHeader>
                    <Table.ColumnHeader>Remark</Table.ColumnHeader>
                    <Table.ColumnHeader>Delivery Remark</Table.ColumnHeader>
                    <Table.ColumnHeader>เมนู</Table.ColumnHeader>
                    <Table.ColumnHeader>Basket</Table.ColumnHeader>
                    <Table.ColumnHeader></Table.ColumnHeader>
                    <Table.ColumnHeader></Table.ColumnHeader>
                    <Table.ColumnHeader></Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {
                    bags?.length ? bags.slice(offset * limit, (offset + 1) * limit).map(bag => <Table.Row>
                      <Table.Cell>{bag.deliveryAt}</Table.Cell>
                      <Table.Cell>{bag.order.customer.customerCode}</Table.Cell>
                      <Table.Cell>{bag.order.customer.fullname}</Table.Cell>
                      <Table.Cell>{bag.address || ''}</Table.Cell>
                      <Table.Cell>{bag.order.deliveryTime ? DateTime.fromFormat(bag.order.deliveryTime, 'hh:mm:ss').toFormat('hh:mm') : ''}</Table.Cell>
                      <Table.Cell>{bag.order.deliveryTimeEnd ? DateTime.fromFormat(bag.order.deliveryTimeEnd, 'hh:mm:ss').toFormat('hh:mm') : ''}</Table.Cell>
                      <Table.Cell>{bag.order.remark}</Table.Cell>
                      <Table.Cell>{bag.order.deliveryRemark}</Table.Cell>
                      <Table.Cell>{renderMenu(bag)}</Table.Cell>
                      <Table.Cell>{bag.basket || ''}</Table.Cell>
                      <Table.Cell>
                        <IconButton
                          disabled={!(DateTime.fromISO(bag.deliveryAt) > DateTime.local().startOf('day'))}
                          variant="outline"
                          size={"sm"}
                          onClick={() => {
                            setBag(bag)
                            setOpenBagModal(true)
                          }}
                        >
                          <FiEdit />
                        </IconButton></Table.Cell>
                      <Table.Cell>
                        <IconButton
                          variant="outline"
                          size={"sm"}
                          onClick={async () => {
                            const response = await getBagQrCode(bag.qrCode)
                            setPrintBag(response.bag)
                            setTimeout(() => printFn(), 500);
                          }}
                        >
                          <LuPrinter />
                        </IconButton></Table.Cell>
                      <Table.Cell>
                        <IconButton
                          variant="outline"
                          size={"sm"}
                          onClick={() => {
                            setDeleteBag(bag)
                            setOpenDeleteModal(true)
                          }}
                        >
                          <FaRegTrashAlt />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>) : null
                  }
                </Table.Body>
              </Table.Root>
              {renderBagsPagition()}
            </Tabs.Content>
            <Tabs.Content value="orderItem">
              <Table.Root size="md">
                <Table.Header>
                  <Table.Row background={"#F9FAFB"}>
                    <Table.ColumnHeader>วันที่</Table.ColumnHeader>
                    <Table.ColumnHeader>รหัสลูกค้า</Table.ColumnHeader>
                    <Table.ColumnHeader>ชื่อลูกค้า</Table.ColumnHeader>
                    <Table.ColumnHeader>ที่อยู่</Table.ColumnHeader>
                    <Table.ColumnHeader>Delivery Time</Table.ColumnHeader>
                    <Table.ColumnHeader>Delivery Time End</Table.ColumnHeader>
                    <Table.ColumnHeader>Remark</Table.ColumnHeader>
                    <Table.ColumnHeader>Delivery Remark</Table.ColumnHeader>
                    <Table.ColumnHeader>มื้ออาหาร</Table.ColumnHeader>
                    <Table.ColumnHeader>Basket</Table.ColumnHeader>
                    <Table.ColumnHeader></Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {
                    bags?.length ? bags.slice(offset * limit, (offset + 1) * limit).map(bag => sortBy(bag.orderItems, (item) =>
                      indexMap.has(item.type) ? indexMap.get(item.type)! : Infinity).map(orderItem =>
                        <Table.Row>
                          <Table.Cell>{bag.deliveryAt}</Table.Cell>
                          <Table.Cell>{bag.order.customer.customerCode}</Table.Cell>
                          <Table.Cell>{bag.order.customer.fullname}</Table.Cell>
                          <Table.Cell>{bag.address || ''}</Table.Cell>
                          <Table.Cell>{bag.order.deliveryTime ? DateTime.fromFormat(bag.order.deliveryTime, 'hh:mm:ss').toFormat('hh:mm') : ''}</Table.Cell>
                          <Table.Cell>{bag.order.deliveryTimeEnd ? DateTime.fromFormat(bag.order.deliveryTimeEnd, 'hh:mm:ss').toFormat('hh:mm') : ''}</Table.Cell>
                          <Table.Cell>{bag.order.remark}</Table.Cell>
                          <Table.Cell>{bag.order.deliveryRemark}</Table.Cell>
                          <Table.Cell>{displayMenu(orderItem.type)}</Table.Cell>
                          <Table.Cell>{bag.basket || ''}</Table.Cell>
                          <Table.Cell>
                            <IconButton
                              // disabled={!(DateTime.fromISO(bag.deliveryAt) > DateTime.local().startOf('day'))}
                              variant="outline"
                              size={"sm"}
                              onClick={async () => {
                                setPrintBox({ bag, orderItem })
                              }}
                            >
                              <LuPrinter />
                            </IconButton></Table.Cell>
                        </Table.Row>
                      )) : null
                  }
                </Table.Body>
              </Table.Root>
              {renderBagsPagition()}
            </Tabs.Content>
          </Tabs.Root>
        </Tabs.Content>
        <Tabs.Content value="Order">
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
                    setSearchOrder({
                      startDate: start,
                      endDate: end
                    })
                  }}

                  selectsRange={true}
                  startDate={searchOrder.startDate}
                  endDate={searchOrder.endDate}
                  onKeyDown={(e) => e.preventDefault()}
                  customInput={<Input
                    width={'240px'}
                    readOnly={true}
                    background={'white'} />}
                />
              </Field.Root>
              <Field.Root marginLeft="30px">
                <Field.Label>Customer ID/Name</Field.Label>
                <Input
                  value={searchOrder.customer}
                  onChange={(e) => {
                    setSearchOrder({ customer: e.currentTarget.value })
                  }} />
              </Field.Root>
            </Box>
            <Button onClick={() => {
              fetchOrders({ reset: true })
            }}>Search</Button>
          </Box>
          <Box marginTop={"25px"} />
          <Table.Root size="md">
            <Table.Header>
              <Table.Row background={"#F9FAFB"}>
                <Table.ColumnHeader>Start date</Table.ColumnHeader>
                <Table.ColumnHeader>End date</Table.ColumnHeader>
                <Table.ColumnHeader>รหัสลูกค้า</Table.ColumnHeader>
                <Table.ColumnHeader>ชื่อลูกค้า</Table.ColumnHeader>
                <Table.ColumnHeader>ที่อยู่</Table.ColumnHeader>
                <Table.ColumnHeader>Delivery Time</Table.ColumnHeader>
                <Table.ColumnHeader>Delivery Time End</Table.ColumnHeader>
                <Table.ColumnHeader>Remark</Table.ColumnHeader>
                <Table.ColumnHeader>Delivery Remark</Table.ColumnHeader>
                <Table.ColumnHeader>การจัดส่ง order</Table.ColumnHeader>
                <Table.ColumnHeader>เมนู</Table.ColumnHeader>
                <Table.ColumnHeader></Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                orders?.length ? orders.slice(orderOffset * orderLimit, (orderOffset + 1) * orderLimit).map(order => <Table.Row>
                  <Table.Cell>{order.startDate}</Table.Cell>
                  <Table.Cell>{order.endDate}</Table.Cell>
                  <Table.Cell>{order.customer.customerCode}</Table.Cell>
                  <Table.Cell>{order.customer.fullname}</Table.Cell>
                  <Table.Cell>{order.address || ''}</Table.Cell>
                  <Table.Cell>{order.deliveryTime ? DateTime.fromFormat(order.deliveryTime, 'hh:mm:ss').toFormat('hh:mm') : ''}</Table.Cell>
                  <Table.Cell>{order.deliveryTimeEnd ? DateTime.fromFormat(order.deliveryTimeEnd, 'hh:mm:ss').toFormat('hh:mm') : ''}</Table.Cell>
                  <Table.Cell>{order.remark || ''}</Table.Cell>
                  <Table.Cell>{order.deliveryRemark || ''}</Table.Cell>
                  <Table.Cell>{order.deliveryOrderType === 'individual' ? 'มื้อแตกต่างกัน' : 'ส่งปกติ'}</Table.Cell>
                  <Table.Cell>{renderOrderMenu(order)}</Table.Cell>
                  <Table.Cell>
                    <IconButton
                      //disabled={DateTime.fromISO(order.endDate || '') <= DateTime.local().startOf('day')}
                      variant="outline"
                      size={"sm"}
                      onClick={() => {
                        setOrder(order)
                        setOpenUpdateOrderModal(true)
                      }}
                    >
                      <FiEdit />
                    </IconButton></Table.Cell>
                </Table.Row>) : null
              }
            </Table.Body>
          </Table.Root>
          <Box>
            {bags?.length ? <Box mt={'15px'} mb={'15px'} display='flex' justifyContent={'space-between'}>
              <Box display={'flex'} fontSize={'14px'} alignItems={'center'}>
                Row per page
                <Box ml={"15px"} width={'50px'}>
                  <PageSizeSelect limit={orderLimit} onChangePageSize={async (pageSize: number) => {
                    await orderOnPageSizeChange(pageSize)
                  }} />
                </Box>
                <Box ml={"15px"}>
                  {(orderOffset * orderLimit) + 1} - {orderCount < (orderLimit * (orderOffset + 1)) ? orderCount : (orderLimit * (orderOffset + 1))} of {orderCount}
                </Box>
              </Box>
              <Pagination.Root
                count={orderCount}
                pageSize={orderLimit}
                page={orderOffset + 1}
                onPageChange={async (details: { page: number, pageSize: number }) => {
                  await orderOnPageChange(details.page)
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
        </Tabs.Content>
        <Box marginTop="20px" display='flex' justifyContent='flex-end'>
          <Button background={'#385723'}
            onClick={() => setOpenModal(true)}
          >Add new Order</Button>
        </Box>
      </Tabs.Root>
    </Box>
    <OrderDialog isOpenDialog={openModal} setOpenDialog={setOpenModal} />
    {bag && <BagDialog resetBag={() => { setBag(null) }} bag={bag} isOpenDialog={openBagModal} setOpenDialog={setOpenBagModal} />}
    {order && <UpdateOrderDialog resetOrder={() => setOrder(null)} order={order} isOpenDialog={openUpdateOrderModal} setOpenDialog={setOpenUpdateOrderModal} />}
    {selectDeleteBag && <DeleteBagDialog isOpenDialog={openDeleteModal} setOpenDialog={setOpenDeleteModal} bag={selectDeleteBag} resetBag={() => { setDeleteBag(null) }} />}
    <Box display="none">
      <PrintBag componentPrintRef={componentPrintBagRef} bag={printBag} />
    </Box>
    <Box display="none">
      <PrintListBags componentPrintRef={componentPrintBagsRef} bags={printBags} />
    </Box>
    <Box display="none">
      <PrintBox componentPrintRef={componentPrintBoxRef} bag={printBox?.bag || null} orderItem={printBox?.orderItem || null} />
    </Box>
    <Box display="none">
      <PrintListBoxes componentPrintRef={componentPrintBoxesRef} bags={printBoxes} />
    </Box>
  </Box>
}
export default OrderPage