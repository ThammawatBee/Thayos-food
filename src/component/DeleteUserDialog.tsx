import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react"
import SuccessToast from "./SuccessToast";
import useUserStore from "../store/userStore";
import { User } from "../interface/user";
import { useState } from "react";

interface DeleteUserDialogDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
  user: User | null
  resetUser: () => void
}



const DeleteUserDialog = ({ isOpenDialog, setOpenDialog, user, resetUser }: DeleteUserDialogDialogProps) => {
  const { deleteUser } = useUserStore()
  const [loading, setLoading] = useState(false)
  return <Dialog.Root lazyMount open={isOpenDialog} size={"lg"} onExitComplete={() => {
    resetUser()
  }}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>ลบ User</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text>คุณต้องการลบ {user?.name} ออกจากระบบใช่หรือไม่</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger>
              <Button
                disabled={loading}
                variant="outline"
                onClick={() => setOpenDialog(false)}>Cancel</Button>
            </Dialog.ActionTrigger>
            <Button onClick={async () => {
              if (user) {
                setLoading(true)
                await deleteUser(user.id)
                SuccessToast("Delete User success")

                setOpenDialog(false)
                setLoading(false)
              }
            }}>Submit</Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger disabled={loading} onClick={() => setOpenDialog(false)}>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root >
}

export default DeleteUserDialog