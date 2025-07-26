import pickBy from "lodash/pickBy";
import { Payment } from "../interface/payment"
import { DateTime } from 'luxon';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'
import { listPayments } from "../service/thayos-food";

type PaymentSearch = {
  dateStart?: Date
  dateEnd?: Date
}

interface PaymentState {
  payments: Payment[] | null
  count: number
  isLoading: boolean
  error: any
  offset: number
  limit: number
  fetchPayments: (options?: { limit?: number, offset?: number, changePage?: boolean, reset?: boolean }) => Promise<void>
  search: PaymentSearch
  onPageChange: (page: number) => Promise<void>
  onPageSizeChange: (pageSize: number) => Promise<void>
  setSearch: (input: PaymentSearch) => void
}


export const generateParam = (search: PaymentSearch) => {
  let dateStart = search.dateStart ? DateTime.fromJSDate(search.dateStart).toFormat('yyyy-MM-dd') : ''
  let dateEnd = search.dateEnd ? DateTime.fromJSDate(search.dateEnd).toFormat('yyyy-MM-dd') : ''
  return pickBy({ dateStart, dateEnd }, (value) => !!value)
}

const usePaymentStore = create<PaymentState>()(
  devtools((set, get) => ({
    payments: null,
    count: 0,
    offset: 0,
    limit: 10,
    isLoading: false,
    error: null,
    search: {},

    fetchPayments: async (options?: { limit?: number, offset?: number, reset?: boolean, changePage?: boolean }) => {
      set({ isLoading: true, error: null });
      try {
        const limit = options?.limit || get().limit
        const offset = options?.offset || get().offset
        const currentPayments = get().payments
        const search = get().search
        const response = await listPayments({
          limit,
          offset: options?.reset ? 0 : offset,
          ...generateParam(search),
        });
        set({
          payments: options?.changePage ?
            [...currentPayments?.length ? currentPayments : [],
            ...response.payments] : response.payments, count: response.count, isLoading: false,
          ...options?.reset ? { offset: 0 } : {}
        });
      } catch (error: any) {
        set({ isLoading: false });
        throw error
      }
    },
    onPageChange: async (page: number) => {
      const payments = get().payments
      const limit = get().limit
      const count = get().count
      const fetchPayments = get().fetchPayments
      if (payments) {
        if (payments?.length < page * limit && payments?.length < count) {
          await fetchPayments({ offset: payments.length, changePage: true, limit: (page * limit) - payments?.length })
          set({ offset: page - 1 })
        }
        else {
          set({ offset: page - 1 })
        }
      }
    },
    setSearch: (input: PaymentSearch) => {
      const currentSearch = get().search
      set({ search: { ...currentSearch, ...input } })
    },
    onPageSizeChange: async (pageSize: number) => {
      const { search } = get()
      const response = await listPayments({
        limit: pageSize,
        offset: 0,
        ...generateParam(search)
      });
      set({ payments: response.payments, count: response.count, offset: 0, limit: pageSize });
    },
  }))
)

export default usePaymentStore