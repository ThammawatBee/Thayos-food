export interface LoginPayload {
  userCode: string
  password: string
}

export interface Profile {
  id: string,
  username: string,
  role: string,
  requirePasswordReset: boolean
}