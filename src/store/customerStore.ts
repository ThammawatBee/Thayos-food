import { createCustomer, editCustomer, listCustomers } from "../service/thayos-food";
import { CreateCustomer, EditCustomer, Customer } from "../interface/customer"
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'
import pickBy from "lodash/pickBy";

type CustomerSearch = {
  customerCode?: string
}

interface CustomerState {
  customers: Customer[] | null
  count: number
  isLoading: boolean
  error: any
  offset: number
  limit: number
  fetchCustomers: (options?: { limit?: number, offset?: number, changePage?: boolean, reset?: boolean }) => Promise<void>
  search: CustomerSearch
  onPageChange: (page: number) => Promise<void>
  onPageSizeChange: (pageSize: number) => Promise<void>
  setSearch: (input: CustomerSearch) => void
  createCustomer: (payload: CreateCustomer) => Promise<void>
  editCustomer: (id: string, payload: EditCustomer) => Promise<void>
}

const useCustomerStore = create<CustomerState>()(
  devtools((set, get) => ({
    customers: null,
    count: 0,
    offset: 0,
    limit: 10,
    isLoading: false,
    error: null,
    search: {},

    fetchCustomers: async (options?: { limit?: number, offset?: number, reset?: boolean, changePage?: boolean }) => {
      set({ isLoading: true, error: null });
      try {
        const limit = options?.limit || get().limit
        const offset = options?.offset || get().offset
        const currentUsers = get().customers
        const search = get().search
        const response = await listCustomers({
          limit,
          offset: options?.reset ? 0 : offset,
          ...pickBy(search, (search) => !!search),
        });
        set({
          customers: options?.changePage ?
            [...currentUsers?.length ? currentUsers : [],
            ...response.customers] : response.customers, count: response.count, isLoading: false,
          ...options?.reset ? { offset: 0 } : {}
        });
      } catch (error: any) {
        set({ isLoading: false });
        throw error
      }
    },
    onPageChange: async (page: number) => {
      const users = get().customers
      const limit = get().limit
      const count = get().count
      const fetchCustomers = get().fetchCustomers
      if (users) {
        if (users?.length < page * limit && users?.length < count) {
          await fetchCustomers({ offset: users.length, changePage: true, limit: (page * limit) - users?.length })
          set({ offset: page - 1 })
        }
        else {
          set({ offset: page - 1 })
        }
      }
    },
    setSearch: (input: CustomerSearch) => {
      const currentSearch = get().search
      set({ search: { ...currentSearch, ...input } })
    },
    onPageSizeChange: async (pageSize: number) => {
      const { search } = get()
      const response = await listCustomers({
        limit: pageSize,
        offset: 0,
        ...pickBy(search, (search) => !!search),
      });
      set({ customers: response.customers, count: response.count, offset: 0, limit: pageSize });
    },
    createCustomer: async (customer: CreateCustomer) => {
      const { limit } = get()
      try {
        await createCustomer(customer)
        const response = await listCustomers({
          limit,
          offset: 0,
        });
        set({ customers: response.customers, count: response.count, offset: 0, search: {} });
      } catch (error: any) {
        throw error
      }
    },
    editCustomer: async (id: string, customer: EditCustomer) => {
      try {
        const { customers } = get()
        const result = await editCustomer(id, customer)
        const updateCustomer = result.customer
        set({ customers: customers?.map(customer => customer.id === updateCustomer.id ? { ...customer, ...updateCustomer } : customer) });
      } catch (error: any) {
        throw error
      }
    },
  }))
)

export default useCustomerStore