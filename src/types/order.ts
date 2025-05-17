// 退款订单查询参数
export interface RefundOrderQuery {
  pageNum: number
  pageSize: number
  status?: number // 0-待处理，1-处理中，2-已完成，3-已拒绝
  type?: number // 1-退款，2-退货退款，3-换货
  orderNo?: string
  refundNo?: string
  startTime?: string
  endTime?: string
}

// 退款订单信息
export interface RefundOrder {
  id: number
  orderId: number
  orderNo: string
  refundAmount: number
  reason: string
  status: string // PENDING-待处理，PROCESSING-处理中，COMPLETED-已完成，REJECTED-已拒绝
  rejectReason: string | null
  createTime: string
  updateTime: string
  orderItem: any | null
}

// 退款处理参数
export interface RefundHandleParams {
  result: number // 1-同意，0-拒绝
  note: string
}

// 退款处理参数
export interface RefundParams {
  amount: number
  type: number // 1-原路退回，2-退回余额
  note: string
}

// 分页响应结构
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
  orders: any[]
  optimizeCountSql: boolean
  searchCount: boolean
  maxLimit: number | null
  countId: string | null
}

// API响应结构
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
} 