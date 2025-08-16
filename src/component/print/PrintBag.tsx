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
        <Text>{menu.text} {orderItemByType.length}</Text>
      </Box>
    })
  }

  const renderOrderMenu = () => {
    return displayMenuDays.map(day => {
      const menus = bag?.orderItems?.filter(orderItem => DateTime.fromISO(orderItem.deliveryAt).toFormat('ccc').toUpperCase() === day)
      if (menus?.length) {
        return <Box display={'flex'} marginTop={"5px"} fontSize={"6px"}>
          <Box minWidth={"20px"}>
            <Text>
              {day}
            </Text>
          </Box>
          <Box marginLeft={"10px"}>
            <Box display={'flex'} alignItems={'center'}>
              <Box width={"10px"} height={"5px"} border={"1px solid"}></Box>
              <Box display='flex' marginLeft={"20px"}>
                {renderOrderItem([{ type: "breakfast", text: "เช้า" }, { type: "lunch", text: "กลางวัน" }, { type: "dinner", text: "เย็น" }], bag?.orderItems || [])}
              </Box>
            </Box>
            <Box display={'flex'} alignItems={'center'}>
              <Box width={"10px"} height={"5px"} border={"1px solid"} borderRadius={"50%"}></Box>
              <Box display='flex' marginLeft={"20px"}>
                {renderOrderItem([{ type: "breakfastSnack", text: "เช้า" }, { type: "lunchSnack", text: "กลางวัน" }, { type: "dinnerSnack", text: "เย็น" }], bag?.orderItems || [])}
              </Box>
            </Box>
          </Box>
        </Box>
      }
      return <Box />
    })
  }

  return <Box padding={'6px'}>
    <Box display={'flex'} justifyContent={'center'}>
      <QRCodeSVG value={bag.qrCode} size={45} />
    </Box>
    <Text fontSize={"6px"}>ส่งวันที่ {bag.deliveryAt}</Text>
    <Text fontSize={"6px"}>ชื่อ {bag.order.customer.fullname}</Text>
    <Text fontSize={"6px"}>ที่อยู่: {bag.address}</Text>
    <Text fontSize={"6px"}>Remark: {bag.order.remark || '-'}</Text>
    <Text fontSize={"6px"}>Delivery Remark: {bag.order.deliveryRemark || '-'}</Text>
    {renderOrderMenu()}
  </Box>
}

const PrintBag = ({ componentPrintRef, bag }:
  { componentPrintRef: HTMLElement, bag: GroupBag | null }) => {
  return <Box ref={componentPrintRef} background={'white'} className="print-bag">
    {bag ? <BagData bag={bag} /> : null}
  </Box>
}

export default PrintBag