import { useFormik } from "formik"
import * as Yup from 'yup';
import { Order } from "../interface/order"
import SuccessToast from "./SuccessToast";
import { toast } from "react-toastify";
import { Box, Button, Checkbox, CloseButton, Dialog, Field, Input, Portal, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import useOrderStore from "../store/orderStore";
import { get, isBoolean, keys, mapValues, pickBy } from "lodash";
import { dayTitleMapping, SortDate } from "../utils/renderOrderMenu";

interface UpdateOrderDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
  order: Order | null
  resetOrder: () => void
}

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



const UpdateOrderDialog = ({ isOpenDialog, setOpenDialog, order, resetOrder }: UpdateOrderDialogProps) => {
  const { updateOrder } = useOrderStore()
  const formik = useFormik({
    initialValues: {
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
      mealsGroup: undefined,
      individualMealsGroup: undefined,
      deliveryOrderType: '',
      deliveryOn: {},
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
    validationSchema: Yup.object({
      address: Yup.string().required('Address is required.'),
      preferBreakfast: Yup.boolean(),
      preferLunch: Yup.boolean(),
      preferDinner: Yup.boolean(),
      preferBreakfastSnack: Yup.boolean(),
      preferLunchSnack: Yup.boolean(),
      preferDinnerSnack: Yup.boolean(),
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
          const { preferBreakfast, preferLunch, preferDinner, preferBreakfastSnack, preferLunchSnack, preferDinnerSnack } = this.parent;
          return [preferBreakfast, preferLunch, preferDinner, preferBreakfastSnack, preferLunchSnack, preferDinnerSnack].some(Boolean);
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
    }),
    onSubmit: async (value) => {
      try {
        if (order) {
          await updateOrder(order.id, {
            address: value.address,
            remark: value.remark,
            deliveryRemark: value.deliveryRemark,
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
            individualDelivery: mapValues(value.individualDelivery, day => mapValues(day,
              val => isBoolean(val) ? val : +val) as any)
          })
        }
        SuccessToast("Update Order success")
        setOpenDialog(false)
      } catch (error: any) {
        toast.error('Edit order error,please try again', {
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
    },
  });

  useEffect(() => {
    if (order) {
      formik.setValues({
        address: order.address,
        remark: order.remark,
        preferBreakfast: order.preferBreakfast,
        preferLunch: order.preferLunch,
        preferDinner: order.preferDinner,
        preferBreakfastSnack: order.preferBreakfastSnack,
        preferLunchSnack: order.preferLunchSnack,
        preferDinnerSnack: order.preferDinnerSnack,
        breakfastCount: order.breakfastCount,
        lunchCount: order.lunchCount,
        dinnerCount: order.dinnerCount,
        breakfastSnackCount: order.breakfastSnackCount,
        lunchSnackCount: order.lunchSnackCount,
        dinnerSnackCount: order.dinnerSnackCount,
        individualDelivery: order.individualDelivery,
        deliveryOn: order.deliveryOn,
        deliveryOrderType: order.deliveryOrderType,
        deliveryRemark: order.deliveryRemark,
      } as any)
    }
  }, [])

  const deliveryOrderSection = () => {
    if (order && order.deliveryOrderType === "normal") {
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
    if (order && order.deliveryOrderType === 'individual') {
      const { deliveryOn } = order
      return <Box>
        {
          SortDate.map(day => {
            if (get(deliveryOn, day)) {
              return <Box marginBottom={"20px"}>
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
              </Box>
            }
            return <Box />
          })
        }
        {formik.submitCount > 0 && formik.errors.individualMealsGroup && <div style={{ color: 'red' }}>{formik.errors.individualMealsGroup}</div>}
      </Box>
    }
    return <Box />
  }
  console.log("formik.errors", formik.errors)

  return <Dialog.Root lazyMount open={isOpenDialog} size={"lg"}
    onExitComplete={() => {
      formik.resetForm()
      resetOrder()
    }}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <form onSubmit={formik.handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>Edit Order</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
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
              {order ? <Field.Root marginBottom="15px">
                <Field.Label>การจัดส่ง order {order.deliveryOrderType === 'individual' ? 'มื้อแตกต่างกัน' : 'ส่งปกติ'}</Field.Label>
              </Field.Root> : null}
              {deliveryOrderSection()}
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" type="button" onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger type="button" onClick={() => setOpenDialog(false)}>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
}

export default UpdateOrderDialog