import { Customer } from "./customer"

export type OrderPayload = {
  address: string
  remark: string
  deliveryRemark: string
  type: string,
  preferBreakfast: boolean
  preferLunch: boolean
  preferDinner: boolean
  preferBreakfastSnack: boolean
  preferLunchSnack: boolean
  preferDinnerSnack: boolean
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
  breakfastSnackCount: number
  lunchSnackCount: number
  dinnerSnackCount: number
  deliveryTime: string
  deliveryOn: {
    Sunday: boolean
    Monday: boolean
    Tuesday: boolean
    Wednesday: boolean
    Thursday: boolean
    Friday: boolean
    Saturday: boolean
  }
  startDate: string | null
  endDate: string | null
  customerType: string
  paymentType: string
  total: number
  promotion: string
  customerId: string
}

export type Order = {
  id: string
  type: string
  address: string
  remark: string
  deliveryRemark: string
  preferBreakfast: boolean
  preferLunch: boolean
  preferDinner: boolean
  preferBreakfastSnack: boolean
  preferLunchSnack: boolean
  preferDinnerSnack: boolean
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
  breakfastSnackCount: number
  lunchSnackCount: number
  dinnerSnackCount: number
  deliveryTime: string
  deliveryOn: {
    Sunday: boolean
    Monday: boolean
    Tuesday: boolean
    Wednesday: boolean
    Thursday: boolean
    Friday: boolean
    Saturday: boolean
  }
  startDate: string | null
  endDate: string | null
  customerType: string
  paymentType: string
  total: number
  promotion: string
  customer: Customer
}

export type OrderItem = {
  id: string;
  type: string;
  deliveryAt: string;
}

export type ListOrderOptions = {
  offset?: number
  limit?: number
  startDate?: string
  endDate?: string
  customer?: string
}

export type UpdateOrderPayload = {
  address: string
  remark: string
  deliveryRemark: string
  preferBreakfast: boolean
  preferLunch: boolean
  preferDinner: boolean
  preferBreakfastSnack: boolean
  preferLunchSnack: boolean
  preferDinnerSnack: boolean
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
  breakfastSnackCount: number
  lunchSnackCount: number
  dinnerSnackCount: number
}