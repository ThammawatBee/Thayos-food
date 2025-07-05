import OrderDialog from "../component/OrderDialog"
import AppBar from "../component/AppBar"
import { Box, Button, Text } from "@chakra-ui/react"
import { useState } from "react"
// import { downloadOrderSlip } from "../service/thayos-food"

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
      {/* <Button onClick={async () => {
        const response = await downloadOrderSlip('aa5b386d-bf88-48b9-912c-42ce175ea37f')
        const url = window.URL.createObjectURL(new Blob([response as any]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'download.jpg');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }}>download</Button> */}
    </Box>
    <OrderDialog isOpenDialog={openModal} setOpenDialog={setOpenModal} />
  </Box>
}
export default OrderPage