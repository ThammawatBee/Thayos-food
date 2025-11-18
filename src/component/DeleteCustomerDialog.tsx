import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react"
import { Customer } from "../interface/customer"
import SuccessToast from "./SuccessToast";
import useCustomerStore from "../store/customerStore";
import { useState } from "react";

interface DeleteCustomerDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
  customer: Customer | null
  resetUser: () => void
}



const DeleteCustomerDialog = ({ isOpenDialog, setOpenDialog, customer, resetUser }: DeleteCustomerDialogProps) => {
  const { deleteCustomer } = useCustomerStore()
  const [loading, setLoading] = useState(false)
  return <Dialog.Root lazyMount open={isOpenDialog} size={"lg"} onExitComplete={() => { resetUser() }}>
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
              <Button variant="outline" disabled={loading} onClick={() => setOpenDialog(false)}>Cancel</Button>
            </Dialog.ActionTrigger>
            <Button
              loading={loading}
              onClick={async () => {
                if (customer) {
                  setLoading(true)
                  await deleteCustomer(customer.id)
                  SuccessToast("Delete Customer success")

                  setOpenDialog(false)
                  setLoading(false)
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