import OrderDialog from "../component/OrderDialog"
import AppBar from "../component/AppBar"
import { Box, Button, Text } from "@chakra-ui/react"
import { useState } from "react"

const OrderPage = () => {
  const [openModal, setOpenModal] = useState(false)
  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      <Text marginBottom={"20px"} textStyle={'xl'} color={'#1A69AA'} fontWeight='bold'>Order Management</Text>
      <Box marginTop="20px" display='flex' justifyContent='flex-end'>
        <Button background={'#385723'}
          onClick={() => setOpenModal(true)}
        >Add new Order</Button>
      </Box>
    </Box>
    <OrderDialog isOpenDialog={openModal} setOpenDialog={setOpenModal} />
  </Box>
}
export default OrderPage