import api from './index'

export interface Announcement {
  id?: number
  title: string
  content?: string
  type: 'info' | 'warning' | 'success' | 'error'
  link?: string
  link_text?: string
  status?: number
  sort_order?: number
  start_time?: string
  end_time?: string
  created_at?: string
  updated_at?: string
}

export const getAnnouncements = (params?: any) => {
  return api.get('/announcement', { params })
}

export const getAnnouncementDetail = (id: number) => {
  return api.get(`/announcement/${id}`)
}

const normalizeAnnouncement = (data: Partial<Announcement>) => {
  const payload: Record<string, any> = { ...data }
  const emptyToUndefined = (key: keyof Announcement) => {
    if (payload[key] === '') {
      delete payload[key]
    }
  }
  emptyToUndefined('content')
  emptyToUndefined('link')
  emptyToUndefined('link_text')
  emptyToUndefined('start_time')
  emptyToUndefined('end_time')
  return payload
}

export const createAnnouncement = (data: Announcement) => {
  return api.post('/announcement', normalizeAnnouncement(data))
}

export const updateAnnouncement = (id: number, data: Partial<Announcement>) => {
  return api.put(`/announcement/${id}`, normalizeAnnouncement(data))
}

export const deleteAnnouncement = (id: number) => {
  return api.delete(`/announcement/${id}`)
}

export const batchUpdateAnnouncementStatus = (ids: number[], status: number) => {
  return api.put('/announcement/batch/status', { ids, status })
}
