export type Payment = {
  id: string
  paymentType: string
  total: string
  slipFilename: string
  createdAt: string
  customer: {
    fullname: string
  }
}

export type ListPaymentOptions = {
  dateStart?: string
  dateEnd?: string
  offset?: number
  limit?: number
}