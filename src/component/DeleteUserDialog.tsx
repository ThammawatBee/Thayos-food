import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react"
import SuccessToast from "./SuccessToast";
import useUserStore from "../store/userStore";
import { User } from "../interface/user";

interface DeleteUserDialogDialogProps {
  isOpenDialog: boolean
  setOpenDialog: (value: boolean) => void
  user: User | null
}



const DeleteUserDialog = ({ isOpenDialog, setOpenDialog, user }: DeleteUserDialogDialogProps) => {
  const { deleteUser } = useUserStore()
  return <Dialog.Root lazyMount open={isOpenDialog} size={"lg"}>
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
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            </Dialog.ActionTrigger>
            <Button onClick={async () => {
              if (user) {
                await deleteUser(user.id)
                SuccessToast("Delete User success")

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

export default DeleteUserDialog