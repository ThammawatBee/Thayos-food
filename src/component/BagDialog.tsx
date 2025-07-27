import { Box, Button, Checkbox, CloseButton, Dialog, Field, Input, Portal } from "@chakra-ui/react"
import { Bag } from "../interface/bag"
import { useFormik } from "formik"
import * as Yup from 'yup';
import { toast } from "react-toastify";
import { ServiceError } from "../interface/Error";
import SuccessToast from "./SuccessToast";
import { useEffect } from "react";
import useBagStore from "../store/bagStore"

interface BagDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
  bag: Bag | null
  resetBag: () => void
}



const BagDialog = ({ isOpenDialog, setOpenDialog, bag, resetBag }: BagDialogProps) => {
  const { updateBag } = useBagStore()
  const formik = useFormik({
    initialValues: {
      address: '',
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
      mealsGroup: Yup.mixed().test(
        'at-least-one-meal',
        'At least one meal must be selected',
        function () {
          const { preferBreakfast, preferLunch, preferDinner, preferBreakfastSnack, preferLunchSnack, preferDinnerSnack } = this.parent;
          return [preferBreakfast, preferLunch, preferDinner, preferBreakfastSnack, preferLunchSnack, preferDinnerSnack].some(Boolean);
        }
      ),
    }),
    onSubmit: async (value) => {
      try {
        if (bag) {
          await updateBag(bag.id, {
            address: value.address,
            breakfast: value.preferBreakfast ? +value.breakfastCount : 0,
            lunch: value.preferLunch ? +value.lunchCount : 0,
            dinner: value.preferDinner ? +value.dinnerCount : 0,
            breakfastSnack: value.preferBreakfastSnack ? +value.breakfastSnackCount : 0,
            lunchSnack: value.preferLunchSnack ? +value.lunchSnackCount : 0,
            dinnerSnack: value.preferDinnerSnack ? +value.dinnerSnackCount : 0,
          })
        }
        SuccessToast("Update Bag success")
        setOpenDialog(false)
      } catch (error: any) {
        toast.error('Edit bag error,please try again', {
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

  const getMenuCount = (bag: Bag, type: string) => {
    const items = bag.orderItems.filter(item => item.type === type)
    return items.length
  }

  useEffect(() => {
    if (bag) {
      formik.setValues({
        address: bag.address,
        preferBreakfast: !!getMenuCount(bag, 'breakfast'),
        preferLunch: !!getMenuCount(bag, 'lunch'),
        preferDinner: !!getMenuCount(bag, 'dinner'),
        preferBreakfastSnack: !!getMenuCount(bag, 'breakfastSnack'),
        preferLunchSnack: !!getMenuCount(bag, 'lunchSnack'),
        preferDinnerSnack: !!getMenuCount(bag, 'dinnerSnack'),
        breakfastCount: getMenuCount(bag, 'breakfast'),
        lunchCount: getMenuCount(bag, 'lunch'),
        dinnerCount: getMenuCount(bag, 'dinner'),
        breakfastSnackCount: getMenuCount(bag, 'breakfastSnack'),
        lunchSnackCount: getMenuCount(bag, 'lunchSnack'),
        dinnerSnackCount: getMenuCount(bag, 'dinnerSnack'),
      } as any)
    }
  }, [bag])


  return <Dialog.Root lazyMount open={isOpenDialog} size={"lg"}
    onExitComplete={() => {
      formik.resetForm()
      resetBag()
    }}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <form onSubmit={formik.handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>Edit Bag</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.address && !!formik.errors.address}>
                <Field.Label>Address</Field.Label>
                <Input value={formik?.values?.address} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("address", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.address}</Field.ErrorText>
              </Field.Root>
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

export default BagDialog