import { Box, Button, Input, Text } from "@chakra-ui/react"
import DatePicker from "react-datepicker"
import YearCalendar from "./YearCalendar"
import { useEffect } from "react"
import useHolidayStore from "../store/holidayStore"
import SuccessToast from "./SuccessToast"
import flatMap from "lodash/flatMap"

const HolidayCalendar = () => {
  const { holidays, fetchHolidays, year, setYear, holidayTask, updateHolidayTask, submitHoliday } = useHolidayStore()
  useEffect(() => {
    if (!holidays[year]) {
      fetchHolidays(year)
    }
  }, [])
  return <Box>
    <Text marginBottom={"20px"} textStyle={'xl'} color={'#1A69AA'} fontWeight='bold'>Set up holiday</Text>
    <Box>
      <Text marginBottom={"10px"}>Select Year</Text>
      <DatePicker
        selected={new Date(+year, 0, 1)}
        onChange={(date) => {
          if (date) {
            const year = `${date.getFullYear()}`
            setYear(`${date.getFullYear()}`)
            if (!holidays[year]) {
              fetchHolidays(year)
            }
          }
        }}
        showYearPicker
        dateFormat="yyyy"
        customInput={<Input
          readOnly={true}
          value={year}
          background={'white'} />}
      />
    </Box>
    <YearCalendar year={+year} dateTasks={holidayTask} onClickDate={(date) => {
      updateHolidayTask(date)
    }}
      highlightColor={'#1A69AA'}
    />
    <Box display={'flex'} justifyContent={'end'} marginTop={'30px'} onClick={async () => {
      const originalHolidays = flatMap(holidays)
      const toAdd = holidayTask.filter(d => !originalHolidays.includes(d))
      const toDelete = originalHolidays.filter(d => !holidayTask.includes(d))
      await submitHoliday(toAdd, toDelete)
      SuccessToast("Update Holidays success")
    }}>
      <Button>Confirm Holiday</Button>
    </Box>
  </Box>
}

export default HolidayCalendar