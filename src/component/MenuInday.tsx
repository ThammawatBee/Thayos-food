import { GroupBag, OrderItem } from "@/interface/bag"
import { displayMenuDays } from "../utils/renderOrderMenu"
import { Box, Text } from "@chakra-ui/react"
import { DateTime } from "luxon"

interface MenuInDayProps {
  bagData: GroupBag
}

const MenuInDay = ({ bagData }: MenuInDayProps) => {
  const renderOrderItem = (menus: { text: string, type: string }[], orderItems: OrderItem[]) => {
    return menus.map(menu => {
      const orderItemByType = orderItems.filter(orderItem => orderItem.type === menu.type)
      const alreadyInBagCount = orderItemByType.filter(orderItem => orderItem.inBagStatus)
      return <Box marginRight={"10px"}>
        <Text color={alreadyInBagCount.length === orderItemByType.length ? '#06B050' : '#EF5350'}>{menu.text} {orderItemByType.length}</Text>
      </Box>
    })
  }
  return displayMenuDays.map(day => {
    const menus = bagData?.orderItems?.filter(orderItem => DateTime.fromISO(orderItem.deliveryAt).toFormat('ccc').toUpperCase() === day)
    const backgroundInSymbol = (types: string[]) => {
      const orderItemGroupByType = menus.filter(orderItem => types.includes(orderItem.type))
      const alreadyInBagCount = orderItemGroupByType.filter(orderItem => orderItem.inBagStatus)
      return orderItemGroupByType.length === alreadyInBagCount.length ? '#06B050' : '#EF5350'
    }
    if (menus?.length) {
      return <Box display={'flex'} marginTop={"20px"}>
        <Box minWidth={"50px"}>
          <Text>
            {day}
          </Text>
        </Box>
        <Box marginLeft={"20px"}>
          <Box display={'flex'} alignItems={'center'}>
            <Box width={"30px"} height={"20px"} border={"1px solid"} background={backgroundInSymbol(["breakfast", "lunch", "dinner"])}></Box>
            <Box display='flex' marginLeft={"20px"}>
              {renderOrderItem([{ type: "breakfast", text: "เช้า" }, { type: "lunch", text: "กลางวัน" }, { type: "dinner", text: "เย็น" }], menus || [])}
            </Box>
          </Box>
          <Box display={'flex'} alignItems={'center'}>
            <Box width={"30px"} height={"20px"} border={"1px solid"} borderRadius={"50%"} background={backgroundInSymbol(["breakfastSnack", "lunchSnack", "dinnerSnack"])}></Box>
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

export default MenuInDay