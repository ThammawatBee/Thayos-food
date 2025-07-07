import { Box, Input, Field, Button, } from "@chakra-ui/react"
// import Logo from '../assets/image/logo.jpg'
import * as Yup from 'yup';
import { useFormik } from "formik"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react";
import { login } from "../service/thayos-food";
import useAuthStore from "../store/authStore";
import Logo from '../assests/image/logo.jpg'

const LoginPage = () => {
  const navigate = useNavigate();
  const { getProfile } = useAuthStore()

  const checkAuth = async () => {
    try {
      await getProfile()
      navigate("/")
    } catch (err) {
      navigate('/login', { replace: true })
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      checkAuth()
    }
  }, [])

  const formik = useFormik({
    initialValues: {
      userCode: '',
      password: '',
    },
    validationSchema: Yup.object({
      userCode: Yup.string().required('User Code is required.'),
      password: Yup.string().required('Password is required.'),
    }),
    onSubmit: async (value) => {
      try {
        const response = await login({
          ...value,
        })
        localStorage.setItem('accessToken', response.access_token)
        // localStorage.setItem('expiresAt', response.expiresAt.toString())
        navigate("/")
        toast.success("Login success", {
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
      } catch (error: any) {
        toast.error('Invalid username password,please try again', {
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

  return <Box height={'90vh'} display='flex' alignItems='center' justifyContent='center'>
    <form onSubmit={formik.handleSubmit}>
      <Box shadow={'0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -2px rgba(0, 0, 8, .1)'} width="400px" padding="20px" border={"1px solid #ECECEC"} borderRadius="10px">
        <Box display={'flex'} justifyContent={'center'}>
          <img src={Logo} style={{ height: "125px", width: "125px" }} alt="logo"/>
        </Box>
        <Field.Root marginTop={"25px"} invalid={!!formik.touched.userCode && !!formik.errors.userCode}>
          <Field.Label>User Code</Field.Label>
          <Input value={formik?.values?.userCode} onBlur={formik.handleBlur} onChange={e => { formik.setFieldValue("userCode", e.currentTarget.value) }} />
          <Field.ErrorText>{formik.errors.userCode}</Field.ErrorText>
        </Field.Root>
        <Field.Root marginTop={"25px"} invalid={!!formik.touched.password && !!formik.errors.password}>
          <Field.Label>Password</Field.Label>
          <Input value={formik?.values?.password} type="password" onChange={e => { formik.setFieldValue("password", e.currentTarget.value) }} />
          <Field.ErrorText>{formik.errors.password}</Field.ErrorText>
        </Field.Root>
        <Button marginTop={"25px"} width="100%" type="submit">Login</Button>
      </Box>
    </form>
  </Box>
}

export default LoginPage