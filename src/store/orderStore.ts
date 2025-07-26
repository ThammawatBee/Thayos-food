import pickBy from "lodash/pickBy";
import { Order, OrderPayload, UpdateOrderPayload } from "../interface/order";
import { createOrder, listOrders, updateOrder, uploadOrderSlip } from "../service/thayos-food";
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'
import { DateTime } from "luxon";

type OrderSearch = {
  startDate?: Date
  endDate?: Date
  customer?: string
}

interface OrderState {
  orders: Order[] | null
  count: number
  isLoading: boolean
  error: any
  offset: number
  limit: number
  fetchOrders: (options?: { limit?: number, offset?: number, changePage?: boolean, reset?: boolean }) => Promise<void>
  search: OrderSearch
  onPageChange: (page: number) => Promise<void>
  onPageSizeChange: (pageSize: number) => Promise<void>
  setSearch: (input: OrderSearch) => void
  createOrder: (payload: OrderPayload, slipFile: File | null) => Promise<void>
  updateOrder: (id: string, payload: UpdateOrderPayload) => Promise<void>
}

export const generateOrderParam = (search: OrderSearch) => {
  let startDate = search.startDate ? DateTime.fromJSDate(search.startDate).toFormat('yyyy-MM-dd') : ''
  let endDate = search.endDate ? DateTime.fromJSDate(search.endDate).toFormat('yyyy-MM-dd') : ''
  return pickBy({ startDate, endDate, customer: search.customer }, (value) => !!value)
}

const useOrderStore = create<OrderState>()(
  devtools((set, get) => ({
    orders: null,
    count: 0,
    offset: 0,
    limit: 10,
    isLoading: false,
    error: null,
    search: {
      customer: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + (3600 * 1000 * 24)),
    },
    createOrder: async (order: OrderPayload, slipFile: File | null) => {
      const { limit } = get()
      try {
        const result = await createOrder(order)
        if (slipFile) {
          await uploadOrderSlip(result.order.id, slipFile)
        }
        const response = await listOrders({
          limit,
          offset: 0,
        });
        set({ orders: response.orders, count: response.count, offset: 0, search: {} });
        return result.order
      } catch (error: any) {
        throw error
      }
    },
    fetchOrders: async (options?: { limit?: number, offset?: number, reset?: boolean, changePage?: boolean }) => {
      set({ isLoading: true, error: null });
      console.log('wpoewwknn')
      try {
        const limit = options?.limit || get().limit
        const offset = options?.offset || get().offset
        const currentOrders = get().orders
        const search = get().search
        const response = await listOrders({
          limit,
          offset: options?.reset ? 0 : offset,
          ...generateOrderParam(search),
        });
        set({
          orders: options?.changePage ?
            [...currentOrders?.length ? currentOrders : [],
            ...response.orders] : response.orders, count: response.count, isLoading: false,
          ...options?.reset ? { offset: 0 } : {}
        });
      } catch (error: any) {
        set({ isLoading: false });
        throw error
      }
    },
    setSearch: (input: OrderSearch) => {
      const currentSearch = get().search
      set({ search: { ...currentSearch, ...input } })
    },
    onPageChange: async (page: number) => {
      const orders = get().orders
      const limit = get().limit
      const count = get().count
      const fetchOrders = get().fetchOrders
      if (orders) {
        if (orders?.length < page * limit && orders?.length < count) {
          await fetchOrders({ offset: orders.length, changePage: true, limit: (page * limit) - orders?.length })
          set({ offset: page - 1 })
        }
        else {
          set({ offset: page - 1 })
        }
      }
    },
    onPageSizeChange: async (pageSize: number) => {
      const { search } = get()
      const response = await listOrders({
        limit: pageSize,
        offset: 0,
        ...generateOrderParam(search) as any
      });
      set({ orders: response.orders, count: response.count, offset: 0, limit: pageSize });
    },
    updateOrder: async (id: string, payload: UpdateOrderPayload) => {
      const { fetchOrders } = get()
      await updateOrder(id, payload)
      await fetchOrders({ reset: true })
    }
  }))
)

export default useOrderStore