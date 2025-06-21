import { createUser, editUser, listUsers } from "../service/thayos-food";
import { CreateUser, EditUser, User } from "../interface/user"
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'
import pickBy from "lodash/pickBy";

type UserSearch = {
  userCode?: string
}

interface UserState {
  users: User[] | null
  count: number
  isLoading: boolean
  error: any
  offset: number
  limit: number
  fetchUsers: (options?: { limit?: number, offset?: number, changePage?: boolean, reset?: boolean }) => Promise<void>
  search: UserSearch
  onPageChange: (page: number) => Promise<void>
  onPageSizeChange: (pageSize: number) => Promise<void>
  setSearch: (input: UserSearch) => void
  createUser: (payload: CreateUser) => Promise<void>
  editUser: (id: string, payload: EditUser) => Promise<void>
}

const useUserStore = create<UserState>()(
  devtools((set, get) => ({
    users: null,
    count: 0,
    offset: 0,
    limit: 10,
    isLoading: false,
    error: null,
    monthly: new Date(),
    search: {},

    fetchUsers: async (options?: { limit?: number, offset?: number, reset?: boolean, changePage?: boolean }) => {
      set({ isLoading: true, error: null });
      try {
        const limit = options?.limit || get().limit
        const offset = options?.offset || get().offset
        const currentUsers = get().users
        const search = get().search
        const response = await listUsers({
          limit,
          offset: options?.reset ? 0 : offset,
          ...pickBy(search, (search) => !!search),
        });
        set({
          users: options?.changePage ?
            [...currentUsers?.length ? currentUsers : [],
            ...response.users] : response.users, count: response.count, isLoading: false,
          ...options?.reset ? { offset: 0 } : {}
        });
      } catch (error: any) {
        set({ isLoading: false });
        throw error
      }
    },
    onPageChange: async (page: number) => {
      const users = get().users
      const limit = get().limit
      const count = get().count
      const fetchUsers = get().fetchUsers
      if (users) {
        if (users?.length < page * limit && users?.length < count) {
          await fetchUsers({ offset: users.length, changePage: true, limit: (page * limit) - users?.length })
          set({ offset: page - 1 })
        }
        else {
          set({ offset: page - 1 })
        }
      }
    },
    setSearch: (input: UserSearch) => {
      const currentSearch = get().search
      set({ search: { ...currentSearch, ...input } })
    },
    onPageSizeChange: async (pageSize: number) => {
      const { search } = get()
      const response = await listUsers({
        limit: pageSize,
        offset: 0,
        ...pickBy(search, (search) => !!search),
      });
      set({ users: response.users, count: response.count, offset: 0, limit: pageSize });
    },
    createUser: async (user: CreateUser) => {
      const { limit } = get()
      try {
        await createUser(user)
        const response = await listUsers({
          limit,
          offset: 0,
        });
        set({ users: response.users, count: response.count, offset: 0, search: {} });
      } catch (error: any) {
        throw error
      }
    },
    editUser: async (id: string, user: EditUser) => {
      try {
        const { users } = get()
        const result = await editUser(id, user)
        const updateUser = result.user
        set({ users: users?.map(user => user.id === updateUser.id ? { ...user, ...updateUser } : user) });
      } catch (error: any) {
        throw error
      }
    },
  }))
)

export default useUserStore