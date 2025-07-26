import { Bag } from "../../interface/bag";
import { Box, Text } from "@chakra-ui/react"
import { QRCodeSVG } from 'qrcode.react';
import { DateTime } from 'luxon'
import "./PrintBag.css";
import { renderMenu } from "../../utils/renderOrderMenu";

export const BagData = ({ bag }: { bag: Bag }) => {
  return <Box padding={'6px'}>
    <Box display={'flex'} justifyContent={'center'}>
      <QRCodeSVG value={bag.id} size={35} />
    </Box>
    <Text fontSize={"6px"} textAlign={'center'} fontWeight={'bold'}>{bag.basket || ''}</Text>
    <Text fontSize={"6px"} fontWeight={'bold'}>{DateTime.fromISO(bag.deliveryAt).toFormat('dd/MM/yyyy')}</Text>
    <Text fontSize={"6px"}>{bag.order.customer.customerCode} {bag.order.customer.fullname}</Text>
    <Text fontSize={"6px"}>Remark: {bag.order.remark || '-'}</Text>
    <Text fontSize={"6px"}>{renderMenu(bag)}</Text>
    <Text fontSize={"6px"}>ที่อยู่: {bag.order.address}</Text>
    <Text fontSize={"6px"}>เวลาจัดส่ง: {DateTime.fromFormat(bag.order.deliveryTime, "HH:mm:ss").toFormat("HH:mm")}</Text>
  </Box>
}

const PrintBag = ({ componentPrintRef, bag }:
  { componentPrintRef: HTMLElement, bag: Bag | null }) => {
  return <Box ref={componentPrintRef} background={'white'}>
    {bag ? <BagData bag={bag} /> : null}
  </Box>
}

export default PrintBag