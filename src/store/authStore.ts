import { getProfile } from "../service/thayos-food";
import { Profile } from "../interface/auth"
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

interface AuthState {
  profile: Profile | null
  removeProfile: () => void
  getProfile: () => Promise<void>
  resetPassword: (password:string) => Promise<void>
}
const useAuthStore = create<AuthState>()(
  devtools((set, get) => ({
    profile: null,
    removeProfile: () => { set({ profile: null }) },
    getProfile: async () => {
      const profile = await getProfile()
      set({ profile: profile })
    },
  })))

export default useAuthStore