import { Bag, OrderItem } from "../../interface/bag";
import { Box, Text } from "@chakra-ui/react"
import { QRCodeSVG } from 'qrcode.react';
import { DateTime } from 'luxon'
import { types } from "../../utils/renderOrderMenu";

export const BoxData = ({ bag, orderItem }: { bag: Bag, orderItem: OrderItem }) => {
  const renderMenuText = () => {
    const type = types.find(type => type?.value === orderItem.type)
    return type?.text || ''
  }
  return <Box padding={'6px'}>
    <Box display={'flex'} justifyContent={'center'}>
      <Text fontWeight={'semibold'} fontSize={'30px'} marginRight={"15px"}>{bag.order.type === "HEALTHY" ? 'H' : 'D'}</Text>
      <QRCodeSVG value={bag.noRemarkType ? orderItem.qrcode : orderItem.id} size={45} />
    </Box>
    <Text fontSize={"6.5px"}>{DateTime.fromISO(bag.deliveryAt).toFormat('ccc').toUpperCase()} {renderMenuText()}</Text>
    <Text fontSize={"6.5px"}>ชื่อ {bag.order.customer.fullname}</Text>
    <Text fontSize={"6.5px"}>Remark: {bag.order.remark || '-'}</Text>
  </Box>
}

const PrintBox = ({ componentPrintRef, bag, orderItem }:
  { componentPrintRef: HTMLElement, bag: Bag | null, orderItem: OrderItem | null }) => {
  return <Box ref={componentPrintRef} background={'white'} className="print-box">
    {bag && orderItem ? <BoxData bag={bag} orderItem={orderItem} /> : null}
  </Box>
}

export default PrintBox