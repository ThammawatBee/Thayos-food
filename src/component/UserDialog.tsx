import { Button, CloseButton, Dialog, Field, Input, NativeSelect, Portal } from "@chakra-ui/react"
import * as Yup from 'yup';
import { useFormik } from "formik"
import { toast } from "react-toastify"
import { ServiceError } from "../interface/Error"
import useUserStore from "../store/userStore";
import SuccessToast from "./SuccessToast";
import { User } from "../interface/user";
import { useEffect } from "react";
interface UserDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
  user: User | null
  resetUser: () => void
}


const UserDialog = ({ isOpenDialog, setOpenDialog, user, resetUser }: UserDialogProps) => {
  const { createUser, editUser } = useUserStore()

  const formik = useFormik({
    initialValues: {
      userCode: '',
      name: '',
      password: '',
      role: '',
    },
    validationSchema: Yup.object({
      userCode: Yup.string().required('UserCode is required.'),
      name: Yup.string().required('Name is required.'),
      password: Yup.string().required('Password is required.'),
      role: Yup.string().required('Role is required.'),
    }),
    onSubmit: async (value) => {
      if (user) {
        try {
          editUser(user.id, {
            name: value.name,
            role: value.role,
            password: value.password
          })
          SuccessToast("Edit User success")
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
          await createUser({
            ...value,
          })
          SuccessToast("Create User success")
          setOpenDialog(false)
        } catch (error: any) {
          const errorData = error.data as ServiceError
          if (errorData.errorKey === 'USERCODE_IS_ALREADY_EXIST') {
            toast.error('UserCode is already exist', {
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
            toast.error('Create or edit user error,please try again', {
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
  });

  useEffect(() => {
    if (user) {
      formik.setValues({
        userCode: user.userCode,
        name: user.name,
        role: user.role,
        password: '',
      })
    }
  }, [user])
  return <Dialog.Root lazyMount open={isOpenDialog} size={"lg"}
    onExitComplete={() => {
      formik.resetForm()
      resetUser()
    }}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <form onSubmit={formik.handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>{user ? 'Edit User' : 'Add new User'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.userCode && !!formik.errors.userCode}>
                <Field.Label>UserCode</Field.Label>
                <Input disabled={!!user} value={formik?.values?.userCode} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("userCode", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.userCode}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.name && !!formik.errors.name}>
                <Field.Label>Name</Field.Label>
                <Input value={formik?.values?.name} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("name", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.name}</Field.ErrorText>
              </Field.Root>
              <Field.Root marginBottom="15px" invalid={!!formik.touched.role && !!formik.errors.role}>
                <Field.Label>Role</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    placeholder="Select role"
                    onBlur={formik.handleBlur}
                    onChange={(e) => formik.setFieldValue("role", e.currentTarget.value)}
                    name="role"
                    value={formik.values.role}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="checker">Checker</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Field.ErrorText>{formik.errors.role}</Field.ErrorText>
              </Field.Root>
              <Field.Root invalid={!!formik.touched.password && !!formik.errors.password}>
                <Field.Label>Password</Field.Label>
                <Input value={formik?.values?.password} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("password", e.currentTarget.value) }} />
                <Field.ErrorText>{formik.errors.password}</Field.ErrorText>
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button disabled={formik.isSubmitting} variant="outline" type="button" onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button loading={formik.isSubmitting} type="submit">Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger disabled={formik.isSubmitting} type="button" onClick={() => setOpenDialog(false)}>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
}

export default UserDialog