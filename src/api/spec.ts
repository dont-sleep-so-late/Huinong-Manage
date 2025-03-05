import { request } from '@/utils/http'
import { ApiResponse } from './auth'
// 规格模板接口
export interface SpecTemplate {
  id: number
  name: string
  categoryId: number
  categoryName?: string
  status: 0 | 1
  createdTime?: string
  updatedTime?: string
  attributes?: SpecAttribute[]
}

// 规格属性接口
export interface SpecAttribute {
  id: number
  templateId: number
  name: string
  inputType: string
  sortOrder: number
  isRequired: 0 | 1
  status: 0 | 1
  createdTime?: string
  updatedTime?: string
  values?: SpecAttributeValue[]
}

// 规格属性值接口
export interface SpecAttributeValue {
  id: number
  attributeId: number
  value: string
  sortOrder: number
  createdTime?: string
  updatedTime?: string
}

// 商品规格接口
export interface ProductSpec {
  id: number
  productId: number
  productName?: string
  specName: string
  specValue: string
  price: number
  stock: number
  skuCode?: string
  status: 0 | 1
  createdTime?: string
  updatedTime?: string
}

// 规格模板创建/更新DTO
export interface SpecTemplateDTO {
  name: string
  categoryId: number
  status?: 0 | 1
}

// 规格属性创建/更新DTO
export interface SpecAttributeDTO {
  templateId: number
  name: string
  inputType: string
  sortOrder?: number
  isRequired?: 0 | 1
  status?: 0 | 1
}

// 规格属性值创建/更新DTO
export interface SpecAttributeValueDTO {
  attributeId: number
  value: string
  sortOrder?: number
}

// 商品规格创建/更新DTO
export interface ProductSpecDTO {
  id?: number
  productId: number
  specName: string
  specValue: string
  price: number
  stock: number
  skuCode?: string
  status?: 0 | 1
}

export interface ProductSpec extends ProductSpecDTO {
  id: number
  createdTime?: string
  updatedTime?: string
}

// 批量创建商品规格DTO
export interface BatchProductSpecDTO {
  productId: number
  specDTOList: Omit<ProductSpecDTO, 'productId'>[]
}

// 规格模板查询参数
export interface SpecTemplateQuery {
  pageNum?: number
  pageSize?: number
  name?: string
  categoryId?: number
  status?: 0 | 1
}

// ===== 规格模板管理接口 =====

// 创建规格模板
export function createSpecTemplate(data: SpecTemplateDTO) {
  return request.post<ApiResponse<SpecTemplate>>('/specs/templates', data)
}

// 更新规格模板
export function updateSpecTemplate(id: number, data: Partial<SpecTemplateDTO>) {
  return request.put<null>(`/specs/templates/${id}`, data)
}

// 删除规格模板
export function deleteSpecTemplate(id: number) {
  return request.delete<null>(`/specs/templates/${id}`)
}

// 获取规格模板详情
export function getSpecTemplateDetail(id: number) {
  return request.get<ApiResponse<SpecTemplate>>(`/specs/templates/${id}`)
}

// 分页查询规格模板
export function getSpecTemplatePage(params: SpecTemplateQuery) {
  return request.get<ApiResponse<{
    records: SpecTemplate[]
    total: number
    size: number
    current: number
    pages: number
  }>>('/specs/templates/page', { params })
}

// 获取规格模板列表
export function getSpecTemplateList(params?: Partial<SpecTemplateQuery>) {
  return request.get<ApiResponse<SpecTemplate[]>>('/specs/templates/list', { params })
}

// 更新规格模板状态
export function updateSpecTemplateStatus(id: number, status: 0 | 1) {
  return request.put<null>(`/specs/templates/${id}/status?status=${status}`)
}

// ===== 规格属性管理接口 =====

// 创建规格属性
export function createSpecAttribute(data: SpecAttributeDTO) {
  return request.post<ApiResponse<SpecAttribute>>('/specs/attributes', data)
}

// 更新规格属性
export function updateSpecAttribute(id: number, data: Partial<SpecAttributeDTO>) {
  return request.put<null>(`/specs/attributes/${id}`, data)
}

// 删除规格属性
export function deleteSpecAttribute(id: number) {
  return request.delete<null>(`/specs/attributes/${id}`)
}

// 获取规格属性详情
export function getSpecAttributeDetail(id: number) {
  return request.get<ApiResponse<SpecAttribute>>(`/specs/attributes/${id}`)
}

// 获取规格属性列表
export function getSpecAttributeList(templateId: number) {
  return request.get<ApiResponse<SpecAttribute[]>>(`/specs/attributes/list`, { params: { templateId } })
}

// ===== 规格属性值管理接口 =====

// 创建规格属性值
export function createSpecAttributeValue(data: SpecAttributeValueDTO) {
  return request.post<ApiResponse<SpecAttributeValue>>('/specs/attribute-values', data)
}

// 更新规格属性值
export function updateSpecAttributeValue(id: number, data: Partial<SpecAttributeValueDTO>) {
  return request.put<null>(`/specs/attribute-values/${id}`, data)
}

// 删除规格属性值
export function deleteSpecAttributeValue(id: number) {
  return request.delete<null>(`/specs/attribute-values/${id}`)
}

// 获取规格属性值列表
export function getSpecAttributeValueList(attributeId: number) {
  return request.get<ApiResponse<SpecAttributeValue[]>>(`/specs/attribute-values/list`, { params: { attributeId } })
}

// ===== 商品规格管理接口 =====

// 创建商品规格
export function createProductSpec(data: ProductSpecDTO) {
  return request.post<ProductSpec>('/specs/product-specs', data)
}

// 更新商品规格
export function updateProductSpec(id: number, data: Partial<ProductSpecDTO>) {
  return request.put<null>(`/specs/product-specs/${id}`, data)
}

// 删除商品规格
export function deleteProductSpec(id: number) {
  return request.delete<null>(`/specs/product-specs/${id}`)
}

// 获取商品规格详情
export function getProductSpecDetail(id: number) {
  return request.get<ApiResponse<ProductSpec>>(`/specs/product-specs/${id}`)
}

// 获取商品规格列表
export function getProductSpecList(productId: number) {
  return request.get<ApiResponse<ProductSpec[]>>(`/specs/product-specs/list`, { params: { productId } })
}

// 更新商品规格状态
export function updateProductSpecStatus(id: number, status: 0 | 1) {
  return request.put<null>(`/specs/product-specs/${id}/status?status=${status}`)
}

// 更新商品规格库存
export function updateProductSpecStock(id: number, stock: number) {
  return request.put<null>(`/specs/product-specs/${id}/stock?stock=${stock}`)
}

// 更新商品规格价格
export function updateProductSpecPrice(id: number, price: number) {
  return request.put<null>(`/specs/product-specs/${id}/price?price=${price}`)
}

// 批量创建商品规格
export function batchCreateProductSpec(data: BatchProductSpecDTO) {
  return request.post<ApiResponse<ProductSpec[]>>(`/specs/product-specs/batch`, data)
} 