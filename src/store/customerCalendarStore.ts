import { create } from 'zustand';
import { devtools } from 'zustand/middleware'
import { OrderItem } from '../interface/order';
import { listCustomerOrderItem } from '../service/thayos-food';

interface CustomerCalendarState {
  customerCalendar: {
    [customerId: string]: {
      [year: string]: OrderItem[]
    }
  }
  activeCustomerId: string | null
  year: string
  setYear: (year: string) => void
  fetchCustomerOrderItem: (customerId: string, year: string,) => Promise<void>
  setActiveCustomerId: (customerId: string | null) => void
}

const useCustomerCalendarStore = create<CustomerCalendarState>()(devtools((set, get) => ({
  customerCalendar: {},
  year: `${new Date().getFullYear()}`,
  activeCustomerId: null,
  fetchCustomerOrderItem: async (customerId: string, year: string) => {
    const { customerCalendar } = get()
    const result = await listCustomerOrderItem(customerId, year)
    set({ customerCalendar: { ...customerCalendar, [`${customerId}`]: { ...customerCalendar[`${customerId}`], [`${year}`]: result.orderItems } } })
  },
  setActiveCustomerId: (customerId: string) => {
    set({ activeCustomerId: customerId })
  },
  setYear: (year: string) => set({ year }),
})))

export default useCustomerCalendarStore