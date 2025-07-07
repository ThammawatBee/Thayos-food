import useAuthStore from '../store/authStore';
import { Box, Text } from '@chakra-ui/react';
import { Link, useLocation } from "react-router-dom"
import Logo from '../assests/image/logo.jpg'
// import AppBarLogo from '../assets/image/AppBar-logo.jpg'
// import useAuthStore from '../store/authStore';

const AppBar = () => {
  const location = useLocation();
  const { profile } = useAuthStore()
  const renderTabText = (pathname: string, text: string) => {
    // eslint-disable-next-line react/jsx-no-undef
    return <Box bg={location.pathname === pathname ? '#1A69AA' : '#2B3E8F'} p={'4'}><Text fontWeight={location.pathname === pathname ? 'bold' : 'normal'}>{text}</Text></Box>
  }
  // const { profile } = useAuthStore()
  return <Box bg='#2B3E8F' width="100%" color="white" display='flex' alignItems='center' height="70px">
    <img src={Logo} style={{ height: "70px", width: "75px" }} />
    <Box marginRight='20px'>
      <Link to="/monitoring-status">{renderTabText('/monitoring-status', 'Monitoring Status')}</Link>
    </Box>
    <Box marginRight='20px'>
      <Link to="/order">{renderTabText('/order', 'Update Order')}</Link>
    </Box>
    <Box marginRight='20px'>
      <Link to="/customer-management">{renderTabText('/customer-management', 'Customer Management')}</Link>
    </Box>
    {profile && profile.role === 'admin' ? <Box marginRight='20px'>
      <Link to="/user-management">{renderTabText('/user-management', 'User Management')}</Link>
    </Box> : null}
    <Box marginRight='20px'>
      <Link to="/calendar">{renderTabText('/calendar', 'Calendar')}</Link>
    </Box>
    <Box marginRight='20px'>
      <Link to="/history">{renderTabText('/history', 'History')}</Link>
    </Box>
    {profile && profile.role === 'admin' ? <Box marginRight='20px'>
      <Link to="/payment">{renderTabText('/payment', 'Payment')}</Link>
    </Box> : null}
    {/* {profile && profile.role === 'admin' ? <Box marginRight='20px'>
      <Link to="/user-management">{renderTabText('/user-management', 'User Management')}</Link>
    </Box> : null} */}
  </Box>
}

export default AppBar