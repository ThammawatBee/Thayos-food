import useAuthStore from '../store/authStore';
import { JSX, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Spinner, Text } from "@chakra-ui/react"


const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { getProfile, profile } = useAuthStore()
  const navigate = useNavigate()
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