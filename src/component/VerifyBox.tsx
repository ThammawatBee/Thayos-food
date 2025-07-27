import { types } from "../utils/renderOrderMenu"
import { Bag } from "../interface/bag"
import { getBag, verifyBoxApi } from "../service/thayos-food"
import { Box, Button, Input, Text } from "@chakra-ui/react"
import sortBy from "lodash/sortBy"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import SuccessToast from "./SuccessToast"

interface VerifyBagProps {
  setMode: (value: string) => void
}

const VerifyBag = ({ setMode }: VerifyBagProps) => {
  const [bag, setBag] = useState("")
  const [box, setBox] = useState("")
  const [bagData, setBagData] = useState<Bag | null>(null)
  const inputRef = useRef<HTMLInputElement>(null);
  const indexMap = new Map(types.map((val, idx) => [val.value, idx]));

  const getBagData = async () => {
    try {
      const result = await getBag(bag)
      setBagData(result.bag)
      inputRef.current?.focus();
    } catch (error) {
      let message = ''
      if (error?.status === 404) {
        message = "Bag not found"
      } else {
        message = "Error please try again"
      }
      toast.error(message, {
        style: { color: '#18181B' },
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }

  useEffect(() => {
    if (bag) {
      getBagData()
      // inputRef.current?.focus();
    }
  }, [bag]);

  const callVerify = async (bagId: string, orderItemId: string) => {
    try {
      await verifyBoxApi(bagId, orderItemId)
      SuccessToast("Verify Box success")
      getBagData()
    } catch (error) {
      let message = ''
      if (error?.status === 404) {
        message = error?.data?.message || ''
      } else {
        message = "Error please try again"
      }
      toast.error(message, {
        style: { color: '#18181B' },
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }

  const verify = async () => {
    if (box && bagData) {
      if (bagData.noRemarkType) {
        const filterOrderItemByQrcode = bagData.orderItems.filter(orderItem => orderItem.qrcode === box)
        if (filterOrderItemByQrcode?.length) {
          const filterVerifyOrderItems = filterOrderItemByQrcode.filter(orderItem => !orderItem.inBagStatus)
          if (filterVerifyOrderItems.length) {
            // send [0] to verify
            await callVerify(bagData.id, filterVerifyOrderItems[0].id)
          } else {
            SuccessToast("Box is already in Bag")
            // toast already in box
          }
        }
        else {
          toast.error("Not found Box in Bag", {
            style: { color: '#18181B' },
            position: "top-right",
            autoClose: 3500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
      } else {
        // send [0] to verify
        await callVerify(bagData.id, box)
      }
    }
  }


  useEffect(() => {
    if (box && bagData) {
      verify()
    }
  }, [box])
  return <Box>
    <Button size="sm" onClick={() => {
      setMode("init")
    }}>Back</Button>
    <Box marginTop={"35px"}>
      <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Text textStyle="md">ถุง</Text>
        <Input width={"80%"} value={bag} onChange={e => { setBag(e.currentTarget.value) }} autoFocus />
      </Box>
      <Box marginTop={"30px"} padding={"20px"} minHeight={"200px"} borderWidth="1px">
        {
          bagData ? <Box>
            <Text>จัดส่ง: {bagData.deliveryAt}</Text>
            <Text>ลูกค้า: {bagData.order.customer.fullname}</Text>
            <Text>ที่อยู่: {bagData.address || ''}</Text>
            <Text>Menu</Text>
            {
              sortBy(bagData.orderItems, (item) =>
                indexMap.has(item.type) ? indexMap.get(item.type)! : Infinity).map(orderItem =>
                  <Box display={'flex'}>
                    <Text>- {orderItem.type}</Text> {orderItem.inBagStatus ? <Text marginLeft={"15px"} fontWeight={'medium'} color={'#06B050'}>complete</Text> : ''}
                  </Box>
                )
            }
          </Box> : null
        }
      </Box>
      <Box marginTop={"30px"} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Text textStyle="md">กล่อง</Text>
        <Input ref={inputRef} width={"80%"} value={box} onChange={e => { setBox(e.currentTarget.value) }} />
      </Box>
    </Box>
  </Box>
}

export default VerifyBag