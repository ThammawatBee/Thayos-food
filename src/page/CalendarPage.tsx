import YearCalendar from "../component/YearCalendar"
import AppBar from "../component/AppBar"
import { Box, Field, Input, Table, Text } from "@chakra-ui/react"

const CalendarPage = () => {
  return <Box>
    <AppBar />
    <Box paddingLeft={"15vh"} paddingRight={"15vh"} paddingTop={"10vh"} paddingBottom={"10vh"}>
      <YearCalendar/>
    </Box>
  </Box>
}

export default CalendarPage

