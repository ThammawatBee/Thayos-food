import { DateTime } from "luxon"
import { Log } from "../interface/log"
import pickBy from "lodash/pickBy"
import { devtools } from "zustand/middleware"
import { create } from "zustand"
import { listLogs } from "../service/thayos-food"

type LogSearch = {
  startDate?: Date
  endDate?: Date
}


interface LogState {
  logs: Log[] | null
  count: number
  isLoading: boolean
  error: any
  offset: number
  limit: number
  fetchLogs: (options?: { limit?: number, offset?: number, changePage?: boolean, reset?: boolean }) => Promise<void>
  search: LogSearch
  onPageChange: (page: number) => Promise<void>
  onPageSizeChange: (pageSize: number) => Promise<void>
  setSearch: (input: LogSearch) => void
}

export const generateMonitorParam = (search: LogSearch) => {
  let startDate = search.startDate ? DateTime.fromJSDate(search.startDate).toFormat('yyyy-MM-dd') : ''
  let endDate = search.endDate ? DateTime.fromJSDate(search.endDate).toFormat('yyyy-MM-dd') : ''
  return pickBy({ startDate, endDate }, (value) => !!value)
}

const useMonitorStore = create<LogState>()(
  devtools((set, get) => ({
    logs: null,
    count: 0,
    offset: 0,
    limit: 10,
    isLoading: false,
    error: null,
    search: {
      startDate: undefined,
      endDate: undefined,
    },

    fetchLogs: async (options?: { limit?: number, offset?: number, changePage?: boolean, reset?: boolean }) => {
      set({ isLoading: true, error: null });
      try {
        const limit = options?.limit || get().limit
        const offset = options?.offset || get().offset
        const currentLogs = get().logs
        const search = get().search
        const response = await listLogs({
          limit,
          offset: options?.reset ? 0 : offset,
          ...generateMonitorParam(search),
        });
        set({
          logs: options?.changePage ?
            [...currentLogs?.length ? currentLogs : [],
            ...response.logs] : response.logs, count: response.count, isLoading: false,
          ...options?.reset ? { offset: 0 } : {}
        });
      } catch (error: any) {
        set({ isLoading: false });
        throw error
      }
    },
    setSearch: (input: LogSearch) => {
      const currentSearch = get().search
      set({ search: { ...currentSearch, ...input } })
    },
    onPageChange: async (page: number) => {
      const logs = get().logs
      const limit = get().limit
      const count = get().count
      const fetchLogs = get().fetchLogs
      if (logs) {
        if (logs?.length < page * limit && logs?.length < count) {
          await fetchLogs({ offset: logs.length, changePage: true, limit: (page * limit) - logs?.length })
          set({ offset: page - 1 })
        }
        else {
          set({ offset: page - 1 })
        }
      }
    },
    onPageSizeChange: async (pageSize: number) => {
      const { search } = get()
      const response = await listLogs({
        limit: pageSize,
        offset: 0,
        ...generateMonitorParam(search) as any
      });
      set({ logs: response.logs, count: response.count, offset: 0, limit: pageSize });
    },
  }))
)

export default useMonitorStore