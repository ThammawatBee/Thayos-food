import flatMap from 'lodash/flatMap';
import { listHolidays, updateHolidays } from '../service/thayos-food';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

interface HolidayState {
  holidays: {
    [key: string]: string[]
  }
  fetchHolidays: (year: string) => Promise<void>
  setYear: (year: string) => void
  year: string
  holidayTask: string[]
  updateHolidayTask: (date: string) => void
  submitHoliday: (toAdd: string[], toDelete: string[]) => Promise<void>
}

const useHolidayStore = create<HolidayState>()(devtools((set, get) => ({
  holidays: {},
  year: `${new Date().getFullYear()}`,
  holidayTask: [],
  fetchHolidays: async (year: string) => {
    const { holidays } = get()
    const holidaysInYear = await listHolidays(year)
    set({ holidays: { ...holidays, [year]: holidaysInYear.holidays.map(holiday => holiday.date) } })
    set({ holidayTask: flatMap({ ...holidays, [year]: holidaysInYear.holidays.map(holiday => holiday.date) }) })
  },
  setYear: (year: string) => set({ year }),
  updateHolidayTask: (date: string) => {
    const { holidayTask } = get()
    if (!holidayTask.includes(date)) {
      set({ holidayTask: [...holidayTask, date] })
    } else {
      set({ holidayTask: holidayTask.filter(task => task !== date) })
    }
  },
  submitHoliday: async (toAdd: string[], toDelete: string[]) => {
    await updateHolidays(toAdd, toDelete)
    const { year } = get()
    const holidaysInYear = await listHolidays(year)
    set({ holidays: { [year]: holidaysInYear.holidays.map(holiday => holiday.date) } })
    set({ holidayTask: flatMap({ [year]: holidaysInYear.holidays.map(holiday => holiday.date) }) })
  }
})))

export default useHolidayStore