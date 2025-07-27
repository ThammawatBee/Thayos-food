import { Bag, OrderItem } from "../../interface/bag";
import { Box, Text } from "@chakra-ui/react"
import { QRCodeSVG } from 'qrcode.react';
import { DateTime } from 'luxon'
import "./PrintBag.css";

export const BoxData = ({ bag, orderItem }: { bag: Bag, orderItem: OrderItem }) => {
  return <Box padding={'6px'}>
    <Box display={'flex'} justifyContent={'center'}>
      <QRCodeSVG value={bag.noRemarkType ? orderItem.qrcode : orderItem.id} size={35} />
    </Box>
    <Text fontSize={"6px"} fontWeight={'bold'}>{DateTime.fromISO(bag.deliveryAt).toFormat('dd/MM/yyyy')}</Text>
    <Text fontSize={"6px"}>{bag.order.customer.customerCode} {bag.order.customer.fullname}</Text>
    <Text fontSize={"6px"}>Remark: {bag.order.remark || '-'}</Text>
    <Text fontSize={"6px"}>Delivery Remark: {bag.order.deliveryRemark || '-'}</Text>
    <Text fontSize={"6px"}>{orderItem.type}</Text>
    <Text fontSize={"6px"}>ที่อยู่: {bag.address}</Text>
    <Text fontSize={"6px"}>เวลาจัดส่ง: {DateTime.fromFormat(bag.order.deliveryTime, "HH:mm:ss").toFormat("HH:mm")}</Text>
  </Box>
}

const PrintBox = ({ componentPrintRef, bag, orderItem }:
  { componentPrintRef: HTMLElement, bag: Bag | null, orderItem: OrderItem | null }) => {
  return <Box ref={componentPrintRef} background={'white'}>
    {bag && orderItem ? <BoxData bag={bag} orderItem={orderItem} /> : null}
  </Box>
}

export default PrintBox