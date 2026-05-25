import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('accessToken', token)
        set({ user, token })
      },
      logout: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, token: null })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore