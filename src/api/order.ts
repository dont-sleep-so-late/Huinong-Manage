import { request } from '@/utils/http'
import type { ApiResponse } from './auth'

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',    // 待付款
  PAID = 'paid',         // 已付款
  SHIPPED = 'shipped',   // 已发货
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled' // 已取消
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',     // 支付宝
  WECHAT = 'wechat'      // 微信支付
}

// 订单商品接口
export interface OrderItem {
  productId: number
  productName: string
  productImage: string
  specId: number
  specName: string
  specValue: string
  quantity: number
  price: number
  subtotal: number
}

// 物流信息接口
export interface Logistics {
  logisticsCompany: string
  logisticsNumber: string
  status: string
  currentAddress: string
  updatedTime: string
}

// 订单信息接口
export interface Order {
  id: number
  orderNo: string
  userId: number
  userNickname: string
  sellerId: number
  sellerNickname: string
  sellerRealName: string
  totalAmount: number
  freightAmount: number
  payableAmount: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  trackingNo?: string
  logisticsCompany?: string
  shipTime?: string
  paymentTime?: string
  completeTime?: string
  createdTime: string
  updatedTime: string
  remark: string
  items: OrderItem[]
  logistics?: Logistics
}

// 订单查询参数接口
export interface OrderQuery {
  orderNo?: string
  userId?: number
  sellerId?: number
  status?: OrderStatus
  startTime?: string
  endTime?: string
  pageNum?: number
  pageSize?: number
}

// 分页响应接口
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
  orders?: any[]
  optimizeCountSql?: boolean
  searchCount?: boolean
  maxLimit?: number | null
  countId?: string | null
}

// 发货参数接口
export interface ShipParams {
  trackingNo: string
  logisticsCompany: string
}

// 获取订单列表
export function getOrderList(params: OrderQuery) {
  return request.get<ApiResponse<PageResult<Order>>>('/orders', { params })
}

// 获取订单详情
export function getOrderDetail(id: number) {
  return request.get<ApiResponse<Order>>(`/orders/${id}`)
}

// 更新订单状态
export function updateOrderStatus(id: number, status: OrderStatus) {
  return request.put<ApiResponse<void>>(`/orders/${id}/status`, { status })
}

// 订单发货
export function shipOrder(id: number, params: ShipParams) {
  return request.put<ApiResponse<void>>(`/orders/${id}/ship`, params)
}

// 更新订单备注
export function updateOrderRemark(id: number, remark: string) {
  return request.put<ApiResponse<void>>(`/orders/${id}/remark`, { remark })
}

// 删除订单
export function deleteOrder(id: number) {
  return request.delete<ApiResponse<void>>(`/orders/${id}`)
}
