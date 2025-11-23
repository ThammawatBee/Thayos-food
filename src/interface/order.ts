import { Customer } from "./customer"

type IndividualOrder = {
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
  deliveryTimeEnd: string
  deliveryOrderType: string
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
  customerType: string | null
  paymentType: string | null
  total: number
  promotion: string | null
  customerId: string
  individualDelivery: {
    Sunday: IndividualOrder,
    Monday: IndividualOrder,
    Tuesday: IndividualOrder,
    Wednesday: IndividualOrder,
    Thursday: IndividualOrder,
    Friday: IndividualOrder,
    Saturday: IndividualOrder,
  },
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
  deliveryTimeEnd: string
  deliveryOrderType: string
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
  customerType: string | null
  paymentType: string | null
  total: number
  promotion: string | null
  customer: Customer
  individualDelivery: {
    Sunday: IndividualOrder,
    Monday: IndividualOrder,
    Tuesday: IndividualOrder,
    Wednesday: IndividualOrder,
    Thursday: IndividualOrder,
    Friday: IndividualOrder,
    Saturday: IndividualOrder,
  },
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
  individualDelivery: {
    Sunday: IndividualOrder,
    Monday: IndividualOrder,
    Tuesday: IndividualOrder,
    Wednesday: IndividualOrder,
    Thursday: IndividualOrder,
    Friday: IndividualOrder,
    Saturday: IndividualOrder,
  },
}