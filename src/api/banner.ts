import { http } from '@/utils/http'

export interface Banner {
  id: number
  title: string
  image: string
  url: string
  sort: number
  status: 0 | 1 // 0-禁用 1-启用
  createTime: string
  updateTime: string
}

export interface BannerQuery {
  page: number
  pageSize: number
  title?: string
  status?: 0 | 1
}

export interface BannerForm {
  title: string
  image: string
  url: string
  sort: number
  status: 0 | 1
}

// 获取轮播图列表
export function getBannerList(params: BannerQuery) {
  return http.get<Banner[]>('/banner/list', { params })
}

// 添加轮播图
export function addBanner(data: BannerForm) {
  return http.post('/banner/add', data)
}

// 更新轮播图
export function updateBanner(id: number, data: BannerForm) {
  return http.put(`/banner/${id}`, data)
}

// 删除轮播图
export function deleteBanner(id: number) {
  return http.delete(`/banner/${id}`)
}

// 更新轮播图状态
export function updateBannerStatus(id: number, status: 0 | 1) {
  return http.patch(`/banner/${id}/status`, { status })
} 