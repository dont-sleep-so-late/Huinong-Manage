import request from '@/utils/http'
import type { PageResult, ApiResponse } from '@/types/order'
import type { RefundOrder, RefundOrderQuery, RefundHandleParams, RefundParams } from '@/types/order'

/**
 * 获取退款订单列表
 * @param params 查询参数
 * @returns 退款订单列表分页数据
 */
export function getRefundOrderList(params: RefundOrderQuery) {
  return request.get<ApiResponse<PageResult<RefundOrder>>>('/orders/refunds', { params })
}

/**
 * 处理退款申请
 * @param id 退款订单ID
 * @param data 处理参数
 * @returns 处理结果
 */
export function handleRefund(id: number, data: RefundHandleParams) {
  return request.put<ApiResponse<void>>(`/orders/refunds/${id}/handle`, data)
}

/**
 * 确认收货
 * @param id 退款订单ID
 * @returns 处理结果
 */
export function confirmReceive(id: number) {
  return request.put<ApiResponse<void>>(`/orders/refunds/${id}/receive`)
}

/**
 * 退款处理
 * @param id 退款订单ID
 * @param data 退款参数
 * @returns 处理结果
 */
export function processRefund(id: number, data: RefundParams) {
  return request.put<ApiResponse<void>>(`/orders/refunds/${id}/refund`, data)
}

/**
 * 导出退款订单
 * @param params 查询参数
 * @returns 导出文件
 */
export function exportRefundOrders(params: RefundOrderQuery) {
  return request.get<Blob>('/orders/refunds/export', {
    params,
    responseType: 'blob'
  })
} 