import { OrderPayload } from "@/interface/order";
import { createOrder, uploadOrderSlip } from "../service/thayos-food";
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

interface OrderState {
  createOrder: (payload: OrderPayload, slipFile: File | null) => Promise<void>
}

const useOrderStore = create<OrderState>()(
  devtools((set, get) => ({
    createOrder: async (order: OrderPayload, slipFile: File | null) => {
      // const { limit } = get()
      try {
        const result = await createOrder(order)
        if (slipFile) {
          await uploadOrderSlip(result.order.id, slipFile)
        }
        return result.order
        // const response = await listUsers({
        //   limit,
        //   offset: 0,
        // });
        // set({ users: response.users, count: response.count, offset: 0, search: {} });
      } catch (error: any) {
        throw error
      }
    },
  }))
)

export default useOrderStore