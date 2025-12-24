import { GroupBag, OrderItem } from "../../interface/bag";
import { Box, Text } from "@chakra-ui/react"
import { QRCodeSVG } from 'qrcode.react';
import { displayMenuDays } from "../../utils/renderOrderMenu";
import { DateTime } from "luxon";

export const BagData = ({ bag }: { bag: GroupBag }) => {
  const renderOrderItem = (menus: { text: string, type: string }[], orderItems: OrderItem[]) => {
    return menus.map(menu => {
      const orderItemByType = orderItems.filter(orderItem => orderItem.type === menu.type)
      return <Box marginRight={"10px"}>
        <Text fontSize={"13px"}>{menu.text} {orderItemByType.length}</Text>
      </Box>
    })
  }

  const renderOrderMenu = () => {
    return displayMenuDays.map(day => {
      const menus = bag?.orderItems?.filter(orderItem => DateTime.fromISO(orderItem.deliveryAt).toFormat('ccc').toUpperCase() === day)
      if (menus?.length) {
        return <Box display={'flex'} marginTop={"5px"}>
          <Box minWidth={"30px"}>
            <Text fontSize={"13px"}>
              {day}
            </Text>
          </Box>
          <Box marginLeft={"10px"}>
            <Box display={'flex'} alignItems={'center'}>
              <Box width={"20px"} height={"10px"} border={"1px solid"}></Box>
              <Box display='flex' marginLeft={"20px"}>
                {renderOrderItem([{ type: "breakfast", text: "เช้า" }, { type: "lunch", text: "กลางวัน" }, { type: "dinner", text: "เย็น" }], menus || [])}
              </Box>
            </Box>
            <Box display={'flex'} alignItems={'center'}>
              <Box width={"20px"} height={"20px"} border={"1px solid"} borderRadius={"50%"}></Box>
              <Box display='flex' marginLeft={"20px"}>
                {renderOrderItem([{ type: "breakfastSnack", text: "เช้า" }, { type: "lunchSnack", text: "กลางวัน" }, { type: "dinnerSnack", text: "เย็น" }], menus || [])}
              </Box>
            </Box>
          </Box>
        </Box>
      }
      return <Box />
    })
  }

  return <Box padding={'6px'}>
    <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
      <Text fontWeight={'semibold'} fontSize={'35px'} marginRight={"15px"}>{bag.order.type === "HEALTHY" ? 'H' : 'D'}</Text>
      <QRCodeSVG value={bag.qrCode} size={50} />
      {bag.basket ? <Box marginLeft={'10px'}>
        <Text fontSize={'20px'}>ตะกร้า:{bag.basket}</Text>
      </Box> : <Box />}
    </Box>
    <Text fontSize={"13px"}>ส่งวันที่ {bag.deliveryAt}</Text>
    <Text fontSize={"13px"}>ชื่อ {bag.order.customer.fullname}</Text>
    <Text fontSize={"13px"}>ที่อยู่: {bag.address}</Text>
    <Text fontSize={"13px"}>Delivery Time: {bag.order.deliveryTime} - {bag.order.deliveryTimeEnd}</Text>
    <Text fontSize={"13px"}>Remark: {bag.order.remark}</Text>
    <Text fontSize={"13px"}>Delivery Remark: {bag.order.deliveryRemark}</Text>
    {renderOrderMenu()}
  </Box >
}

const PrintBag = ({ componentPrintRef, bag }:
  { componentPrintRef: HTMLElement, bag: GroupBag | null }) => {
  return <Box ref={componentPrintRef} background={'white'} className="print-bag">
    {bag ? <BagData bag={bag} /> : null}
  </Box>
}

export default PrintBag