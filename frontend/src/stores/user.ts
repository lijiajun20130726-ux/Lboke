import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getProfile } from '@/api/user'

interface User {
  id: number
  username: string
  nickname: string
  email?: string
  avatar?: string
  role: string
  status?: number
  created_at?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser: User | null) => {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const login = async (account: string, password: string) => {
    try {
      const res: any = await loginApi({ account, password })
      console.log('API response:', res)
      if (res.code === 200) {
        setToken(res.data.token)
        setUser(res.data.user)
      }
      return res
    } catch (error: any) {
      console.error('Login API error:', error)
      return { code: 400, message: error.message || '登录失败', data: null }
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const fetchProfile = async () => {
    const res: any = await getProfile()
    if (res.code === 200) {
      setUser(res.data)
    }
  }

  return { token, user, login, logout, fetchProfile, setToken, setUser }
})
