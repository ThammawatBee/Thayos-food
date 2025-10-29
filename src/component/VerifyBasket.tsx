import { types } from "../utils/renderOrderMenu"
import { GroupBag } from "../interface/bag"
import { getBagQrCode, verifyBagApi } from "../service/thayos-food"
import { Box, Button, IconButton, Input, Text } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import SuccessToast from "./SuccessToast"
import MenuInDay from "./MenuInday"
import { IoIosClose } from "react-icons/io"

interface VerifyBasketProps {
  setMode: (value: string) => void
}

const VerifyBasket = ({ setMode }: VerifyBasketProps) => {
  const [bag, setBag] = useState("")
  const [basket, setBasket] = useState("")
  const [bagData, setBagData] = useState<GroupBag | null>(null)
  const inputRef = useRef<HTMLInputElement>(null);
  const bagInputRef = useRef<HTMLInputElement>(null);
  const indexMap = new Map(types.map((val, idx) => [val.value, idx]));

  const getBagData = async () => {
    try {
      const result = await getBagQrCode(bag)
      setBagData(result.bag)
      setBasket("")
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

  const verify = async () => {
    if (basket && bagData) {
      try {
        await verifyBagApi(bagData.qrCode, basket)
        SuccessToast("Verify Bag success")
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
  }


  useEffect(() => {
    if (basket && bagData) {
      verify()
    }
  }, [basket])
  return <Box>
    <Button size="sm" onClick={() => {
      setMode("init")
    }}>Back</Button>
    <Box marginTop={"35px"}>
      <Box textStyle="lg" display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Box display={'flex'} alignItems={'center'}>
          <Text textStyle="lg">ถุง</Text>
          {bagData ? <IconButton marginLeft={'15px'} onClick={() => {
            setBag("")
            setBagData(null)
            setBasket("")
            bagInputRef.current?.focus();
          }}>
            <IoIosClose />
          </IconButton> : <Box />}
        </Box>
        <Input ref={bagInputRef} fontSize={'lg'} width={"80%"} value={bag} onChange={e => { setBag(e.currentTarget.value) }} autoFocus />
      </Box>
      <Box textStyle="lg" marginTop={"30px"} padding={"20px"} minHeight={"200px"} borderWidth="1px">
        {
          bagData ? <Box>
            <Box display={'flex'}>
              <Text>สถานะ: </Text>{bagData.inBasketStatus ? <Text marginLeft={"15px"} fontWeight={'medium'} color={'#06B050'}>เสร็จสิ้น</Text> : <Text marginLeft={"15px"} fontWeight={'medium'} color={'#EF5350'}>รอดำเนินการ</Text>}
            </Box>
            <Text>จัดส่ง: {bagData.deliveryAt}</Text>
            <Text>ชื่อ: {bagData.customerName}</Text>
            <Text>ที่อยู่: {bagData.address || ''}</Text>
            <Text>Remark: {bagData.order.remark}</Text>
            <Text>Delivery Remark: {bagData.order.deliveryRemark}</Text>
            {<MenuInDay bagData={bagData} />}
          </Box> : null
        }
      </Box>
      <Box textStyle="lg" marginTop={"30px"} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Text textStyle="lg">Basket</Text>
        <Input fontSize={'lg'} ref={inputRef} width={"80%"} value={basket} onChange={e => { setBasket(e.currentTarget.value) }} />
      </Box>
    </Box>
  </Box>
}

export default VerifyBasket