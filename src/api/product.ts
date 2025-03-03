import { request } from '@/utils/http'

export interface Product {
  id: number
  name: string
  description: string
  mainImage: string
  detailImages: string[]
  categoryId: number
  categoryName?: string
  price: number
  stock: number
  status: 0 | 1 // 0-下架 1-上架
  salesVolume?: number
  region: string
  unit: string
  weight: number
  auditStatus?: 0 | 1 | 2 // 0-待审核 1-已通过 2-已拒绝
  auditRemark?: string
  createdTime?: string
  updatedTime?: string
  sellerId?: number
  sellerName?: string
}

export interface ProductSpec {
  specName: string
  specValue: string
  price: number
  stock: number
  skuCode?: string
  status: 0 | 1
}

export interface ProductCreateDTO {
  name: string
  description: string
  mainImage: string
  detailImages: string[]
  categoryId: number
  price: number
  stock: number
  status: 0 | 1
  region: string
  unit: string
  weight: number
  specs?: ProductSpec[]
}

export interface ProductQuery {
  pageNum?: number
  pageSize?: number
  name?: string
  categoryId?: number
  categoryIds?: number[] | string[] // 添加categoryIds字段，支持数组形式的分类ID
  status?: number
  minPrice?: number
  maxPrice?: number
  orderBy?: string
  orderType?: string
}

export interface AuditParams {
  id: number
  status: 1 | 2
  auditRemark: string
}

// 获取商品列表（分页）
export function getProductList(params: ProductQuery) {
  return request.get<{
    records: Product[];
    total: number;
    size: number;
    current: number;
    pages: number;
  }>('/products/list', { params })
}

// 获取商品总数
export function getProductCount(params: Partial<ProductQuery>) {
  return request.get<number>('/products/count', { params })
}

// 获取商品详情
export function getProductDetail(id: number) {
  return request.get<Product>(`/products/${id}`)
}

// 添加商品
export function addProduct(data: ProductCreateDTO) {
  return request.post<Product>('/products', data)
}

// 更新商品
export function updateProduct(id: number, data: Partial<ProductCreateDTO>) {
  return request.put<Product>(`/products/${id}`, data)
}

// 删除商品
export function deleteProduct(id: number) {
  return request.delete(`/products/${id}`)
}

// 批量删除商品
export function batchDeleteProducts(ids: number[]) {
  return request.delete('/products/batch', { data: ids })
}

// 更新商品状态
export function updateProductStatus(id: number, status: 0 | 1) {
  return request.put(`/products/${id}/status?status=${status}`)
}

// 批量更新商品状态
export function batchUpdateProductStatus(ids: number[], status: 0 | 1) {
  return request.put(`/products/batch/status?status=${status}`, ids)
}

// 获取商品分类
export function getCategories() {
  return request.get<Array<{ id: number; name: string; children?: Array<{ id: number; name: string }> }>>('/categories/tree')
}

// 审核商品
export function auditProduct(data: AuditParams) {
  return request.put(`/products/${data.id}/audit`, data)
}

// 批量审核商品
export function batchAuditProducts(data: { ids: number[]; status: 1 | 2; remark?: string }) {
  return request.put('/products/batch/audit', data)
}

// 获取待审核商品列表
export interface AuditProductQuery extends Omit<ProductQuery, 'status'> {
  auditStatus?: 0 | 1 | 2  // 0-待审核 1-审核通过 2-审核拒绝
}

export function getPendingAuditProducts(params: AuditProductQuery) {
  return request.get<{
    records: Product[];
    total: number;
    size: number;
    current: number;
    pages: number;
  }>('/products/audit/pending', { params })
}

// 获取待审核商品数量
export function getPendingAuditCount() {
  return request.get<number>('/products/audit/count')
} 