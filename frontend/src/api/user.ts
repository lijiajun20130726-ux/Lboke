import api from './index'

// 用户登录
export const login = (data: { account: string; password: string }) => {
  return api.post('/user/login', data)
}

// 发送登录验证码
export const sendLoginCode = (account: string) => {
  return api.post('/user/send-code', { account })
}

export const sendRegisterCode = (email: string) => {
  return api.post('/user/send-register-code', { email })
}

export const getWeChatLoginUrl = () => {
  return api.get('/user/wechat/authorize')
}

// 获取用户列表（管理员）
export const getUserList = (params?: any) => {
  return api.get('/user/list', { params })
}

// 用户注册
export const register = (data: { username: string; password: string; email: string; code: string }) => {
  return api.post('/user/register', data)
}

// 获取用户信息
export const getProfile = () => {
  return api.get('/user/profile')
}

// 更新用户信息
export const updateProfile = (data: { nickname?: string; email?: string; avatar?: string }) => {
  return api.put('/user/profile', data)
}

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return api.put('/user/password', data)
}

// 获取用户点赞的文章
export const getUserLikedArticles = (params?: { page?: number; pageSize?: number }) => {
  return api.get('/user/likes', { params })
}
