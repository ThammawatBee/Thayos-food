import useUserStore from "../store/userStore"
import AppBar from "../component/AppBar"
import { Box, Button, ButtonGroup, Field, IconButton, Input, Pagination, Table, Text } from "@chakra-ui/react"
import useAuthStore from "../store/authStore"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import PageSizeSelect from "../component/PageSizeSelect"
import UserDialog from "../component/UserDialog"
import { FiEdit } from "react-icons/fi";
import { User } from "../interface/user"
import upperFirst from "lodash/upperFirst"
import DeleteUserDialog from "../component/DeleteUserDialog"
import { FaRegTrashAlt } from "react-icons/fa"

const UserManagement = () => {
  const navigate = useNavigate();
  const { users, limit, onPageSizeChange, onPageChange, offset, count, search, setSearch, fetchUsers } = useUserStore()
  const { profile } = useAuthStore()
  const [openModal, setOpenModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  useEffect(() => {
    if (!users) {
      fetchUsers()
    }
  }, [])
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate("/")
    }
  }, [profile])
  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      <Text marginBottom={"20px"} textStyle={'xl'} color={'#1A69AA'} fontWeight='bold'>User Management</Text>
      <Box mt="10px" display="flex" mb="35px" justifyContent='space-between' alignItems='end'>
        <Field.Root width="30%">
          <Field.Label>User ID/Name</Field.Label>
          <Input
            value={search.userCode}
            onChange={(e) => {
              setSearch({ userCode: e.currentTarget.value })
            }} />
        </Field.Root>
        <Button onClick={() => {
          fetchUsers({ reset: true })
        }}>Search</Button>
      </Box>
      <Table.Root size="md">
        <Table.Header>
          <Table.Row background={"#F9FAFB"}>
            <Table.ColumnHeader>รหัสพนักงาน</Table.ColumnHeader>
            <Table.ColumnHeader>ชื่อ</Table.ColumnHeader>
            <Table.ColumnHeader>สิทธิการเข้าถึง</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            users?.length ? users.slice(offset * limit, (offset + 1) * limit).map(user =>
              <Table.Row>
                <Table.Cell>{user.userCode}</Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{upperFirst(user.role)}</Table.Cell>
                <Table.Cell>
                  <IconButton
                    variant="outline"
                    size={"sm"}
                    onClick={() => {
                      setEditUser(user)
                      setOpenModal(true)
                    }}
                  >
                    <FiEdit />
                  </IconButton></Table.Cell>
                <Table.Cell>
                  {profile?.id !== user.id ? <IconButton
                    variant="outline"
                    size={"sm"}
                    onClick={() => {
                      setDeleteUser(user)
                      setOpenDeleteModal(true)
                    }}
                  >
                    <FaRegTrashAlt />
                  </IconButton> : null}
                </Table.Cell>
              </Table.Row>
            ) : null
          }
        </Table.Body>
      </Table.Root>
      {users?.length ? <Box mt={'15px'} mb={'15px'} display='flex' justifyContent={'space-between'}>
        <Box display={'flex'} fontSize={'14px'} alignItems={'center'}>
          Row per page
          <Box ml={"15px"} width={'50px'}>
            <PageSizeSelect limit={limit} onChangePageSize={async (pageSize: number) => {
              await onPageSizeChange(pageSize)
            }} />
          </Box>
          <Box ml={"15px"}>
            {(offset * limit) + 1} - {count < (limit * (offset + 1)) ? count : (limit * (offset + 1))} of {count}
          </Box>
        </Box>
        <Pagination.Root
          count={count}
          pageSize={limit}
          page={offset + 1}
          onPageChange={async (details: { page: number, pageSize: number }) => {
            await onPageChange(details.page)
          }}
        >
          <ButtonGroup variant="ghost">
            <Pagination.PrevTrigger asChild>
              <IconButton>
                <LuChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>
            <Pagination.Items
              render={(page) => (
                <IconButton variant={{ base: "ghost", _selected: "solid" }}>
                  {page.value}
                </IconButton>
              )}
            />
            <Pagination.NextTrigger asChild>
              <IconButton>
                <LuChevronRight />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      </Box> : <Box height={'75px'} />}
      <Box marginTop="20px" display='flex' justifyContent='flex-end'>
        <Button background={'#385723'} onClick={() => setOpenModal(true)}>Add new User</Button>
      </Box>
    </Box>
    <UserDialog isOpenDialog={openModal} setOpenDialog={setOpenDeleteModal} user={editUser} />
    <DeleteUserDialog isOpenDialog={openDeleteModal} setOpenDialog={setOpenModal} user={deleteUser} />
  </Box>
}

export default UserManagement

