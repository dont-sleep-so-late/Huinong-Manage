import { request } from '@/utils/http'
import { ApiResponse } from './auth'

export interface Category {
  id: number
  name: string
  banner?: string
  icon?: string
  parentId: number
  parentName?: string
  level: number
  sortOrder: number
  status: 0 | 1
  visible?: 0 | 1
  description?: string
  createTime?: string
  updateTime?: string
  children?: Category[]
}

export interface CategoryDTO {
  name: string
  parentId?: number
  level: number
  sortOrder?: number
  status?: 0 | 1
  banner?: string
  icon?: string
}

export interface CategoryQuery {
  pageNum?: number
  pageSize?: number
  name?: string
  status?: 0 | 1
  level?: number
  parentId?: number
}

// 创建分类
export function createCategory(data: CategoryDTO) {
  return request.post<ApiResponse<Category>>('/categories', data)
}

// 更新分类
export function updateCategory(id: number, data: Partial<CategoryDTO>) {
  return request.put<ApiResponse<null>>(`/categories/${id}`, data)
}

// 删除分类
export function deleteCategory(id: number) {
  return request.delete<null>(`/categories/${id}`)
}

// 批量删除分类
export function batchDeleteCategories(ids: number[]) {
  return request.delete<null>('/categories/batch', { data: ids })
}

// 获取分类详情
export function getCategoryDetail(id: number) {
  return request.get<ApiResponse<Category>>(`/categories/${id}`)
}

// 获取分类树
export function getCategoryTree(parentId?: number) {
  return request.get<ApiResponse<Category[]>>(`/categories/tree`, { params: { parentId } })
}

// 更新分类状态
export function updateCategoryStatus(id: number, status: 0 | 1) {
  return request.put<null>(`/categories/${id}/status?status=${status}`)
}

// 批量更新分类状态
export function batchUpdateCategoryStatus(ids: number[], status: 0 | 1) {
  return request.put<null>(`/categories/batch/status?status=${status}`, ids)
}

// 更新分类排序
export function updateCategorySort(id: number, sortOrder: number) {
  return request.put<null>(`/categories/${id}/sort?sortOrder=${sortOrder}`)
}

// 分页查询分类列表
export function getCategoryPage(params: CategoryQuery) {
  return request.get<ApiResponse<{
    records: Category[]
    total: number
    size: number
    current: number
    pages: number
  }>>('/categories/page', { params })
}

// 获取分类商品数量
export function getCategoryProductCount(categoryId: number) {
  return request.get<ApiResponse<number>>(`/categories/count`, { params: { categoryId } })
} 