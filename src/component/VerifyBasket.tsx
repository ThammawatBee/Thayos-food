import { displayMenu, types } from "../utils/renderOrderMenu"
import { Bag } from "../interface/bag"
import { getBag, verifyBagApi, verifyBoxApi } from "../service/thayos-food"
import { Box, Button, Input, Text } from "@chakra-ui/react"
import sortBy from "lodash/sortBy"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import SuccessToast from "./SuccessToast"

interface VerifyBasketProps {
  setMode: (value: string) => void
}

const VerifyBasket = ({ setMode }: VerifyBasketProps) => {
  const [bag, setBag] = useState("")
  const [basket, setBasket] = useState("")
  const [bagData, setBagData] = useState<Bag | null>(null)
  const inputRef = useRef<HTMLInputElement>(null);
  const indexMap = new Map(types.map((val, idx) => [val.value, idx]));

  const getBagData = async () => {
    try {
      const result = await getBag(bag)
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
        await verifyBagApi(bagData.id, basket)
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
        <Text textStyle="lg">ถุง</Text>
        <Input fontSize={'lg'} width={"80%"} value={bag} onChange={e => { setBag(e.currentTarget.value) }} autoFocus />
      </Box>
      <Box textStyle="lg" marginTop={"30px"} padding={"20px"} minHeight={"200px"} borderWidth="1px">
        {
          bagData ? <Box>
            <Box display={'flex'}>
              <Text>สถานะ: </Text>{bagData.inBasketStatus ? <Text marginLeft={"15px"} fontWeight={'medium'} color={'#06B050'}>เสร็จสิ้น</Text> : <Text marginLeft={"15px"} fontWeight={'medium'} color={'#EF5350'}>รอดำเนินการ</Text>}
            </Box>
            <Text>จัดส่ง: {bagData.deliveryAt}</Text>
            <Text>ลูกค้า: {bagData.order.customer.fullname}</Text>
            <Text>ที่อยู่: {bagData.address || ''}</Text>
            <Text marginTop={'25px'}>Menu</Text>
            {
              sortBy(bagData.orderItems, (item) =>
                indexMap.has(item.type) ? indexMap.get(item.type)! : Infinity).map(orderItem =>
                  <Box display={'flex'}>
                    <Text>- {displayMenu(orderItem.type)}</Text> {orderItem.inBagStatus ? <Text marginLeft={"15px"} fontWeight={'medium'} color={'#06B050'}>เสร็จสิ้น</Text> : ''}
                  </Box>
                )
            }
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