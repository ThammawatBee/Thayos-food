export type OrderItem = {
  id: string
  type: string
  deliveryAt: string
  qrcode: string
  inBagStatus: boolean
}

export type GroupBag = {
  deliveryAt: string
  customerName: string
  address: string
  customerCode: string
  orderItems: OrderItem[]
  noRemarkType: boolean
  qrCode: string
  inBasketStatus: boolean
  order: {
    type: string
    address: string
    remark: string
    deliveryRemark: string
    deliveryTime: string
    deliveryTimeEnd: string
    customer: {
      customerCode: string
      fullname: string
      address: string
      remark: string | null
    }
  }
}

export type Bag = {
  id: string
  noRemarkType: boolean
  deliveryAt: string
  address: string
  qrCode: string
  order: {
    type: string
    address: string
    remark: string
    deliveryRemark: string
    deliveryTime: string
    deliveryTimeEnd: string
    customer: {
      customerCode: string
      fullname: string
      address: string
      remark: string | null
    }
  }
  orderItems: OrderItem[]
  basket: string | null
  inBasketStatus: boolean
}

export type ListBagOptions = {
  customer?: string
  startDate: string
  endDate: string
  type?: string
  offset?: number
  limit?: number
  getAll?: boolean
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

export type OrderItemSummary = {
  text: string
  value: string
  count: number
}