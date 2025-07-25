export type OrderItem = {
  id: string
  type: string
  deliveryAt: string
  qrcode: string
}

export type Bag = {
  id: string
  noRemarkType: boolean
  deliveryAt: string
  address: string
  order: {
    type: string
    address: string
    remark: string
    deliveryRemark: string
    deliveryTime: string
    customer: {
      customerCode: string
      fullname: string
      address: string
      remark: string | null
    }
  }
  orderItems: OrderItem[]
  basket: string | null
}

export type ListBagOptions = {
  customer?: string
  startDate: string
  endDate: string
  type?: string
  offset?: number
  limit?: number
}

export type UpdateBag = {
  address: string
  breakfast: number
  lunch: number
  dinner: number
  breakfastSnack: number
  lunchSnack: number
  dinnerSnack: number
}