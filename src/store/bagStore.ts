import { devtools } from "zustand/middleware";
import { Bag, UpdateBag } from "../interface/bag";
import { create } from "zustand";
import pickBy from "lodash/pickBy";
import { DateTime } from "luxon";
import { listBags, updateBag } from "../service/thayos-food";

type BagSearch = {
  customer?: string
  startDate?: Date
  endDate?: Date
  type?: string
}

interface BagState {
  bags: Bag[] | null
  count: number
  isLoading: boolean
  error: any
  offset: number
  limit: number
  fetchBags: (options?: { limit?: number, offset?: number, changePage?: boolean, reset?: boolean }) => Promise<void>
  search: BagSearch
  onPageChange: (page: number) => Promise<void>
  onPageSizeChange: (pageSize: number) => Promise<void>
  setSearch: (input: BagSearch) => void
  updateBag: (bagId: string, payload: UpdateBag) => Promise<void>
}

export const generateParam = (search: BagSearch) => {
  let startDate = search.startDate ? DateTime.fromJSDate(search.startDate).toFormat('yyyy-MM-dd') : ''
  let endDate = search.endDate ? DateTime.fromJSDate(search.endDate).toFormat('yyyy-MM-dd') : ''
  return pickBy({ ...search, startDate, endDate, }, (value) => !!value)
}

const useBagStore = create<BagState>()(
  devtools((set, get) => ({
    bags: null,
    count: 0,
    offset: 0,
    limit: 10,
    isLoading: false,
    error: null,
    search: {
      customer: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + (3600 * 1000 * 24)),
      type: 'ALL',
    },
    fetchBags: async (options?: { limit?: number, offset?: number, changePage?: boolean, reset?: boolean }) => {
      set({ isLoading: true, error: null });
      try {
        const limit = options?.limit || get().limit
        const offset = options?.offset || get().offset
        const currentBags = get().bags
        const search = get().search
        const response = await listBags({
          limit,
          offset: options?.reset ? 0 : offset,
          ...generateParam(search) as any,
        });
        set({
          bags: options?.changePage ?
            [...currentBags?.length ? currentBags : [],
            ...response.bags] : response.bags, count: response.count, isLoading: false,
          ...options?.reset ? { offset: 0 } : {}
        });
      } catch (error: any) {
        set({ isLoading: false });
        throw error
      }
    },
    onPageChange: async (page: number) => {
      const bags = get().bags
      const limit = get().limit
      const count = get().count
      const fetchBags = get().fetchBags
      if (bags) {
        if (bags?.length < page * limit && bags?.length < count) {
          await fetchBags({ offset: bags.length, changePage: true, limit: (page * limit) - bags?.length })
          set({ offset: page - 1 })
        }
        else {
          set({ offset: page - 1 })
        }
      }
    },
    setSearch: (input: BagSearch) => {
      const currentSearch = get().search
      set({ search: { ...currentSearch, ...input } })
    },
    onPageSizeChange: async (pageSize: number) => {
      const { search } = get()
      const response = await listBags({
        limit: pageSize,
        offset: 0,
        ...generateParam(search) as any
      });
      set({ bags: response.bags, count: response.count, offset: 0, limit: pageSize });
    },
    updateBag: async (bagId: string, payload: UpdateBag) => {
      await updateBag(bagId, payload)
      const { fetchBags } = get()
      await fetchBags({ reset: true })
    }
  })
  ))

export default useBagStore