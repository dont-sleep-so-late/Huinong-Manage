import { http } from '@/utils/http'

export interface Product {
  id: number
  name: string
  categoryId: number
  categoryName: string
  price: number
  originalPrice: number
  description: string
  images: string[]
  status: 0 | 1 | 2 | 3 // 0-待审核 1-审核通过 2-审核拒绝 3-下架
  auditReason: string
  createTime: string
  updateTime: string
  sellerId: number
  sellerName: string
}

export interface ProductQuery {
  page: number
  pageSize: number
  name?: string
  categoryId?: number
  status?: number
  sellerId?: number
  startTime?: string
  endTime?: string
}

export interface AuditParams {
  id: number
  status: 1 | 2
  auditReason: string
}

// 获取商品列表
export function getProductList(params: ProductQuery) {
  return http.get<{ data: Product[]; total: number }>('/api/products', { params })
}

// 获取商品详情
export function getProductDetail(id: number) {
  return http.get<Product>(`/api/products/${id}`)
}

// 审核商品
export function auditProduct(data: AuditParams) {
  return http.put(`/api/products/${data.id}/audit`, data)
}

// 批量审核商品
export function batchAuditProducts(data: { ids: number[]; status: 1 | 2; auditReason: string }) {
  return http.put('/api/products/batch-audit', data)
}

// 获取商品分类
export function getCategories() {
  return http.get<Array<{ id: number; name: string }>>('/api/categories')
} 