import { request } from '@/utils/http'

export interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl: string
  sortOrder: number
  status: 0 | 1 // 0-禁用 1-启用
  remark?: string
  createTime: string
  updateTime: string
}

export interface BannerQuery {
  pageNum?: number
  pageSize?: number
  title?: string
  status?: 0 | 1
}

export interface BannerForm {
  id?: number
  title: string
  imageUrl: string
  linkUrl: string
  sortOrder: number
  status: 0 | 1
  remark?: string
}

// 获取轮播图列表
export function getBannerList(params: BannerQuery) {
  return request.get<{ records: Banner[]; total: number; size: number; current: number; pages: number }>('/banner/page', { params })
}

// 获取启用的轮播图列表
export function getActiveBannerList() {
  return request.get<Banner[]>('/banner/list')
}

// 获取轮播图详情
export function getBannerDetail(id: number) {
  return request.get<Banner>(`/banner/${id}`)
}

// 添加轮播图
export function addBanner(data: BannerForm) {
  return request.post<number>('/banner', data)
}

// 更新轮播图
export function updateBanner(id: number, data: BannerForm) {
  return request.put(`/banner/${id}`, data)
}

// 删除轮播图
export function deleteBanner(id: number) {
  return request.delete(`/banner/${id}`)
}

// 更新轮播图状态
export function updateBannerStatus(id: number, status: 0 | 1) {
  return request.put(`/banner/${id}/status?status=${status}`)
}

// 更新轮播图排序
export function updateBannerSort(id: number, sortOrder: number) {
  return request.put(`/banner/${id}/sort`, { sortOrder })
} 