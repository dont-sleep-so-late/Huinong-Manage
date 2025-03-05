import { request } from '@/utils/http'
import { ApiResponse } from './auth'

// 认证状态类型
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

// 认证列表查询参数接口
export interface VerificationQuery {
  pageNum?: number
  pageSize?: number
  realName?: string
  idCardNumber?: string
  status?: VerificationStatus
  startTime?: string
  endTime?: string
}

// 认证记录接口
export interface VerificationRecord {
  id: number
  userId: number
  username: string
  realName: string
  maskedIdCardNumber: string
  idCardFrontImage: string
  idCardBackImage: string
  idCardHandImage: string | null
  businessLicenseImage: string | null
  shopName: string
  shopAddress: string
  contactPhone: string
  status: VerificationStatus
  rejectReason: string | null
  createdTime: string
  updatedTime: string
}

// 分页数据接口
export interface PageData<T> {
  total: number
  list: T[]
}

// 审核参数接口
export interface AuditParams {
  id: number
  status: VerificationStatus
  rejectReason?: string
}

// 分页查询卖家认证列表
export const getVerificationList = (params: VerificationQuery) => {
  return request.get<ApiResponse<PageData<VerificationRecord>>>('/seller/verification/page', { params })
}

// 获取认证详情
export const getVerificationDetail = (id: number) => {
  return request.get<ApiResponse<VerificationRecord>>(`/seller/verification/${id}`)
}

// 审核卖家认证
export const auditVerification = (data: AuditParams) => {
  return request.post<ApiResponse<null>>('/seller/verification/audit', data)
} 