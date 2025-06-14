import AppBar from "../component/AppBar"
import { Box, Field, Input, Table, Text } from "@chakra-ui/react"

const UserManagement = () => {
  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      <Text marginBottom={"20px"} textStyle={'xl'} color={'#1A69AA'} fontWeight='bold'>User Management</Text>
      {/* <Box mt="10px" display="flex" mb="15px" justifyContent='space-between'>
        <Field.Root width="30%">
          <Field.Label>Username</Field.Label>
          <Input
            value={search.username}
            onChange={(e) => {
              setSearch({ username: e.currentTarget.value })
            }} />
        </Field.Root>
        <Field.Root width="30%">
          <Field.Label>Name</Field.Label>
          <Input
            value={search.name}
            onChange={(e) => {
              setSearch({ name: e.currentTarget.value })
            }} />
        </Field.Root>
        <Field.Root width="30%">
          <Field.Label>Division</Field.Label>
          <Input
            value={search.division}
            onChange={(e) => {
              setSearch({ division: e.currentTarget.value })
            }} />
        </Field.Root>
      </Box> */}
      <Table.Root size="md">
        <Table.Header>
          <Table.Row background={"#F9FAFB"}>
            <Table.ColumnHeader>รหัสพนักงาน</Table.ColumnHeader>
            <Table.ColumnHeader>ชื่อ</Table.ColumnHeader>
            <Table.ColumnHeader>สิทธิการเข้าถึง</Table.ColumnHeader>
            <Table.ColumnHeader>Password</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body></Table.Body>
      </Table.Root>
    </Box>
  </Box>
}

export default UserManagement

