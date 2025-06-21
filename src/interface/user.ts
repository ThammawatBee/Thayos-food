export type User = {
  id: string
  userCode: string
  name: string
  role: string
}

export interface CreateUser {
  userCode: string
  name: string
  role: string
  password: string
}

export interface ListUserOptions {
  userCode?: string
  offset?: number
  limit?: number
}

export interface EditUser {
  name: string
  role: string
  password: string
}
