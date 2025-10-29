import useAuthStore from '../store/authStore';
import { JSX, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Spinner, Text } from "@chakra-ui/react"


const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { getProfile, profile } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation();
  const checkAuth = async () => {
    if (!profile) {
      try {
        await getProfile()
      } catch (err) {
        navigate('/login', { replace: true })
      }
    }
  };
  useEffect(() => {
    checkAuth();
  }, [])

  const adminPrivatePath = ['/user-management', '/payment', '/verify']

  useEffect(() => {
    if (profile && profile.role === 'user' && adminPrivatePath.includes(location.pathname)) {
      navigate('/', { replace: true })
    }
    if (profile && profile.role === 'checker') {
      navigate('/verify', { replace: true })
    }
  }, [profile, location?.pathname])


  if (profile === null) {
    <Box height={"90vh"} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
      <Box>
        <Spinner size="xl" borderWidth="2px" />
      </Box>
      <Box marginTop={"15px"}>
        <Text textStyle={'md'} fontWeight='medium'>Loading...</Text>
      </Box>
    </Box>
  }

  return <div>
    {children}
  </div>;
}

export default PrivateRoute