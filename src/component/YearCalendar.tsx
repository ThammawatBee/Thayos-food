// YearCalendar.tsx
import { Box, Grid, Text } from "@chakra-ui/react"
import { DateTime } from 'luxon';

export default function YearCalendar({ year = 2025 }) {
  const months = Array.from({ length: 12 }, (_, i) => DateTime.local(year, i + 1));
  const tasks = ['2025-01-11', '2025-01-12', '2025-01-13', '2025-01-14']
  const getMonthDates = (month: DateTime) => {
    const startOfMonth = month.startOf('month');
    const endOfMonth = month.endOf('month');

    const start = startOfMonth.minus({ days: startOfMonth.weekday % 7 }); // Sunday as 0
    const end = endOfMonth.plus({ days: 6 - (endOfMonth.weekday % 7) });

    const dates = [];
    let curr = start;
    while (curr <= end) {
      dates.push({ day: curr.day, isCurrentMonth: curr.month === month.month, isInTask: tasks.includes(curr.toISODate() || '') });
      curr = curr.plus({ days: 1 });
    }
    return dates;
  }
  return (
    <div>
      <div>
        {/* <h1 className="text-xl font-bold text-blue-600 text-center">2025</h1> */}
        <Text textStyle="xl" fontWeight={'bold'} color={'#3944BC'} textAlign={'center'}>2025</Text>
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
              {getMonthDates(month).map(({ day, isCurrentMonth, isInTask }, index) => (
                <Box
                  key={index}
                  padding={'1px'}
                  color={isCurrentMonth ? 'black' : '#9B9A9A'}
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
