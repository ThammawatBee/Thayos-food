export type OrderPayload = {
  type: string,
  preferBreakfast: boolean
  preferLunch: boolean
  preferDinner: boolean
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
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
  preferBreakfast: boolean
  preferLunch: boolean
  preferDinner: boolean
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
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
}

export type OrderItem = {
  id: string;
  type: string;
  deliveryAt: string;
}