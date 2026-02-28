import { DuplicateOrderItem, GroupBag, OrderItem } from "@/interface/bag"
import { displayMenuDays } from "../utils/renderOrderMenu"
import { Box, Text } from "@chakra-ui/react"
import { DateTime } from "luxon"

interface MenuInDayProps {
  bagData: GroupBag
}

const MenuInDay = ({ bagData }: MenuInDayProps) => {
  const renderOrderItem = (menus: { text: string, type: string }[], orderItems: OrderItem[], duplicateOrderItems: DuplicateOrderItem[]) => {
    return menus.map(menu => {
      const orderItemByType = orderItems.filter(orderItem => orderItem.type === menu.type)
      const duplicateOrderItemByType = duplicateOrderItems.filter(duplicateOrderItem => duplicateOrderItem.type === menu.type)
      const successOrderItem = orderItemByType.filter(orderItem => orderItem.inBagStatus)
      return <Box marginRight={"10px"} display={'flex'}>
        <Text>{menu.text} {orderItemByType.length}</Text>
        <Text marginLeft={"5px"} color={orderItemByType.length === successOrderItem.length + duplicateOrderItemByType.length ? '#06B050' : '#EF5350'}>{`(${successOrderItem.length + duplicateOrderItemByType.length})`}</Text>
      </Box>
    })
  }
  return displayMenuDays.map(day => {
    const menus = bagData?.orderItems?.filter(orderItem => DateTime.fromISO(orderItem.deliveryAt).toFormat('ccc').toUpperCase() === day)
    if (menus?.length) {
      return <Box display={'flex'} marginTop={"20px"}>
        <Box minWidth={"50px"}>
          <Text>
            {day}
          </Text>
        </Box>
        <Box marginLeft={"20px"}>
          <Box display={'flex'} alignItems={'center'}>
            <Box width={"30px"} height={"20px"} border={"1px solid"}></Box>
            <Box display='flex' marginLeft={"20px"}>
              {renderOrderItem([{ type: "breakfast", text: "เช้า" }, { type: "lunch", text: "กลางวัน" }, { type: "dinner", text: "เย็น" }], menus || [], bagData.duplicateOrderItems)}
            </Box>
          </Box>
          <Box display={'flex'} alignItems={'center'}>
            <Box width={"30px"} height={"30px"} border={"1px solid"} borderRadius={"50%"}></Box>
            <Box display='flex' marginLeft={"20px"}>
              {renderOrderItem([{ type: "breakfastSnack", text: "เช้า" }, { type: "lunchSnack", text: "กลางวัน" }, { type: "dinnerSnack", text: "เย็น" }], menus || [], bagData.duplicateOrderItems)}
            </Box>
          </Box>
        </Box>
      </Box>
    }
    return <Box />
  })
}

export default MenuInDay