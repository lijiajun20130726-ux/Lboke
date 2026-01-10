import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getProfile } from '@/api/user'

interface User {
  id: number
  username: string
  nickname: string
  email: string
  avatar: string
  role: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))

  const login = async (username: string, password: string) => {
    try {
      const res: any = await loginApi({ username, password })
      console.log('API response:', res)
      if (res.code === 200) {
        token.value = res.data.token
        user.value = res.data.user
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
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
      user.value = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
    }
  }

  return { token, user, login, logout, fetchProfile }
})
