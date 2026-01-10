import api from './index'

/**
 * 上传单张图片
 * @param file 图片文件
 */
export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/upload/image', formData)
}
