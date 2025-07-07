// YearCalendar.tsx
import { Box, Grid, Text } from "@chakra-ui/react"
import { DateTime } from 'luxon';
import isNil from "lodash/isNil";

export default function YearCalendar({ year = 2025, dateTasks, onClickDate, highlightColor }: { year: number, dateTasks?: string[], onClickDate?: (date: string) => void, highlightColor?: string }) {
  const months = Array.from({ length: 12 }, (_, i) => DateTime.local(year, i + 1));
  const getMonthDates = (month: DateTime) => {
    const startOfMonth = month.startOf('month');
    const endOfMonth = month.endOf('month');

    const start = startOfMonth.minus({ days: startOfMonth.weekday % 7 }); // Sunday as 0
    const end = endOfMonth.plus({ days: 6 - (endOfMonth.weekday % 7) });

    const dates = [];
    let curr = start;
    while (curr <= end) {
      dates.push({
        day: curr.day,
        isCurrentMonth: curr.month === month.month,
        isInTask: dateTasks?.length ? dateTasks.includes(curr.toISODate() || '') : false,
        date: curr.toISODate(),
      });
      curr = curr.plus({ days: 1 });
    }
    return dates;
  }
  const getDateColor = (isCurrentMonth: boolean, isInTask: boolean) => {
    if (isCurrentMonth && isInTask) {
      return '#ffffff'
    }
    if (isCurrentMonth) {
      return 'black'
    }
    return '#9B9A9A'
  }
  const selectColor = () => {
    return highlightColor ? highlightColor : '#3944BC'
  }

  return (
    <div>
      <div>
        <Text marginBottom={'20px'} textStyle="xl" fontWeight={'bold'} color={'#3944BC'} textAlign={'center'}>{year}</Text>
      </div>
      <Grid templateColumns="repeat(3, 1fr)" gap="6">
        {months.map((month) => (
          <Box key={month.month} borderWidth="1px" padding={4} rounded="md" className="border rounded p-4">
            <Text textAlign={'center'} fontSize={'lg'} marginBottom={'5px'} fontWeight={'semibold'}>
              {month.setLocale('th').toFormat('LLLL')}
            </Text>
            <Grid templateColumns="repeat(7, 1fr)" fontSize={'sm'} textAlign={'center'}>
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((d) => (
                <div key={d} className="font-bold text-gray-700">{d}</div>
              ))}
              {getMonthDates(month).map(({ day, isCurrentMonth, isInTask, date }, index) => (
                <Box
                  borderRadius='1.5px'
                  key={index}
                  padding={'1px'}
                  color={getDateColor(isCurrentMonth, isInTask)}
                  backgroundColor={isCurrentMonth && isInTask ? selectColor() : ''}
                  cursor={!isNil(onClickDate) && isCurrentMonth ? 'pointer' : 'auto'}
                  onClick={() => {
                    if (!isNil(onClickDate) && isCurrentMonth) {
                      onClickDate(date || '')
                    }
                  }}
                >
                  {day}
                </Box>
              ))}
            </Grid>
          </Box>
        ))}
      </Grid>
    </div>
  );
}
