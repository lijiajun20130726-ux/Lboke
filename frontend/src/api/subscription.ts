import api from './index'

// 订阅
export const subscribe = (email: string) => {
  return api.post('/subscription/subscribe', { email })
}

// 退订
export const unsubscribe = (email: string) => {
  return api.post('/subscription/unsubscribe', { email })
}

// 获取订阅列表（后台）
export const getSubscriptions = (params?: any) => {
  return api.get('/subscription', { params })
}

// 获取订阅统计（后台）
export const getSubscriptionStats = () => {
  return api.get('/subscription/stats')
}

// 删除订阅（后台）
export const deleteSubscription = (id: number) => {
  return api.delete(`/subscription/${id}`)
}

// 批量删除订阅（后台）
export const batchDeleteSubscriptions = (ids: number[]) => {
  return api.delete('/subscription/batch/delete', { data: { ids } })
}

// 导出订阅列表（后台）
export const exportSubscriptions = (status?: number) => {
  return api.get('/subscription/export', { params: { status } })
}
