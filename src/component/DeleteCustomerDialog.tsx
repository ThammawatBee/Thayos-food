import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react"
import { Customer } from "../interface/customer"
import SuccessToast from "./SuccessToast";
import useCustomerStore from "../store/customerStore";

interface DeleteCustomerDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
  customer: Customer | null
}



const DeleteCustomerDialog = ({ isOpenDialog, setOpenDialog, customer }: DeleteCustomerDialogProps) => {
  const { deleteCustomer } = useCustomerStore()
  return <Dialog.Root lazyMount open={isOpenDialog} size={"lg"}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>ลบ Customer</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text>คุณต้องการลบ {customer?.name} ออกจากระบบใช่หรือไม่</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            </Dialog.ActionTrigger>
            <Button onClick={async () => {
              if (customer) {
                await deleteCustomer(customer.id)
                SuccessToast("Delete Customer success")

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

export default DeleteCustomerDialog