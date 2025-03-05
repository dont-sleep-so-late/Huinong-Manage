import { request } from '@/utils/http'
import { ApiResponse } from './auth'
// 消息类型定义
export interface Message {
  id: number
  title: string
  content: string
  type: 1 | 2 | 3 // 1-订单通知，2-商品审核通知，3-系统通知
  isRead: boolean
  createdTime: string
  sender: string
  relatedId?: number // 关联ID，如订单ID、商品ID等
}

// 消息查询参数
export interface MessageQuery {
  pageNum?: number
  pageSize?: number
  type?: 1 | 2 | 3
  isRead?: boolean
}

// 分页响应结构
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 获取消息列表
 * @param params 查询参数
 * @returns 消息列表分页数据
 */
export function getMessageList(params: MessageQuery) {
  return request.get<ApiResponse<PageResult<Message>>>('/messages', { params })
}

/**
 * 获取未读消息数量
 * @param type 消息类型：1-订单通知，2-商品审核通知，3-系统通知
 * @returns 未读消息数量
 */
export function getUnreadMessageCount(type?: 1 | 2 | 3) {
  const params = type ? { type } : {}
  return request.get<ApiResponse<number>>('/messages/unread/count', { params })
}

/**
 * 批量标记消息为已读
 * @param ids 消息ID列表
 * @returns 标记成功的消息数量
 */
export function batchMarkMessagesAsRead(ids: number[]) {
  return request.put<ApiResponse<number>>('/messages/batch/read', ids)
}

/**
 * 批量删除消息
 * @param ids 消息ID列表
 * @returns 删除成功的消息数量
 */
export function batchDeleteMessages(ids: number[]) {
  return request.delete<ApiResponse<number>>('/messages/batch', { data: ids })
} 