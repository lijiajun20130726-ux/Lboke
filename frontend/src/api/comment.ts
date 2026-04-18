import api from './index'

export const getArticleComments = (articleId: number | string) => {
  return api.get(`/comment/article/${articleId}`)
}

export const postComment = (data: {
  article_id: number | string
  content: string
  parent_id?: number
  nickname?: string
  email?: string
}) => {
  return api.post('/comment', data)
}
