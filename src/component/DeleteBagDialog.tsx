import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react"
import SuccessToast from "./SuccessToast";
import { Bag } from "../interface/bag";
import useBagStore from "../store/bagStore";

interface DeleteBagDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
  bag: Bag | null
  resetBag: () => void
}



const DeleteBagDialog = ({ isOpenDialog, setOpenDialog, bag, resetBag }: DeleteBagDialogProps) => {
  console.log('bag', bag)
  const { deleteBag } = useBagStore()
  return <Dialog.Root lazyMount open={isOpenDialog} size={"lg"} onExitComplete={() => {
    resetBag()
  }}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>ลบ Bag</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text>คุณต้องการลบ Bag ส่งวันที่ {bag?.deliveryAt} ของ {bag?.order.customer.fullname} ออกจากระบบใช่หรือไม่</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            </Dialog.ActionTrigger>
            <Button onClick={async () => {
              if (bag) {
                await deleteBag(bag.id)
                SuccessToast("Delete Bag success")

                setOpenDialog(false)
              }
            }}>Submit</Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger onClick={() => setOpenDialog(false)}>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root >
}

export default DeleteBagDialog