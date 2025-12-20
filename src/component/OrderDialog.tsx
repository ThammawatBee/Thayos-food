import { Box, Button, ButtonGroup, Checkbox, CloseButton, Dialog, Field, IconButton, Input, NativeSelect, Pagination, Portal, Table, Text, FileUpload } from "@chakra-ui/react"
import { useFormik } from "formik"
import * as Yup from 'yup';
import { useEffect, useState } from "react";
import { listCustomers } from "../service/thayos-food";
import { Customer } from "../interface/customer";
import PageSizeSelect from "./PageSizeSelect";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import pickBy from "lodash/pickBy";
import DatePicker from "react-datepicker";
import { generateDate, timeToMinutes } from "../utils/generateTime";
import useOrderStore from "../store/orderStore";
import { DateTime } from 'luxon';
import SuccessToast from "./SuccessToast";
import keys from "lodash/keys";
import { dayTitleMapping } from "../utils/renderOrderMenu";
import { get, isBoolean, mapValues } from "lodash";

interface OrderDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
}

const Step2Validate = {
  customerType: Yup.string().required('Customer type is required.'),
  customerTypeInput: Yup.string()
    .when('customerType', {
      is: 'OTHER',
      then: schema => schema.required('Other Customer type is required.'),
      otherwise: schema => schema.notRequired(),
    }),
  paymentType: Yup.string().required('Payment type is required.'),
  paymentTypeInput: Yup.string()
    .when('paymentType', {
      is: 'OTHER',
      then: schema => schema.required('Other Payment type is required.'),
      otherwise: schema => schema.notRequired(),
    }),
  slip: Yup.mixed().required('Slip is required'),
  total: Yup.number().required('Total is required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
  promotion: Yup.string().required('Promotion type is required.'),
  promotionInput: Yup.string()
    .when('paymentType', {
      is: 'OTHER',
      then: schema => schema.required('Other Promotion type is required.'),
      otherwise: schema => schema.notRequired(),
    }),
}


const OrderDialog = ({ isOpenDialog, setOpenDialog, }: OrderDialogProps) => {
  const [mode, setMode] = useState('customer')
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomer] = useState<Customer[]>([])
  const [count, setCount] = useState<number>(0)
  const [limit, setLimit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [formStep, setFromStep] = useState(0)
  const [isSkipOrderAttract, setIsSkipOrderAttract] = useState(false)
  const { createOrder } = useOrderStore()

  const emptyIndividualDay = {
    preferBreakfast: false,
    preferLunch: false,
    preferDinner: false,
    preferBreakfastSnack: false,
    preferLunchSnack: false,
    preferDinnerSnack: false,
    breakfastCount: 0,
    lunchCount: 0,
    dinnerCount: 0,
    breakfastSnackCount: 0,
    lunchSnackCount: 0,
    dinnerSnackCount: 0,
  }

  const individualDaySchema = Yup.object({
    preferBreakfast: Yup.boolean(),
    preferLunch: Yup.boolean(),
    preferDinner: Yup.boolean(),
    preferBreakfastSnack: Yup.boolean(),
    preferLunchSnack: Yup.boolean(),
    preferDinnerSnack: Yup.boolean(),
    breakfastCount: Yup.number().typeError('Must be a number')
      .when('preferBreakfast', {
        is: true,
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    lunchCount: Yup.number().typeError('Must be a number')
      .when('preferLunch', {
        is: true,
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    dinnerCount: Yup.number().typeError('Must be a number')
      .when('preferDinner', {
        is: true,
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    breakfastSnackCount: Yup.number().typeError('Must be a number')
      .when('preferBreakfastSnack', {
        is: true,
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    lunchSnackCount: Yup.number().typeError('Must be a number')
      .when('preferLunchSnack', {
        is: true,
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    dinnerSnackCount: Yup.number().typeError('Must be a number')
      .when('preferDinnerSnack', {
        is: true,
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
  });

  const validateSchema = [Yup.object({
    type: Yup.string().required('Order type is required.'),
    address: Yup.string().required('Address is required.'),
    preferBreakfast: Yup.boolean(),
    preferLunch: Yup.boolean(),
    preferDinner: Yup.boolean(),
    preferBreakfastSnack: Yup.boolean(),
    preferLunchSnack: Yup.boolean(),
    preferDinnerSnack: Yup.boolean(),
    deliveryOrderType: Yup.string().required('Delivery Order Type is required.'),
    deliveryTime: Yup.string().required('Delivery time start is required.'),
    deliveryTimeEnd: Yup.string()
      .required('End time is required')
      .test('is-after-start', 'End time must be after start time', function (deliveryTimeEnd?: string) {
        const deliveryTime = (this.parent as { deliveryTime?: string } | undefined)?.deliveryTime;

        if (!deliveryTime || !deliveryTimeEnd) return true;
        return timeToMinutes(deliveryTimeEnd) > timeToMinutes(deliveryTime);
      }),
    deliveryOn: Yup.object({
      Sunday: Yup.boolean(),
      Monday: Yup.boolean(),
      Tuesday: Yup.boolean(),
      Wednesday: Yup.boolean(),
      Thursday: Yup.boolean(),
      Friday: Yup.boolean(),
      Saturday: Yup.boolean(),
    }),
    individualDelivery: Yup.object({
      Sunday: individualDaySchema,
      Monday: individualDaySchema,
      Tuesday: individualDaySchema,
      Wednesday: individualDaySchema,
      Thursday: individualDaySchema,
      Friday: individualDaySchema,
      Saturday: individualDaySchema,
    }),
    startDate: Yup.date().required('startDate is required.'),
    endDate: Yup.date().required('endDate is required.'),
    breakfastCount: Yup.number().typeError('Must be a number')
      .when(
        ['preferBreakfast', 'deliveryOrderType'],
        {
          is: (preferBreakfast: boolean, deliveryOrderType: string) => preferBreakfast && deliveryOrderType === 'normal',
          then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
          otherwise: schema => schema.notRequired(),
        }),
    lunchCount: Yup.number().typeError('Must be a number')
      .when(['preferLunch', 'deliveryOrderType'], {
        is: (preferLunch: boolean, deliveryOrderType: string) => preferLunch && deliveryOrderType === 'normal',
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    dinnerCount: Yup.number().typeError('Must be a number')
      .when(['preferDinner', 'deliveryOrderType'], {
        is: (preferDinner: boolean, deliveryOrderType: string) => preferDinner && deliveryOrderType === 'normal',
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    breakfastSnackCount: Yup.number().typeError('Must be a number')
      .when(['preferBreakfastSnack', 'deliveryOrderType'], {
        is: (preferBreakfastSnack: boolean, deliveryOrderType: string) => preferBreakfastSnack && deliveryOrderType === 'normal',
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    lunchSnackCount: Yup.number().typeError('Must be a number')
      .when(['preferLunchSnack', 'deliveryOrderType'], {
        is: (preferLunchSnack: boolean, deliveryOrderType: string) => preferLunchSnack && deliveryOrderType === 'normal',
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    dinnerSnackCount: Yup.number().typeError('Must be a number')
      .when(['preferDinnerSnack', 'deliveryOrderType'], {
        is: (preferDinnerSnack: boolean, deliveryOrderType: string) => preferDinnerSnack && deliveryOrderType === 'normal',
        then: schema => schema.required('Required').integer().min(1, 'จำนวนต้องมากกว่า 0'),
        otherwise: schema => schema.notRequired(),
      }),
    mealsGroup: Yup.mixed().test(
      'at-least-one-meal',
      'At least one meal must be selected',
      function () {
        const { preferBreakfast, preferLunch, preferDinner, preferBreakfastSnack, preferLunchSnack, preferDinnerSnack, deliveryOrderType } = this.parent;
        if (deliveryOrderType && deliveryOrderType !== 'normal') {
          return true
        }
        return deliveryOrderType === 'normal' && [preferBreakfast, preferLunch, preferDinner, preferBreakfastSnack, preferLunchSnack, preferDinnerSnack].some(Boolean);
      }
    ),
    individualMealsGroup: Yup.mixed()
      .test(
        'validate-individual-Meals-Group',
        'Please correct individual order menu',
        function () {
          const { individualDelivery, deliveryOn, deliveryOrderType } = this.parent;
          if (deliveryOrderType && deliveryOrderType !== 'individual') {
            return true
          }
          return keys(pickBy(deliveryOn)).every(day => {
            const individualDeliveryDay = individualDelivery[day]
            const { preferBreakfast, preferLunch, preferDinner, preferBreakfastSnack, preferLunchSnack, preferDinnerSnack } = individualDeliveryDay
            return [preferBreakfast, preferLunch, preferDinner, preferBreakfastSnack, preferLunchSnack, preferDinnerSnack].some(Boolean);
          })
        }
      ),


    // ✅ Virtual field: at least one delivery day selected
    deliveryDaysGroup: Yup.mixed().test(
      'at-least-one-delivery-day',
      'At least one delivery day must be selected',
      function () {
        const deliveryOn = this.parent.deliveryOn;
        return deliveryOn && Object.values(deliveryOn).some(Boolean);
      })
  }),
  Yup.object(Step2Validate),
  ]

  const initCustomerStep = async () => {
    const data = await listCustomers({ offset: 0, customerCode: search, limit })
    setCustomer(data.customers)
    setCount(data.count)
    setCount(data.count)
  }

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

  useEffect(() => {
    initCustomerStep()
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      formik.setFieldValue('deliveryTime', selectedCustomer.deliveryTime)
      formik.setFieldValue('deliveryTimeEnd', selectedCustomer.deliveryTimeEnd)
      formik.setFieldValue('preferBreakfast', selectedCustomer.preferBreakfast)
      formik.setFieldValue('preferLunch', selectedCustomer.preferLunch)
      formik.setFieldValue('preferDinner', selectedCustomer.preferDinner)
      formik.setFieldValue('preferDinnerSnack', selectedCustomer.preferDinnerSnack)
      formik.setFieldValue('preferBreakfastSnack', selectedCustomer.preferBreakfastSnack)
      formik.setFieldValue('preferLunchSnack', selectedCustomer.preferLunchSnack)
      formik.setFieldValue('address', selectedCustomer.address)
      formik.setFieldValue('remark', selectedCustomer.remark)
    }
  }, [selectedCustomer])

  const formik = useFormik({
    initialValues: {
      type: '',
      address: '',
      remark: '',
      deliveryRemark: '',
      preferBreakfast: false,
      preferLunch: false,
      preferDinner: false,
      preferBreakfastSnack: false,
      preferLunchSnack: false,
      preferDinnerSnack: false,
      breakfastCount: 0,
      lunchCount: 0,
      dinnerCount: 0,
      breakfastSnackCount: 0,
      lunchSnackCount: 0,
      dinnerSnackCount: 0,
      deliveryTime: '00:00',
      deliveryTimeEnd: '00:00',
      deliveryOn: {
        Sunday: false,
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
      },
      startDate: null,
      endDate: null,
      mealsGroup: undefined,
      deliveryDaysGroup: undefined,
      individualMealsGroup: undefined,
      customerType: '',
      customerTypeInput: '',
      paymentType: '',
      paymentTypeInput: '',
      slip: null,
      total: 0,
      promotion: '',
      promotionInput: '',
      deliveryOrderType: '',
      individualDelivery: {
        Sunday: emptyIndividualDay,
        Monday: emptyIndividualDay,
        Tuesday: emptyIndividualDay,
        Wednesday: emptyIndividualDay,
        Thursday: emptyIndividualDay,
        Friday: emptyIndividualDay,
        Saturday: emptyIndividualDay,
      },
    },

    validationSchema: validateSchema[formStep],
    onSubmit: async (value) => {
      if (formStep === 0) {
        setFromStep(1)
        formik.setTouched(
          Object.keys(Step2Validate).reduce((acc, key) => {
            acc[key] = false
            return acc
          }, {} as Record<string, boolean>)
        )
      }
      else {
        const startDate = value.startDate ? DateTime.fromJSDate(value.startDate).toISODate() : ''
        const endDate = value.endDate ? DateTime.fromJSDate(value.endDate).toISODate() : ''
        const file = value.slip as File | null
        await createOrder({
          address: value.address,
          remark: value.remark || "",
          deliveryRemark: value.deliveryRemark,
          type: value.type,
          preferBreakfast: value.preferBreakfast,
          preferLunch: value.preferLunch,
          preferDinner: value.preferDinner,
          preferBreakfastSnack: value.preferBreakfastSnack,
          preferLunchSnack: value.preferLunchSnack,
          preferDinnerSnack: value.preferDinnerSnack,
          breakfastCount: value.preferBreakfast ? +value.breakfastCount : 0,
          lunchCount: value.preferLunch ? +value.lunchCount : 0,
          dinnerCount: value.preferDinner ? +value.dinnerCount : 0,
          breakfastSnackCount: value.preferBreakfastSnack ? +value.breakfastSnackCount : 0,
          lunchSnackCount: value.preferLunchSnack ? +value.lunchSnackCount : 0,
          dinnerSnackCount: value.preferDinnerSnack ? +value.dinnerSnackCount : 0,
          deliveryTime: value.deliveryTime,
          deliveryTimeEnd: value.deliveryTimeEnd,
          deliveryOn: value.deliveryOn,
          startDate: startDate,
          endDate: endDate,
          customerType: value.customerType,
          total: +value.total,
          promotion: value.promotion === 'OTHER' ? value.promotionInput : value.promotion,
          paymentType: value.paymentType === 'OTHER' ? value.paymentTypeInput : value.paymentType,
          customerId: selectedCustomer?.id || '',
          deliveryOrderType: value.deliveryOrderType,
          individualDelivery: mapValues(value.individualDelivery, day => mapValues(day,
            val => isBoolean(val) ? val : +val) as any)
        }, file)

        SuccessToast("Create order success")
        setOpenDialog(false)
        formik.resetForm()
        setFromStep(0)
        setMode('customer')
        setSelectedCustomer(null)
      }
    },
  })



  const CustomerContent = () => {
    return <Box>
      <Text fontSize={'xl'} color={'#1A69AA'} fontWeight='bold' marginBottom={'20px'}>Select Customer</Text>
      <Box mt="10px" display="flex" mb="35px" justifyContent='space-between' alignItems='end'>
        <Field.Root width="30%">
          <Field.Label>Customer ID/Name</Field.Label>
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
            <Table.ColumnHeader>ชื่อเต็ม</Table.ColumnHeader>
            <Table.ColumnHeader>เบอร์ติดต่อ</Table.ColumnHeader>
            <Table.ColumnHeader>E-mail</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            customers?.length ? customers.slice(offset * limit, (offset + 1) * limit).map(customer =>
              <Table.Row cursor={'pointer'} onClick={() => {
                setSelectedCustomer(customer)
                setMode('form')
              }}>
                <Table.Cell>{customer.customerCode}</Table.Cell>
                <Table.Cell>{customer.name}</Table.Cell>
                <Table.Cell>{customer.address}</Table.Cell>
                <Table.Cell>{customer.remark}</Table.Cell>
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

  const deliveryOrderSection = () => {
    if (formik.values.deliveryOrderType === 'normal') {
      return <Box>
        <Box display={'flex'} justifyContent={'space-between'}>
          <Box>
            <Checkbox.Root size={'md'}
              checked={formik.values.preferBreakfast}
              onCheckedChange={(e) => formik.setFieldValue("preferBreakfast", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>มื้อเช้า</Checkbox.Label>
            </Checkbox.Root>
            <Box marginTop={'20px'}>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.breakfastCount && !!formik.errors.breakfastCount}>
                <Field.Label>จำนวน</Field.Label>
                <Input type="number" disabled={!formik?.values?.preferBreakfast} value={formik?.values?.breakfastCount} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("breakfastCount", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.breakfastCount}</Field.ErrorText>
              </Field.Root>
            </Box>
          </Box>
          <Box>
            <Checkbox.Root size={'md'}
              checked={formik.values.preferLunch}
              onCheckedChange={(e) => formik.setFieldValue("preferLunch", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>มื้อกลางวัน</Checkbox.Label>
            </Checkbox.Root>
            <Box marginTop={'20px'}>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.lunchCount && !!formik.errors.lunchCount}>
                <Field.Label>จำนวน</Field.Label>
                <Input type="number" disabled={!formik?.values?.preferLunch} value={formik?.values?.lunchCount} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("lunchCount", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.lunchCount}</Field.ErrorText>
              </Field.Root>
            </Box>
          </Box>
          <Box>
            <Checkbox.Root size={'md'}
              checked={formik.values.preferDinner}
              onCheckedChange={(e) => formik.setFieldValue("preferDinner", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>มื้อเย็น</Checkbox.Label>
            </Checkbox.Root>
            <Box marginTop={'20px'}>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.dinnerCount && !!formik.errors.dinnerCount}>
                <Field.Label>จำนวน</Field.Label>
                <Input type="number" disabled={!formik?.values?.preferDinner} value={formik?.values?.dinnerCount} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("dinnerCount", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.dinnerCount}</Field.ErrorText>
              </Field.Root>
            </Box>
          </Box>
        </Box>
        <Box display={'flex'} justifyContent={'space-between'} marginTop="10px">
          <Box>
            <Checkbox.Root size={'md'}
              checked={formik.values.preferBreakfastSnack}
              onCheckedChange={(e) => formik.setFieldValue("preferBreakfastSnack", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>ของว่างเช้า</Checkbox.Label>
            </Checkbox.Root>
            <Box marginTop={'20px'}>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.breakfastSnackCount && !!formik.errors.breakfastSnackCount}>
                <Field.Label>จำนวน</Field.Label>
                <Input type="number" disabled={!formik?.values?.preferBreakfastSnack} value={formik?.values?.breakfastSnackCount} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("breakfastSnackCount", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.breakfastSnackCount}</Field.ErrorText>
              </Field.Root>
            </Box>
          </Box>
          <Box>
            <Checkbox.Root size={'md'}
              checked={formik.values.preferLunchSnack}
              onCheckedChange={(e) => formik.setFieldValue("preferLunchSnack", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>ของว่างกลางวัน</Checkbox.Label>
            </Checkbox.Root>
            <Box marginTop={'20px'}>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.lunchSnackCount && !!formik.errors.lunchSnackCount}>
                <Field.Label>จำนวน</Field.Label>
                <Input type="number" disabled={!formik?.values?.preferLunchSnack} value={formik?.values?.lunchSnackCount} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("lunchSnackCount", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.lunchSnackCount}</Field.ErrorText>
              </Field.Root>
            </Box>
          </Box>
          <Box>
            <Checkbox.Root size={'md'}
              checked={formik.values.preferDinnerSnack}
              onCheckedChange={(e) => formik.setFieldValue("preferDinnerSnack", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>ของว่างมื้อเย็น</Checkbox.Label>
            </Checkbox.Root>
            <Box marginTop={'20px'}>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.dinnerSnackCount && !!formik.errors.dinnerSnackCount}>
                <Field.Label>จำนวน</Field.Label>
                <Input type="number" disabled={!formik?.values?.preferDinnerSnack} value={formik?.values?.dinnerSnackCount} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("dinnerSnackCount", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.dinnerSnackCount}</Field.ErrorText>
              </Field.Root>
            </Box>
          </Box>
        </Box>
        {formik.submitCount > 0 && formik.errors.mealsGroup && <div style={{ color: 'red' }}>{formik.errors.mealsGroup}</div>}
      </Box>
    }
    if (formik.values.deliveryOrderType === 'individual') {
      const { deliveryOn } = formik.values
      return <Box>
        {
          keys(pickBy(deliveryOn)).map((day) => <Box marginBottom={"20px"}>
            <Text marginBottom={'10px'}>{get(dayTitleMapping, day) || ''}</Text>
            <Box display={'flex'} justifyContent={'space-between'}>
              <Box>
                <Checkbox.Root size={'md'}
                  // eslint-disable-next-line no-mixed-operators
                  checked={get(formik.values.individualDelivery, [day, "preferBreakfast"], false)}
                  onCheckedChange={(e) => formik.setFieldValue(`individualDelivery.${day}.preferBreakfast`, !!e.checked)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>มื้อเช้า</Checkbox.Label>
                </Checkbox.Root>
                <Box marginTop={'20px'}>
                  <Field.Root marginBottom="15px"
                    invalid={!!get(formik.touched.individualDelivery, [day, "breakfastCount"]) && !!get(formik.errors.individualDelivery, [day, "breakfastCount"])}
                  >
                    <Field.Label>จำนวน</Field.Label>
                    <Input type="number"
                      disabled={!get(formik?.values.individualDelivery, [day, "preferBreakfast"])}
                      value={get(formik?.values?.individualDelivery, [day, "breakfastCount"])}
                      onBlur={formik.handleBlur}
                      onChange={e => { formik.setFieldValue(`individualDelivery.${day}.breakfastCount`, e.currentTarget.value) }}
                    />
                    <Field.ErrorText>{get(formik.errors.individualDelivery, [day, "breakfastCount"])}</Field.ErrorText>
                  </Field.Root>
                </Box>
              </Box>
              <Box>
                <Checkbox.Root size={'md'}
                  checked={get(formik.values.individualDelivery, [day, "preferLunch"], false)}
                  onCheckedChange={(e) => formik.setFieldValue(`individualDelivery.${day}.preferLunch`, !!e.checked)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>มื้อกลางวัน</Checkbox.Label>
                </Checkbox.Root>
                <Box marginTop={'20px'}>
                  <Field.Root marginBottom="15px"
                    invalid={!!get(formik.touched.individualDelivery, [day, "lunchCount"]) && !!get(formik.errors.individualDelivery, [day, "lunchCount"])}
                  >
                    <Field.Label>จำนวน</Field.Label>
                    <Input type="number"
                      disabled={!get(formik?.values.individualDelivery, [day, "preferLunch"])}
                      value={get(formik?.values?.individualDelivery, [day, "lunchCount"])}
                      onBlur={formik.handleBlur}
                      onChange={e => { formik.setFieldValue(`individualDelivery.${day}.lunchCount`, e.currentTarget.value) }} />
                    <Field.ErrorText>{get(formik.errors.individualDelivery, [day, "lunchCount"])}</Field.ErrorText>
                  </Field.Root>
                </Box>
              </Box>
              <Box>
                <Checkbox.Root size={'md'}
                  checked={get(formik.values.individualDelivery, [day, "preferDinner"], false)}
                  onCheckedChange={(e) =>
                    formik.setFieldValue(`individualDelivery.${day}.preferDinner`, !!e.checked)
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>มื้อเย็น</Checkbox.Label>
                </Checkbox.Root>
                <Box marginTop={'20px'}>
                  <Field.Root marginBottom="15px"
                    invalid={!!get(formik.touched.individualDelivery, [day, "dinnerCount"]) && !!get(formik.errors.individualDelivery, [day, "dinnerCount"])}>
                    <Field.Label>จำนวน</Field.Label>
                    <Input type="number"
                      disabled={!get(formik?.values.individualDelivery, [day, "preferDinner"])}
                      value={get(formik?.values?.individualDelivery, [day, "dinnerCount"])}
                      onBlur={formik.handleBlur}
                      onChange={e => { formik.setFieldValue(`individualDelivery.${day}.dinnerCount`, e.currentTarget.value) }} />
                    <Field.ErrorText>{get(formik.errors.individualDelivery, [day, "dinnerCount"])}</Field.ErrorText>
                  </Field.Root>
                </Box>
              </Box>
            </Box>
            <Box display={'flex'} justifyContent={'space-between'} marginTop="10px">
              <Box>
                <Checkbox.Root size={'md'}
                  checked={get(formik.values.individualDelivery, [day, "preferBreakfastSnack"], false)}
                  onCheckedChange={(e) => formik.setFieldValue(`individualDelivery.${day}.preferBreakfastSnack`, !!e.checked)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>ของว่างเช้า</Checkbox.Label>
                </Checkbox.Root>
                <Box marginTop={'20px'}>
                  <Field.Root marginBottom="15px"
                    invalid={!!get(formik.touched.individualDelivery, [day, "breakfastSnackCount"]) && !!get(formik.errors.individualDelivery, [day, "breakfastSnackCount"])}
                  >
                    <Field.Label>จำนวน</Field.Label>
                    <Input type="number"
                      disabled={!get(formik?.values.individualDelivery, [day, "preferBreakfastSnack"])}
                      value={get(formik?.values?.individualDelivery, [day, "breakfastSnackCount"])}
                      onBlur={formik.handleBlur}
                      onChange={e => { formik.setFieldValue(`individualDelivery.${day}.breakfastSnackCount`, e.currentTarget.value) }} />
                    <Field.ErrorText>{get(formik.errors.individualDelivery, [day, "breakfastSnackCount"])}</Field.ErrorText>
                  </Field.Root>
                </Box>
              </Box>
              <Box>
                <Checkbox.Root size={'md'}
                  checked={get(formik.values.individualDelivery, [day, "preferLunchSnack"], false)}
                  onCheckedChange={(e) => formik.setFieldValue(`individualDelivery.${day}.preferLunchSnack`, !!e.checked)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>ของว่างกลางวัน</Checkbox.Label>
                </Checkbox.Root>
                <Box marginTop={'20px'}>
                  <Field.Root marginBottom="15px"
                    invalid={!!get(formik.touched.individualDelivery, [day, "lunchSnackCount"]) && !!get(formik.errors.individualDelivery, [day, "lunchSnackCount"])}
                  >
                    <Field.Label>จำนวน</Field.Label>
                    <Input type="number"
                      disabled={!get(formik?.values.individualDelivery, [day, "preferLunchSnack"])}
                      value={get(formik?.values?.individualDelivery, [day, "lunchSnackCount"])}
                      onBlur={formik.handleBlur}
                      onChange={e => {
                        formik.setFieldValue(`individualDelivery.${day}.lunchSnackCount`, e.currentTarget.value)
                      }}
                    />
                    <Field.ErrorText>{get(formik.errors.individualDelivery, [day, "lunchSnackCount"])}</Field.ErrorText>
                  </Field.Root>
                </Box>
              </Box>
              <Box>
                <Checkbox.Root size={'md'}
                  checked={get(formik.values.individualDelivery, [day, "preferDinnerSnack"], false)}
                  onCheckedChange={(e) => formik.setFieldValue(`individualDelivery.${day}.preferDinnerSnack`, !!e.checked)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>ของว่างมื้อเย็น</Checkbox.Label>
                </Checkbox.Root>
                <Box marginTop={'20px'}>
                  <Field.Root marginBottom="15px"
                    invalid={!!get(formik.touched.individualDelivery, [day, "dinnerSnackCount"]) && !!get(formik.errors.individualDelivery, [day, "dinnerSnackCount"])}
                  >
                    <Field.Label>จำนวน</Field.Label>
                    <Input type="number"
                      disabled={!get(formik?.values.individualDelivery, [day, "preferDinnerSnack"])}
                      value={get(formik?.values?.individualDelivery, [day, "dinnerSnackCount"])}
                      onBlur={formik.handleBlur}
                      onChange={e => { formik.setFieldValue(`individualDelivery.${day}.dinnerSnackCount`, e.currentTarget.value) }}
                    />
                    <Field.ErrorText>{formik.errors.dinnerSnackCount}</Field.ErrorText>
                  </Field.Root>
                </Box>
              </Box>
            </Box>
          </Box>)
        }
        {formik.submitCount > 0 && formik.errors.individualMealsGroup && <div style={{ color: 'red' }}>{formik.errors.individualMealsGroup}</div>}
      </Box>
    }
    return <Box />
  }
  const FormContent = () => {
    if (formStep === 0) {
      return <Box>
        <Field.Root marginBottom="15px">
          <Field.Label>Customer Code</Field.Label>
          <Input disabled value={selectedCustomer?.customerCode} />
        </Field.Root>
        <Field.Root marginBottom="15px">
          <Field.Label>Customer Name</Field.Label>
          <Input disabled value={selectedCustomer?.name} />
        </Field.Root>
        <Field.Root marginBottom="15px" invalid={!!formik.touched.address && !!formik.errors.address}>
          <Field.Label>Address</Field.Label>
          <Input value={formik?.values?.address} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("address", e.currentTarget.value) }} />
          <Field.ErrorText>{formik.errors.address}</Field.ErrorText>
        </Field.Root>
        <Field.Root marginBottom="15px" invalid={!!formik.touched.remark && !!formik.errors.remark}>
          <Field.Label>Remark</Field.Label>
          <Input value={formik?.values?.remark} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("remark", e.currentTarget.value) }} />
          <Field.ErrorText>{formik.errors.remark}</Field.ErrorText>
        </Field.Root>
        <Field.Root marginBottom="15px" invalid={!!formik.touched.deliveryRemark && !!formik.errors.deliveryRemark}>
          <Field.Label>Delivery Remark</Field.Label>
          <Input value={formik?.values?.deliveryRemark} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("deliveryRemark", e.currentTarget.value) }} />
          <Field.ErrorText>{formik.errors.deliveryRemark}</Field.ErrorText>
        </Field.Root>
        <Field.Root marginBottom="20px" invalid={!!formik.touched.type && !!formik.errors.type}>
          <Field.Label>Order Type</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              placeholder="Select order type"
              onBlur={formik.handleBlur}
              onChange={(e) => formik.setFieldValue("type", e.currentTarget.value)}
              name="type"
              value={formik.values.type}
            >
              <option value="HEALTHY">Healthy</option>
              <option value="DIET">Diet</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Field.ErrorText>{formik.errors.type}</Field.ErrorText>
        </Field.Root>
        <Field.Root marginBottom="25px" invalid={!!formik.touched.deliveryTime && !!formik.errors.deliveryTime}>
          <Field.Label>Delivery Time Start</Field.Label>
          <DatePicker
            selected={generateDate(formik.values.deliveryTime)}
            onChange={(date) => {
              if (date) {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const hhmm = `${hours}:${minutes}`;
                formik.setFieldValue("deliveryTime", hhmm)
              }
            }}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            timeFormat="HH:mm"
            dateFormat="HH:mm"
            customInput={<Input
              readOnly={true}
              value={formik.values.deliveryTime}
              background={'white'} />}
          />
          {/* <Input value={formik?.values?.email} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("email", e.currentTarget.value) }} /> */}
          <Field.ErrorText>{formik.errors.deliveryTime}</Field.ErrorText>
        </Field.Root>
        <Field.Root marginBottom="25px" invalid={!!formik.touched.deliveryTimeEnd && !!formik.errors.deliveryTimeEnd}>
          <Field.Label>Delivery Time End</Field.Label>
          <DatePicker
            selected={generateDate(formik.values.deliveryTimeEnd)}
            onChange={(date) => {
              if (date) {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const hhmm = `${hours}:${minutes}`;
                formik.setFieldValue("deliveryTimeEnd", hhmm)
              }
            }}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            timeFormat="HH:mm"
            dateFormat="HH:mm"
            customInput={<Input
              readOnly={true}
              value={formik.values.deliveryTimeEnd}
              background={'white'} />}
          />
          <Field.ErrorText>{formik.errors.deliveryTimeEnd}</Field.ErrorText>
        </Field.Root>
        <Box marginBottom={"20px"}>
          <Field.Root invalid={(!!formik.touched.startDate && !!formik.errors.startDate) || (!!formik.touched.endDate && !!formik.errors.endDate)}>
            <Field.Label>วันที่จัดส่ง</Field.Label>
            <DatePicker
              dateFormat="dd-MM-yyyy"
              showMonthDropdown
              showYearDropdown
              isClearable
              onChange={(dates) => {
                const [start, end] = dates
                formik.setFieldValue("startDate", start)
                formik.setFieldValue("endDate", end)
              }}

              selectsRange={true}
              startDate={formik.values.startDate}
              endDate={formik.values.endDate}
              onKeyDown={(e) => e.preventDefault()}
              customInput={<Input
                width={'240px'}
                readOnly={true}
                background={'white'} />}
            />
            <Field.ErrorText>{formik.errors.startDate}</Field.ErrorText>
            <Field.ErrorText>{formik.errors.endDate}</Field.ErrorText>
          </Field.Root>
        </Box>
        <Field.Root marginBottom="15px" invalid={!!formik.touched.deliveryOrderType && !!formik.errors.deliveryOrderType}>
          <Field.Label>การจัดส่ง order</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              placeholder="เลือกการจัดส่ง order"
              onBlur={formik.handleBlur}
              onChange={(e) => formik.setFieldValue("deliveryOrderType", e.currentTarget.value)}
              name="role"
              value={formik.values.deliveryOrderType}
            >
              <option value="normal">ส่งปกติ</option>
              <option value="individual">มื้อแตกต่างกัน</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Field.ErrorText>{formik.errors.deliveryOrderType}</Field.ErrorText>
        </Field.Root>
        <Box marginBottom="15px" marginTop="15px">
          <Text fontWeight={'medium'}>วันที่ต้องส่งทุกๆ</Text>
          <Box marginTop={'10px'} display='flex' justifyContent={'space-between'} width={'100%'}>
            <Checkbox.Root size={'md'}
              checked={formik.values.deliveryOn.Monday}
              onCheckedChange={(e) => formik.setFieldValue("deliveryOn.Monday", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>วันจันทร์</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root size={'md'}
              checked={formik.values.deliveryOn.Tuesday}
              onCheckedChange={(e) => formik.setFieldValue("deliveryOn.Tuesday", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>วันอังคาร</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root size={'md'}
              checked={formik.values.deliveryOn.Wednesday}
              onCheckedChange={(e) => formik.setFieldValue("deliveryOn.Wednesday", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>วันพุธ</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root size={'md'}
              checked={formik.values.deliveryOn.Thursday}
              onCheckedChange={(e) => formik.setFieldValue("deliveryOn.Thursday", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>วันพฤหัสบดี</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root size={'md'}
              checked={formik.values.deliveryOn.Friday}
              onCheckedChange={(e) => formik.setFieldValue("deliveryOn.Friday", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>วันศุกร์</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root size={'md'}
              checked={formik.values.deliveryOn.Saturday}
              onCheckedChange={(e) => formik.setFieldValue("deliveryOn.Saturday", !!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>วันเสาร์</Checkbox.Label>
            </Checkbox.Root>
          </Box>
          {formik.submitCount > 0 && formik.errors.deliveryDaysGroup && (
            <Box color={'red'} marginTop={'10px'}>{formik.errors.deliveryDaysGroup}</Box>
          )}
        </Box>
        {deliveryOrderSection()}
      </Box>
    }
    return <Box>
      <Field.Root marginBottom="15px">
        <Field.Label>Customer Code</Field.Label>
        <Input disabled value={selectedCustomer?.customerCode} />
      </Field.Root>
      <Field.Root marginBottom="15px">
        <Field.Label>Customer Name</Field.Label>
        <Input disabled value={selectedCustomer?.name} />
      </Field.Root>
      <Field.Root marginBottom="15px" invalid={!!formik.touched.customerType && !!formik.errors.customerType}>
        <Field.Label>Customer Type</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            placeholder="Select Customer type"
            onBlur={formik.handleBlur}
            onChange={(e) => formik.setFieldValue("customerType", e.currentTarget.value)}
            name="customerType"
            value={formik.values.customerType}
          >
            <option value="GENERAL">ลูกค้าทั่วไป</option>
            <option value="CLAIM">เคลม</option>
            <option value="OTHER">อื่นๆ</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Field.ErrorText>{formik.errors.customerType}</Field.ErrorText>
      </Field.Root>
      {formik.values.customerType === 'OTHER' &&
        <Field.Root marginBottom="15px" invalid={!!formik.touched.customerTypeInput && !!formik.errors.customerTypeInput}>
          <Field.Label>Other Customer Type</Field.Label>
          <Input value={formik?.values?.customerTypeInput} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("customerTypeInput", e.currentTarget.value) }} />
          <Field.ErrorText>{formik.errors.customerTypeInput}</Field.ErrorText>
        </Field.Root>}
      <Field.Root marginBottom="15px" invalid={!!formik.touched.paymentType && !!formik.errors.paymentType}>
        <Field.Label>Payment Type</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            placeholder="Select Payment type"
            onBlur={formik.handleBlur}
            onChange={(e) => formik.setFieldValue("paymentType", e.currentTarget.value)}
            name="paymentType"
            value={formik.values.paymentType}
          >
            <option value="COMPANY_ACCOUNT">โอนเข้าบัญชีบริษัท</option>
            <option value="PERSONAL_ACCOUNT">โอนเข้าบัญชีส่วนตัว</option>
            <option value="CREDIT_CARD">บัตรเครดิต</option>
            <option value="OTHER">อื่นๆ</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Field.ErrorText>{formik.errors.paymentType}</Field.ErrorText>
      </Field.Root>
      {formik.values.paymentType === 'OTHER' &&
        <Field.Root marginBottom="15px" invalid={!!formik.touched.paymentTypeInput && !!formik.errors.paymentTypeInput}>
          <Field.Label>Other Payment Type</Field.Label>
          <Input value={formik?.values?.paymentTypeInput} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("paymentTypeInput", e.currentTarget.value) }} />
          <Field.ErrorText>{formik.errors.paymentTypeInput}</Field.ErrorText>
        </Field.Root>}
      <Field.Root marginBottom="15px" invalid={!!formik.touched.total && !!formik.errors.total}>
        <Field.Label>ยอดโอนเงิน</Field.Label>
        <Input type="number" value={formik?.values?.total} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("total", e.currentTarget.value) }} />
        <Field.ErrorText>{formik.errors.total}</Field.ErrorText>
      </Field.Root>
      <Field.Root marginBottom="15px" invalid={!!formik.touched.slip && !!formik.errors.slip}>
        <Field.Label>Slip</Field.Label>
        <FileUpload.Root maxFiles={1} onFileChange={async (file) => {
          if (file.acceptedFiles?.length) {
            formik.setFieldValue('slip', file.acceptedFiles[0])
          }
        }}>
          <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <Button variant="solid" size="sm">
              Upload file
            </Button>
          </FileUpload.Trigger>
          {formik.values.slip && <FileUpload.Item file={formik.values.slip}>
            <FileUpload.ItemPreview />
            <FileUpload.ItemName />
            <FileUpload.ItemDeleteTrigger marginLeft={"auto"}
              onClick={() => {
                formik.setFieldValue('slip', null)
              }}
            />
          </FileUpload.Item>}
        </FileUpload.Root>
        <Field.ErrorText>{formik.errors.slip}</Field.ErrorText>
      </Field.Root>
      <Field.Root marginBottom="15px" invalid={!!formik.touched.promotion && !!formik.errors.promotion}>
        <Field.Label>Promotion</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            placeholder="Select Promotion"
            onBlur={formik.handleBlur}
            onChange={(e) => formik.setFieldValue("promotion", e.currentTarget.value)}
            name="promotion"
            value={formik.values.promotion}
          >
            <option value="PROMOTION1">Promotion1</option>
            <option value="PROMOTION2">Promotion2</option>
            <option value="PROMOTION3">Promotion3</option>
            <option value="OTHER">อื่นๆ</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Field.ErrorText>{formik.errors.promotion}</Field.ErrorText>
      </Field.Root>
      {formik.values.promotion === 'OTHER' &&
        <Field.Root marginBottom="15px" invalid={!!formik.touched.promotionInput && !!formik.errors.promotionInput}>
          <Field.Label>Other Promotion</Field.Label>
          <Input value={formik?.values?.promotionInput} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("promotionInput", e.currentTarget.value) }} />
          <Field.ErrorText>{formik.errors.promotionInput}</Field.ErrorText>
        </Field.Root>}
      <Button
        marginTop={"20px"}
        onClick={async () => {
          setIsSkipOrderAttract(true)
          const value = formik.values
          const startDate = value.startDate ? DateTime.fromJSDate(value.startDate).toISODate() : ''
          const endDate = value.endDate ? DateTime.fromJSDate(value.endDate).toISODate() : ''
          await createOrder({
            address: value.address,
            remark: value.remark,
            deliveryRemark: value.deliveryRemark,
            type: value.type,
            preferBreakfast: value.preferBreakfast,
            preferLunch: value.preferLunch,
            preferDinner: value.preferDinner,
            preferBreakfastSnack: value.preferBreakfastSnack,
            preferLunchSnack: value.preferLunchSnack,
            preferDinnerSnack: value.preferDinnerSnack,
            breakfastCount: value.preferBreakfast ? +value.breakfastCount : 0,
            lunchCount: value.preferLunch ? +value.lunchCount : 0,
            dinnerCount: value.preferDinner ? +value.dinnerCount : 0,
            breakfastSnackCount: value.preferBreakfastSnack ? +value.breakfastSnackCount : 0,
            lunchSnackCount: value.preferLunchSnack ? +value.lunchSnackCount : 0,
            dinnerSnackCount: value.preferDinnerSnack ? +value.dinnerSnackCount : 0,
            deliveryTime: value.deliveryTime,
            deliveryTimeEnd: value.deliveryTimeEnd,
            deliveryOn: value.deliveryOn,
            startDate: startDate,
            endDate: endDate,
            customerType: null,
            total: 0,
            promotion: null,
            paymentType: null,
            customerId: selectedCustomer?.id || '',
            deliveryOrderType: value.deliveryOrderType,
            individualDelivery: mapValues(value.individualDelivery, day => mapValues(day,
              val => isBoolean(val) ? val : +val) as any)
          }, null)

          SuccessToast("Create order success")
          setOpenDialog(false)
          formik.resetForm()
          setFromStep(0)
          setMode('customer')
          setSelectedCustomer(null)
        }}
        variant="outline"
        loading={isSkipOrderAttract}
      >

        Skip Attach Slip
      </Button>
    </Box >
  }

  const renderContent = () => {
    return mode === 'customer' ? CustomerContent() : FormContent()
  }

  return <Dialog.Root lazyMount open={isOpenDialog} size="xl"
    onExitComplete={() => {
      formik.resetForm()
    }}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>

          <Dialog.Header>
            <Dialog.Title>Create Order</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {renderContent()}
          </Dialog.Body>
          {mode === 'form' ? <Dialog.Footer>
            <Dialog.ActionTrigger>
              <Button variant="outline"
                type="button"
                disabled={formik.isSubmitting || isSkipOrderAttract}
                onClick={() => {
                  if (mode === 'form' && formStep === 0) {
                    setMode("customer")
                    formik.resetForm()
                  } else if (mode === 'form' && formStep === 1) {
                    setFromStep(0)
                  }
                }}>Back</Button>
            </Dialog.ActionTrigger>
            <Button loading={formik.isSubmitting || isSkipOrderAttract} onClick={() => formik.handleSubmit()} type="submit">{formStep === 0 ? 'Save' : 'Submit'}</Button>
          </Dialog.Footer> : null}
          <Dialog.CloseTrigger
            disabled={formik.isSubmitting || isSkipOrderAttract}
            onClick={() => {
              setOpenDialog(false)
              formik.resetForm()
              setMode('customer')
              setFromStep(0)
              setSelectedCustomer(null)
            }
            }>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
}

export default OrderDialog
