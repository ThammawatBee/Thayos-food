import { LoginPayload, Profile } from "../interface/auth"
import axiosInstance from "./axios"
import { CreateUser, EditUser, ListUserOptions, User } from "../interface/user"
import { CreateCustomer, Customer, EditCustomer, ListCustomerOptions } from "../interface/customer"
import { Holiday } from "../interface/holiday"
import { ListOrderOptions, Order, OrderItem, OrderPayload, UpdateOrderPayload } from "../interface/order"
import { ListPaymentOptions, Payment } from "../interface/payment"
import { Bag, GroupBag, ListBagOptions, OrderItemSummary, UpdateBag } from "../interface/bag"
import { ListLogOptions, Log } from "../interface/log"

export const login = async (payload: LoginPayload) => {
  const response = await axiosInstance.post('/auth/login', { ...payload })
  return response as unknown as { access_token: string, expiresAt: number }
}

export const getProfile = async () => {
  const response = await axiosInstance.get('/auth/me')
  return response as unknown as Profile
}

export const listUsers = async (options: ListUserOptions) => {
  const response = await axiosInstance.get(`/users`, { params: options });
  return response as unknown as { users: User[], count: number };
}

export const createUser = async (data: CreateUser) => {
  const response = await axiosInstance.post(`/users`, { ...data });
  return response as unknown as { users: User[], count: number };
}

export const editUser = async (id: string, data: EditUser) => {
  const response = await axiosInstance.patch(`/users/${id}`, { ...data });
  return response as unknown as { user: User };
}

export const deleteUser = async (id: string) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response
}

export const listCustomers = async (options: ListCustomerOptions) => {
  const response = await axiosInstance.get(`/customers`, { params: options });
  return response as unknown as { customers: Customer[], count: number };
}

export const createCustomer = async (data: CreateCustomer) => {
  const response = await axiosInstance.post(`/customers`, { ...data });
  return response as unknown as { customers: Customer[], count: number };
}

export const editCustomer = async (id: string, data: EditCustomer) => {
  const response = await axiosInstance.patch(`/customers/${id}`, { ...data });
  return response as unknown as { customer: Customer };
}

export const deleteCustomer = async (id: string) => {
  const response = await axiosInstance.delete(`/customers/${id}`);
  return response
}

export const listHolidays = async (year: string) => {
  const response = await axiosInstance.get(`/holidays`, { params: { year } });
  return response as unknown as { holidays: Holiday[] };
}

export const updateHolidays = async (addHolidays: string[], deleteHolidays: string[]) => {
  const response = await axiosInstance.patch(`/holidays`, { addHolidays, deleteHolidays });
  return response as unknown
}

export const createOrder = async (orderPayload: OrderPayload) => {
  const response = await axiosInstance.post(`/orders`, { ...orderPayload });
  return response as unknown as { order: Order };
}

export const uploadOrderSlip = async (orderId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post(`/orders/${orderId}/upload-slip`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export const downloadOrderSlip = async (orderId: string) => {
  const res = await axiosInstance.get(`/orders/${orderId}/image`, {
    responseType: 'blob',
  })
  return res
}

export const listCustomerOrderItem = async (customerId: string, year: string) => {
  const res = await axiosInstance.get(`/customers/${customerId}/order-items`, {
    params: { year }
  })
  return res as unknown as { orderItems: OrderItem[] };
}

export const listPayments = async (options: ListPaymentOptions) => {
  const response = await axiosInstance.get(`/orders/payment`, { params: options });
  return response as unknown as { payments: Payment[], count: number };
}

export const listBags = async (options: ListBagOptions) => {
  const response = await axiosInstance.get(`/orders/bags`, { params: options });
  return response as unknown as { bags: Bag[], count: number };
}

export const exportBags = async (options: ListBagOptions) => {
  const response = await axiosInstance.get(`/orders/bags/export`, { params: options, responseType: 'blob', });
  return response
}

export const listBagsForPrint = async (options: ListBagOptions) => {
  const response = await axiosInstance.get(`/orders/bags/print`, { params: options });
  return response as unknown as { bags: GroupBag[] };
}

export const exportOrderItems = async (options: ListBagOptions) => {
  const response = await axiosInstance.get(`/orders/order-items/export`, { params: options, responseType: 'blob', });
  return response
}

export const getOrderItemsSummary = async (options: ListBagOptions) => {
  const response = await axiosInstance.get(`/orders/order-items/summary`, { params: options });
  return response as unknown as OrderItemSummary[]
}

export const updateBags = async (bags: { id: string, basket: string }[]) => {
  const response = await axiosInstance.patch(`/orders/bags`, { bags });
  return response;
}

export const updateBag = async (bagId: string, payload: UpdateBag) => {
  const res = await axiosInstance.patch(`/orders/bag/${bagId}`, {
    ...payload
  })
  return res as unknown
}

export const listOrders = async (options: ListOrderOptions) => {
  const response = await axiosInstance.get(`/orders`, { params: options });
  return response as unknown as { orders: Order[], count: number };
}

export const updateOrder = async (orderId: string, payload: UpdateOrderPayload) => {
  const response = await axiosInstance.patch(`/orders/${orderId}`, { ...payload });
  return response as unknown as { orders: Order[], count: number };
}

export const getBag = async (bagId: string) => {
  const response = await axiosInstance.get(`/orders/bag/${bagId}`);
  return response as unknown as { bag: Bag };
}

export const getBagQrCode = async (bagId: string) => {
  const response = await axiosInstance.get(`/orders/bag/qr-code/${bagId}`);
  return response as unknown as { bag: GroupBag };
}

export const verifyBoxApi = async (bagId: string, orderItemId: string) => {
  const response = await axiosInstance.post(`/orders/verify-order-item`, { bagId, orderItemId });
  return response as unknown as { status: string };
}

export const verifyBagApi = async (bagQrCode: string, basket: string) => {
  const response = await axiosInstance.post(`/orders/verify-bag`, { bagQrCode, basket });
  return response as unknown as { status: string };
}

export const listLogs = async (options: ListLogOptions) => {
  const response = await axiosInstance.get(`/logs`, { params: options });
  return response as unknown as { logs: Log[], count: number };
}

export const exportHistory = async (options: ListLogOptions) => {
  const response = await axiosInstance.get(`/logs/export`, { params: options, responseType: 'blob', });
  return response
}


export const removeBag = async (bagId: string) => {
  const response = await axiosInstance.delete(`/orders/bag/${bagId}`);
  return response
}