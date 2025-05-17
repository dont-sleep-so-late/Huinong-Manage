<template>
  <div class="after-sale">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <!-- <a-form-item label="售后编号">
          <a-input
            v-model:value="searchForm.refundNo"
            placeholder="请输入售后编号"
            allow-clear
          />
        </a-form-item> -->
        <a-form-item label="订单编号">
          <a-input
            v-model:value="searchForm.orderNo"
            placeholder="请输入订单编号"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="售后状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择售后状态"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="PENDING">待处理</a-select-option>
            <a-select-option value="PROCESSING">处理中</a-select-option>
            <a-select-option value="COMPLETED">已完成</a-select-option>
            <a-select-option value="REJECTED">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="售后类型">
          <a-select
            v-model:value="searchForm.type"
            placeholder="请选择售后类型"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="1">退款</a-select-option>
            <a-select-option :value="2">退货退款</a-select-option>
            <a-select-option :value="3">换货</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="申请时间">
          <a-range-picker
            v-model:value="searchForm.createTime"
            :show-time="{ format: 'HH:mm:ss' }"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><search-outlined /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><redo-outlined /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格 -->
    <a-card class="table-card" :bordered="false">
      <template #extra>
        <a-button @click="handleExport">
          <template #icon><export-outlined /></template>
          导出
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(text)">
              {{ getStatusText(text) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getTypeColor(text)">
              {{ getTypeText(text) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'amount'">
            ¥{{ text.toFixed(2) }}
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleDetail(record)">详情</a>
              <template v-if="record.status === 'PENDING'">
                <a-divider type="vertical" />
                <a @click="handleAudit(record)">审核</a>
              </template>
              <template v-if="record.status === 'PROCESSING' && record.type === 2">
                <a-divider type="vertical" />
                <a @click="handleReceive(record)">确认收货</a>
              </template>
              <!-- <template v-if="record.status === 'PENDING' && record.type !== 3">
                <a-divider type="vertical" />
                <a @click="handleRefund(record)">退款</a>
              </template> -->
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="售后详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions bordered>
        <a-descriptions-item label="售后编号">
          {{ currentRecord?.refundNo }}
        </a-descriptions-item>
        <a-descriptions-item label="订单编号">
          {{ currentRecord?.orderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="售后状态">
          <a-tag :color="getStatusColor(currentRecord?.status)">
            {{ getStatusText(currentRecord?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag :color="getTypeColor(currentRecord?.type)">
            {{ getTypeText(currentRecord?.type) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请金额">
          ¥{{ currentRecord?.refundAmount?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="申请时间">
          {{ currentRecord?.createTime }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>申请信息</h3>
      <a-descriptions bordered>
        <a-descriptions-item label="申请原因">
          {{ currentRecord?.reason }}
        </a-descriptions-item>
        <a-descriptions-item label="拒绝原因" v-if="currentRecord?.rejectReason">
          {{ currentRecord?.rejectReason }}
        </a-descriptions-item>
      </a-descriptions>

      <template v-if="currentRecord?.status !== 0">
        <a-divider />
        <h3>处理信息</h3>
        <a-descriptions bordered>
          <a-descriptions-item label="处理结果">
            {{ currentRecord?.status === 3 ? '拒绝' : '同意' }}
          </a-descriptions-item>
          <a-descriptions-item label="处理时间">
            {{ currentRecord?.updateTime }}
          </a-descriptions-item>
        </a-descriptions>
      </template>

      <template v-if="currentRecord?.status === 2">
        <a-divider />
        <h3>退款信息</h3>
        <a-descriptions bordered>
          <a-descriptions-item label="退款金额">
            ¥{{ currentRecord?.refundAmount?.toFixed(2) }}
          </a-descriptions-item>
          <a-descriptions-item label="退款方式">
            {{ currentRecord?.refundType === 1 ? '原路退回' : '退回余额' }}
          </a-descriptions-item>
          <a-descriptions-item label="退款时间">
            {{ currentRecord?.refundTime }}
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-modal>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:open="auditVisible"
      title="售后审核"
      @ok="handleAuditOk"
      @cancel="handleAuditCancel"
    >
      <a-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="审核结果" name="result">
          <a-radio-group v-model:value="auditForm.result">
            <a-radio :value="1">同意</a-radio>
            <a-radio :value="0">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="处理说明" name="note">
          <a-textarea
            v-model:value="auditForm.note"
            :rows="4"
            placeholder="请输入处理说明"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 退款弹窗 -->
    <a-modal
      v-model:open="refundVisible"
      title="退款处理"
      @ok="handleRefundOk"
      @cancel="handleRefundCancel"
    >
      <a-form
        ref="refundFormRef"
        :model="refundForm"
        :rules="refundRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="退款金额" name="amount">
          <a-input-number
            v-model:value="refundForm.amount"
            :min="0"
            :max="currentRecord?.refundAmount"
            :precision="2"
            style="width: 100%"
            placeholder="请输入退款金额"
          />
        </a-form-item>
        <a-form-item label="退款方式" name="type">
          <a-radio-group v-model:value="refundForm.type">
            <a-radio :value="1">原路退回</a-radio>
            <a-radio :value="2">退回余额</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注说明" name="note">
          <a-textarea
            v-model:value="refundForm.note"
            :rows="4"
            placeholder="请输入备注说明"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import {
  SearchOutlined,
  RedoOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import { getRefundOrderList, handleRefund as handleRefundApi, confirmReceive, processRefund, exportRefundOrders } from '@/api/refund'
import type { RefundOrder, RefundOrderQuery, RefundHandleParams, RefundParams } from '@/types/order'

interface SearchForm {
  refundNo?: string
  orderNo?: string
  status?: string // PENDING-待处理，PROCESSING-处理中，COMPLETED-已完成，REJECTED-已拒绝
  type?: number
  createTime?: [Dayjs, Dayjs]
  pageNum: number
  pageSize: number
}

interface AuditForm {
  result: number
  note: string
}

interface RefundForm {
  amount: number
  type: number
  note: string
}

// 表格列定义
const columns = [
  {
    title: '订单编号',
    dataIndex: 'orderNo',
    key: 'orderNo'
  },
  {
    title: '售后状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '申请金额',
    dataIndex: 'refundAmount',
    key: 'refundAmount'
  },
  {
    title: '申请原因',
    dataIndex: 'reason',
    key: 'reason'
  },
  {
    title: '申请时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  refundNo: '',
  orderNo: '',
  status: undefined,
  type: undefined,
  createTime: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<RefundOrder[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 详情弹窗
const detailVisible = ref(false)
const currentRecord = ref<RefundOrder>()

// 审核弹窗
const auditVisible = ref(false)
const auditFormRef = ref()
const auditForm = reactive<AuditForm>({
  result: 1,
  note: ''
})

// 审核表单验证规则
const auditRules = {
  note: [
    { required: true, message: '请输入处理说明' }
  ]
}

// 退款弹窗
const refundVisible = ref(false)
const refundFormRef = ref()
const refundForm = reactive<RefundForm>({
  amount: 0,
  type: 1,
  note: ''
})

// 退款表单验证规则
const refundRules = {
  amount: [
    { required: true, message: '请输入退款金额' }
  ],
  type: [
    { required: true, message: '请选择退款方式' }
  ]
}

// 获取状态颜色
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'PROCESSING':
      return 'processing'
    case 'COMPLETED':
      return 'success'
    case 'REJECTED':
      return 'error'
    default:
      return 'default'
  }
}

// 获取状态文本
const getStatusText = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return '待处理'
    case 'PROCESSING':
      return '处理中'
    case 'COMPLETED':
      return '已完成'
    case 'REJECTED':
      return '已拒绝'
    case 'APPROVED':
      return '已同意'
    case 'REJECTED':
      return '已拒绝'
    default:
      return '未知'
  }
}

// 获取类型颜色
const getTypeColor = (type?: number) => {
  switch (type) {
    case 1:
      return 'blue'
    case 2:
      return 'purple'
    case 3:
      return 'cyan'
    default:
      return 'default'
  }
}

// 获取类型文本
const getTypeText = (type?: number) => {
  switch (type) {
    case 1:
      return '退款'
    case 2:
      return '退货退款'
    case 3:
      return '换货'
    default:
      return '未知'
  }
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.refundNo = ''
  searchForm.orderNo = ''
  searchForm.status = undefined
  searchForm.type = undefined
  searchForm.createTime = undefined
  handleSearch()
}

// 导出
const handleExport = async () => {
  try {
    const params: RefundOrderQuery = {
      pageNum: 1,
      pageSize: 9999,
      refundNo: searchForm.refundNo,
      orderNo: searchForm.orderNo,
      status: searchForm.status,
      type: searchForm.type,
      startTime: searchForm.createTime?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
      endTime: searchForm.createTime?.[1]?.format('YYYY-MM-DD HH:mm:ss')
    }
    const res = await exportRefundOrders(params)
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `退款订单列表_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    message.success('导出成功')
  } catch (error) {
    message.error('导出失败')
  }
}

// 查看详情
const handleDetail = (record: RefundOrder) => {
  currentRecord.value = record
  detailVisible.value = true
}

// 审核
const handleAudit = (record: RefundOrder) => {
  currentRecord.value = record
  auditForm.result = 1
  auditForm.note = ''
  auditVisible.value = true
}

// 审核确认
const handleAuditOk = () => {
  auditFormRef.value?.validate().then(async () => {
    try {
      if (!currentRecord.value) return
      const params: RefundHandleParams = {
        result: auditForm.result,
        note: auditForm.note
      }
      await handleRefundApi(currentRecord.value.id, params)
      message.success('审核成功')
      auditVisible.value = false
      fetchData()
    } catch (error) {
      message.error('审核失败')
    }
  })
}

// 审核取消
const handleAuditCancel = () => {
  auditVisible.value = false
  auditFormRef.value?.resetFields()
}

// 确认收货
const handleReceive = async (record: RefundOrder) => {
  try {
    await confirmReceive(record.id)
    message.success('确认成功')
    fetchData()
  } catch (error) {
    message.error('确认失败')
  }
}

// 退款
const handleRefund = (record: RefundOrder) => {
  currentRecord.value = record
  refundForm.amount = record.refundAmount
  refundForm.type = 1
  refundForm.note = ''
  refundVisible.value = true
}

// 退款确认
const handleRefundOk = () => {
  refundFormRef.value?.validate().then(async () => {
    try {
      if (!currentRecord.value) return
      const params: RefundParams = {
        amount: refundForm.amount,
        type: refundForm.type,
        note: refundForm.note
      }
      await processRefund(currentRecord.value.id, params)
      message.success('退款成功')
      refundVisible.value = false
      fetchData()
    } catch (error) {
      message.error('退款失败')
    }
  })
}

// 退款取消
const handleRefundCancel = () => {
  refundVisible.value = false
  refundFormRef.value?.resetFields()
}

// 表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

// 获取表格数据
const fetchData = async () => {
    const params: RefundOrderQuery = {
      pageNum: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      refundNo: searchForm.refundNo,
      orderNo: searchForm.orderNo,
      status: searchForm.status,
      type: searchForm.type,
      startTime: searchForm.createTime?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
      endTime: searchForm.createTime?.[1]?.format('YYYY-MM-DD HH:mm:ss')
    }
    const res = await getRefundOrderList(params)
    tableData.value = res.data.records
    pagination.total = res.data.total
      
}

// 初始化
fetchData()
</script>

<style lang="less" scoped>
.after-sale {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    :deep(.ant-card-body) {
      padding-top: 0;
    }
  }
}
</style> 