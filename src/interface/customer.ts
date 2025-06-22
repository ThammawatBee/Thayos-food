export type Customer = {
  id: string
  customerCode: string
  name: string
  fullname: string
  address: string
  pinAddress: string
  remark: string
  mobileNumber: string
  email: string
  deliveryTime: string
  latitude: number
  longitude: number
  preferBreakfast: boolean
  preferLunch: boolean
  preferDinner: boolean
}

export interface CreateCustomer {
  customerCode: string
  name: string
  fullname: string
  address: string
  pinAddress: string
  remark: string
  mobileNumber: string
  email: string
  deliveryTime: string
  latitude: number
  longitude: number
  preferBreakfast: boolean
  preferLunch: boolean
  preferDinner: boolean
}

export interface ListCustomerOptions {
  customerCode?: string
  offset?: number
  limit?: number
}

export interface EditCustomer {
  customerCode: string
  name: string
  fullname: string
  address: string
  pinAddress: string
  remark: string
  mobileNumber: string
  email: string
  deliveryTime: string
  latitude: number
  longitude: number
  preferBreakfast: boolean
  preferLunch: boolean
  preferDinner: boolean
}
