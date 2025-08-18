export interface Log {
  id: string
  type: string
  detail: string
  status: string
  createdAt: string,
  updatedAt: string
  bag: {
    deliveryAt: string
    address: string
  },
  customer: {
    customerCode: string
    fullname: string
  },
  user: {
    name: string
    userCode: string
  }
}

export type ListLogOptions = {
  offset?: number
  limit?: number
  startDate?: string
  endDate?: string
  type?: string
}