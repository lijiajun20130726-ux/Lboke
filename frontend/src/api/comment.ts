import api from './index'

export const getArticleComments = (articleId: number) => {
  return api.get(`/comment/article/${articleId}`)
}

export const postComment = (data: {
  article_id: number
  content: string
  parent_id?: number
  nickname?: string
  email?: string
}) => {
  return api.post('/comment', data)
}
