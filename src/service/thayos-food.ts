import { LoginPayload, Profile } from "../interface/auth"
import axiosInstance from "./axios"
import { CreateUser, EditUser, ListUserOptions, User } from "../interface/user"
import { CreateCustomer, Customer, EditCustomer, ListCustomerOptions } from "../interface/customer"

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

export const listHolidays = async (year: string) => {
  const response = await axiosInstance.get(`/holidays`, { params: { year } });
  return response as unknown as { customer: Customer };
}
