import useAuthStore from "../store/authStore";
import AppBar from "../component/AppBar";
import { Box, Text } from "@chakra-ui/react"
import { Link } from "react-router-dom";

const HomePage = () => {
  const { profile } = useAuthStore()
  return <Box>
    <AppBar />
    <Box display='flex' justifyContent='flex-end'>
    </Box>
    <Box marginTop={'40px'} display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
      <Text textStyle="3xl" fontWeight="bold">Select Menu</Text>
      <Box display='flex' alignItems='center' justifyContent='center' marginTop={'30px'}>
        <Box marginRight={"50px"}>
          <Link to="/equipment">
            <Box display="flex" alignItems='center' justifyContent='center' borderColor="black" borderWidth="1px" width={'200px'} height={'200px'} background={'white'} borderRadius="20px"
            // _hover={{ background: '#F4F4F5' }}
            >
              {/* <img src={Equipment} style={{ width: '160xp', height: '160px' }} /> */}
            </Box>
          </Link>
          <Text textAlign='center' textStyle="lg" marginTop={'15px'}>Monitoring Status</Text>
        </Box>
        <Box marginRight={"50px"}>
          <Link to="/inspection">
            <Box display="flex" alignItems='center' justifyContent='center' borderColor="black" borderWidth="1px" width={'200px'} height={'200px'} background={'white'} borderRadius="20px"
            // _hover={{ background: '#F4F4F5' }}
            >
              {/* <img src={Inspection} style={{ width: '160xp', height: '160px' }} /> */}
            </Box>
          </Link>
          <Text textAlign='center' textStyle="lg" marginTop={'15px'}>Update Order</Text>
        </Box>
        <Box>
          <Link to="/report">
            <Box display="flex" alignItems='center' justifyContent='center' borderColor="black" borderWidth="1px" width={'200px'} height={'200px'} background={'white'} borderRadius="20px"
            // _hover={{ background: '#F4F4F5' }}
            >
              {/* <img src={Report} style={{ width: '160xp', height: '160px' }} /> */}
            </Box>
          </Link>
          <Text textAlign='center' textStyle="lg" marginTop={'15px'}>Customer Management</Text>
        </Box>
      </Box>
      <Box display='flex' alignItems='center' justifyContent='center' marginTop={'30px'}>
        <Box marginRight={"50px"}>
          <Link to="/equipment">
            <Box display="flex" alignItems='center' justifyContent='center' borderColor="black" borderWidth="1px" width={'200px'} height={'200px'} background={'white'} borderRadius="20px"
            // _hover={{ background: '#F4F4F5' }}
            >
              {/* <img src={Equipment} style={{ width: '160xp', height: '160px' }} /> */}
            </Box>
          </Link>
          <Text textAlign='center' textStyle="lg" marginTop={'15px'}>Set up Calendar</Text>
        </Box>
        {profile && profile.role === 'admin' ? <Box marginRight={"50px"}>
          <Link to="/user-management">
            <Box display="flex" alignItems='center' justifyContent='center' borderColor="black" borderWidth="1px" width={'200px'} height={'200px'} background={'white'} borderRadius="20px"
            // _hover={{ background: '#F4F4F5' }}
            >
              {/* <img src={Inspection} style={{ width: '160xp', height: '160px' }} /> */}
            </Box>
          </Link>
          <Text textAlign='center' textStyle="lg" marginTop={'15px'}>User Management</Text>
        </Box> : null}
        <Box>
          <Link to="/report">
            <Box display="flex" alignItems='center' justifyContent='center' borderColor="black" borderWidth="1px" width={'200px'} height={'200px'} background={'white'} borderRadius="20px"
            // _hover={{ background: '#F4F4F5' }}
            >
              {/* <img src={Report} style={{ width: '160xp', height: '160px' }} /> */}
            </Box>
          </Link>
          <Text textAlign='center' textStyle="lg" marginTop={'15px'}>History</Text>
        </Box>
      </Box>
    </Box>
  </Box>
}

export default HomePage