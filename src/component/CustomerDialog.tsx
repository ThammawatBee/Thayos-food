import useCustomerStore from "../store/customerStore"
import { Customer } from "../interface/customer"
import { useFormik } from "formik"
import DatePicker from "react-datepicker"
import * as Yup from 'yup';
import { Box, Button, Checkbox, CloseButton, Dialog, Field, Input, Portal } from "@chakra-ui/react";
import SuccessToast from "./SuccessToast";
import { toast } from "react-toastify";
import { ServiceError } from "@/interface/Error";
import { useEffect } from "react";
import { generateDate, timeToMinutes } from "../utils/generateTime";

interface CustomerDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
  customer: Customer | null
  resetCustomer: () => void
}


const CustomerDialog = ({ isOpenDialog, setOpenDialog, customer, resetCustomer }: CustomerDialogProps) => {
  const { createCustomer, editCustomer } = useCustomerStore()
  const formik = useFormik({
    initialValues: {
      customerCode: '',
      name: '',
      fullname: '',
      address: '',
      pinAddress: '',
      remark: '',
      mobileNumber: '',
      email: '',
      deliveryTime: '00:00',
      deliveryTimeEnd: '06:00',
      latitude: '',
      longitude: '',
      preferBreakfast: false,
      preferLunch: false,
      preferDinner: false,
      preferBreakfastSnack: false,
      preferLunchSnack: false,
      preferDinnerSnack: false,
      reserveMobileNumber: "",
    },
    validationSchema: Yup.object({
      customerCode: Yup.string().required('Customer code is required.'),
      name: Yup.string().required('Name is required.'),
      fullname: Yup.string().required('Fullname is required.'),
      address: Yup.string().required('Address is required.'),
      pinAddress: Yup.string().required('Pin Address is required.'),
      remark: Yup.string().optional().nullable(),
      mobileNumber: Yup.string().required('Mobile Number is required.').matches(/^0[689]\d{8}$/, 'Invalid phone number'),
      reserveMobileNumber: Yup.string().optional().matches(/^0[689]\d{8}$/, 'Invalid phone number'),
      email: Yup.string().required('Email is required').email('Invalid email format'),
      deliveryTime: Yup.string().required('Delivery time is required.'),
      deliveryTimeEnd: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time format (HH:mm)')
        .required('End time is required')
        .test('is-after-start', 'End time must be after start time', function (deliveryTimeEnd?: string) {
          const deliveryTime = (this.parent as { deliveryTime?: string } | undefined)?.deliveryTime;

          if (!deliveryTime || !deliveryTimeEnd) return true;
          return timeToMinutes(deliveryTimeEnd) > timeToMinutes(deliveryTime);
        }),
      latitude: Yup.string().optional().matches(/^\d*\.?\d*$/, 'Latitude must contain digits only'),
      longitude: Yup.string().optional().matches(/^\d*\.?\d*$/, 'Longitude number must contain digits only'),
    }),
    onSubmit: async (value) => {
      if (customer) {
        try {
          editCustomer(customer.id, {
            ...value,
            latitude: value.latitude ? +value.latitude : 0,
            longitude: value.longitude ? +value.longitude : 0,
          })
          SuccessToast("Edit Customer success")
          setOpenDialog(false)
        } catch (_error) {
          toast.error('Create or edit equipment error,please try again', {
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
        }
      } else {
        try {
          await createCustomer({
            ...value,
            remark: value.remark || null,
            latitude: value.latitude ? +value.latitude : 0,
            longitude: value.longitude ? +value.longitude : 0,
          })
          SuccessToast("Create Cutomer success")
          setOpenDialog(false)
        } catch (error: any) {
          const errorData = error.data as ServiceError
          if (errorData.errorKey === 'CUSTOMER_CODE_IS_ALREADY_EXIST') {
            toast.error('CustomerCode is already exist', {
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
          }
          else {
            toast.error('Create or edit customer error,please try again', {
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
          }
        }
      }
    },
  })


  useEffect(() => {
    if (customer) {
      formik.setValues({
        customerCode: customer.customerCode,
        name: customer.name,
        fullname: customer.fullname,
        address: customer.address,
        pinAddress: customer.pinAddress,
        remark: customer.remark,
        mobileNumber: customer.mobileNumber,
        email: customer.email,
        deliveryTime: customer.deliveryTime,
        deliveryTimeEnd: customer.deliveryTimeEnd || '06:00',
        latitude: `${customer.latitude}`,
        longitude: `${customer.longitude}`,
        preferBreakfast: customer.preferBreakfast,
        preferLunch: customer.preferLunch,
        preferDinner: customer.preferDinner,
        preferBreakfastSnack: customer.preferBreakfastSnack,
        preferLunchSnack: customer.preferLunchSnack,
        preferDinnerSnack: customer.preferDinnerSnack,
        reserveMobileNumber: customer.reserveMobileNumber,
      })
    }
  }, [customer])

  return <Dialog.Root lazyMount open={isOpenDialog} size={"lg"}
    onExitComplete={() => {
      formik.resetForm()
      resetCustomer()
    }}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <form onSubmit={formik.handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>{customer ? 'Edit Customer' : 'Add new Customer'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.customerCode && !!formik.errors.customerCode}>
                <Field.Label>Customer Code</Field.Label>
                <Input disabled={!!customer} value={formik?.values?.customerCode} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("customerCode", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.customerCode}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.name && !!formik.errors.name}>
                <Field.Label>Name</Field.Label>
                <Input value={formik?.values?.name} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("name", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.name}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.fullname && !!formik.errors.fullname}>
                <Field.Label>Full Name</Field.Label>
                <Input value={formik?.values?.fullname} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("fullname", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.fullname}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.address && !!formik.errors.address}>
                <Field.Label>Address</Field.Label>
                <Input value={formik?.values?.address} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("address", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.address}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.pinAddress && !!formik.errors.pinAddress}>
                <Field.Label>Pin Address</Field.Label>
                <Input value={formik?.values?.pinAddress} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("pinAddress", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.pinAddress}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.remark && !!formik.errors.remark}>
                <Field.Label>Remark</Field.Label>
                <Input value={formik?.values?.remark} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("remark", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.remark}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.mobileNumber && !!formik.errors.mobileNumber}>
                <Field.Label>Mobile Number</Field.Label>
                <Input value={formik?.values?.mobileNumber} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("mobileNumber", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.mobileNumber}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.reserveMobileNumber && !!formik.errors.reserveMobileNumber}>
                <Field.Label>Reserve Mobile Number</Field.Label>
                <Input value={formik?.values?.reserveMobileNumber} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("reserveMobileNumber", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.reserveMobileNumber}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.email && !!formik.errors.email}>
                <Field.Label>Email</Field.Label>
                <Input value={formik?.values?.email} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("email", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.email}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.deliveryTime && !!formik.errors.deliveryTime}>
                <Field.Label>Delivery Time</Field.Label>
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
              <Field.Root marginBottom="15px" invalid={!!formik.touched.latitude && !!formik.errors.latitude}>
                <Field.Label>Latitude</Field.Label>
                <Input type="number" value={formik?.values?.latitude || undefined} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("latitude", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.latitude}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.longitude && !!formik.errors.longitude}>
                <Field.Label>Longitude</Field.Label>
                <Input type="number" value={formik?.values?.longitude || undefined} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("longitude", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.longitude}</Field.ErrorText>
              </Field.Root>
              <Box marginTop={'20px'} display={'flex'} justifyContent={'space-between'}>
                <Box>
                  <Checkbox.Root size={'md'}
                    checked={formik.values.preferBreakfast}
                    onCheckedChange={(e) => formik.setFieldValue("preferBreakfast", !!e.checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>มื้อเช้า</Checkbox.Label>
                  </Checkbox.Root>
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
                </Box>
              </Box>
              <Box marginTop={'10px'} display={'flex'} justifyContent={'space-between'}>
                <Box>
                  <Checkbox.Root size={'md'}
                    checked={formik.values.preferBreakfastSnack}
                    onCheckedChange={(e) => formik.setFieldValue("preferBreakfastSnack", !!e.checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>ของว่างเช้า</Checkbox.Label>
                  </Checkbox.Root>
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
                </Box>
                <Box>
                  <Checkbox.Root size={'md'}
                    checked={formik.values.preferDinnerSnack}
                    onCheckedChange={(e) => formik.setFieldValue("preferDinnerSnack", !!e.checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>ของว่างเย็น</Checkbox.Label>
                  </Checkbox.Root>
                </Box>
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger onClick={() => setOpenDialog(false)}>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
}


export default CustomerDialog