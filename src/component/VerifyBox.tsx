import { types } from "../utils/renderOrderMenu"
import { GroupBag } from "../interface/bag"
import { getBagQrCode, verifyBoxApi } from "../service/thayos-food"
import { Box, Button, IconButton, Input, Text } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import SuccessToast from "./SuccessToast"
import MenuInDay from "./MenuInday"
import { IoIosClose } from "react-icons/io"

interface VerifyBagProps {
  setMode: (value: string) => void
}

const VerifyBag = ({ setMode }: VerifyBagProps) => {
  const [bag, setBag] = useState("")
  const [box, setBox] = useState("")
  const [bagData, setBagData] = useState<GroupBag | null>(null)
  const inputRef = useRef<HTMLInputElement>(null);
  const bagInputRef = useRef<HTMLInputElement>(null);
  const indexMap = new Map(types.map((val, idx) => [val.value, idx]));

  const getBagData = async () => {
    try {
      const result = await getBagQrCode(bag)
      setBagData(result.bag)
      setBox("")
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

  const callVerify = async (bagQrCode: string, orderItemId: string) => {
    try {
      await verifyBoxApi(bagQrCode, orderItemId)
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
            await callVerify(bagData.qrCode, filterVerifyOrderItems[0].id)
          } else {
            SuccessToast("Box is already in Bag")
            // toast already in box
          }
        }
        else {
          // toast.error("Not found Box in Bag", {
          //   style: { color: '#18181B' },
          //   position: "top-right",
          //   autoClose: 3500,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          //   theme: "light",
          // });
          await callVerify(bagData.qrCode, box)
        }
      } else {
        // send [0] to verify
        await callVerify(bagData.qrCode, box)
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
      <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} textStyle="lg">
        <Box display={'flex'} alignItems={'center'}>
          <Text>ถุง</Text>
          {bagData ? <IconButton marginLeft={'15px'} onClick={() => {
            setBag("")
            setBox("")
            setBagData(null)
            bagInputRef.current?.focus();
          }}>
            <IoIosClose />
          </IconButton> : <Box />}
        </Box>
        <Input fontSize={'lg'} ref={bagInputRef} width={"80%"} value={bag} onChange={e => { setBag(e.currentTarget.value) }} autoFocus />
      </Box>
      <Box marginTop={"30px"} padding={"20px"} minHeight={"200px"} borderWidth="1px">
        {
          bagData ? <Box textStyle="lg">
            <Text>จัดส่ง: {bagData.deliveryAt}</Text>
            <Text>ชื่อ: {bagData.customerName}</Text>
            <Text>ที่อยู่: {bagData.address || ''}</Text>
            <Text>Remark: {bagData.order.remark}</Text>
            <Text>Delivery Remark: {bagData.order.deliveryRemark}</Text>
            {<MenuInDay bagData={bagData} />}
          </Box> : null
        }
      </Box>
      <Box marginTop={"30px"} display={'flex'} alignItems={'center'} justifyContent={'space-between'} textStyle="lg">
        <Text textStyle="lg">กล่อง</Text>
        <Input fontSize={'lg'} ref={inputRef} width={"80%"} value={box} onChange={e => { setBox(e.currentTarget.value) }} />
      </Box>
    </Box>
  </Box>
}

export default VerifyBag