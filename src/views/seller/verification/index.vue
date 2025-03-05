<template>
  <div class="verification-container">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="真实姓名">
          <a-input
            v-model:value="searchForm.realName"
            placeholder="请输入真实姓名"
            allowClear
          />
        </a-form-item>
        <a-form-item label="身份证号">
          <a-input
            v-model:value="searchForm.idCardNumber"
            placeholder="请输入身份证号"
            allowClear
          />
        </a-form-item>
        <a-form-item label="认证状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            allowClear
            style="width: 120px"
          >
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="rejected">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="申请时间">
          <a-range-picker
            v-model:value="dateRange"
            :show-time="{ format: 'HH:mm:ss' }"
            format="YYYY-MM-DD HH:mm:ss"
            @change="onDateRangeChange"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <search-outlined />
              查询
            </a-button>
            <a-button @click="handleReset">
              <reload-outlined />
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false" style="margin-top: 16px">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      />
    </a-card>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="认证详情"
      :footer="null"
      width="800px"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="用户名">
          {{ currentRecord?.username }}
        </a-descriptions-item>
        <a-descriptions-item label="真实姓名">
          {{ currentRecord?.realName }}
        </a-descriptions-item>
        <a-descriptions-item label="身份证号">
          {{ currentRecord?.maskedIdCardNumber }}
        </a-descriptions-item>
        <a-descriptions-item label="联系电话">
          {{ currentRecord?.contactPhone }}
        </a-descriptions-item>
        <a-descriptions-item label="店铺名称">
          {{ currentRecord?.shopName }}
        </a-descriptions-item>
        <a-descriptions-item label="店铺地址">
          {{ currentRecord?.shopAddress }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentRecord?.status ? getStatusColor(currentRecord.status) : ''">
            {{ currentRecord?.status ? getStatusText(currentRecord.status) : '' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请时间">
          {{ currentRecord?.createdTime }}
        </a-descriptions-item>
        <template v-if="currentRecord?.status === 'rejected'">
          <a-descriptions-item label="拒绝原因" :span="2">
            {{ currentRecord?.rejectReason }}
          </a-descriptions-item>
        </template>
      </a-descriptions>
      <div class="id-card-images">
        <div class="image-item">
          <div class="image-title">身份证正面</div>
          <a-image
            :src="currentRecord?.idCardFrontImage || ''"
            :width="300"
            alt="身份证正面"
          />
        </div>
        <div class="image-item">
          <div class="image-title">身份证反面</div>
          <a-image
            :src="currentRecord?.idCardBackImage || ''"
            :width="300"
            alt="身份证反面"
          />
        </div>
        <div class="image-item">
          <div class="image-title">手持身份证</div>
          <a-image
            :src="currentRecord?.idCardHandImage || ''"
            :width="300"
            alt="手持身份证"
          />
        </div>
      </div>
      <div v-if="currentRecord?.businessLicenseImage" class="business-license">
        <div class="image-title">营业执照</div>
        <a-image
          :src="currentRecord.businessLicenseImage || ''"
          :width="300"
          alt="营业执照"
        />
      </div>
    </a-modal>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:open="auditVisible"
      title="认证审核"
      @ok="handleAuditSubmit"
      :confirmLoading="auditLoading"
    >
      <a-form :model="auditForm" :rules="auditRules" ref="auditFormRef">
        <a-form-item label="审核结果" name="status">
          <a-radio-group v-model:value="auditForm.status">
            <a-radio-button value="approved">通过</a-radio-button>
            <a-radio-button value="rejected">拒绝</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="auditForm.status === 'rejected'"
          label="拒绝原因"
          name="rejectReason"
        >
          <a-textarea
            v-model:value="auditForm.rejectReason"
            placeholder="请输入拒绝原因"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Tag, Button, Space } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import {
  getVerificationList,
  getVerificationDetail,
  auditVerification,
  type VerificationQuery,
  type VerificationRecord,
  type VerificationStatus
} from '@/api/seller'
import type { FormInstance } from 'ant-design-vue'
import type { RuleObject } from 'ant-design-vue/es/form'
import { h } from 'vue'

// 搜索表单数据
const searchForm = reactive<VerificationQuery>({
  pageNum: 1,
  pageSize: 10,
  realName: '',
  idCardNumber: '',
  status: undefined,
  startTime: undefined,
  endTime: undefined
})

// 日期范围
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>()

// 表格列定义
const columns: ColumnsType<VerificationRecord> = [
  {
    title: '用户名',
    dataIndex: 'username',
    width: 120
  },
  {
    title: '真实姓名',
    dataIndex: 'realName',
    width: 120
  },
  {
    title: '身份证号',
    dataIndex: 'maskedIdCardNumber',
    width: 180
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ record }: { record: VerificationRecord }) => {
      return h(Tag, { color: getStatusColor(record.status) }, () => getStatusText(record.status))
    }
  },
  {
    title: '申请时间',
    dataIndex: 'createdTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right' as const,
    customRender: ({ record }: { record: VerificationRecord }) => {
      return h(Space, {}, () => [
        h(Button, { type: 'link', onClick: () => handleView(record) }, () => '查看'),
        record.status === 'pending' && h(Button, { type: 'link', onClick: () => handleAudit(record) }, () => '审核')
      ])
    }
  }
]

// 表格数据
const tableData = ref<VerificationRecord[]>([])
const loading = ref(false)
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 详情弹窗
const detailVisible = ref(false)
const currentRecord = ref<VerificationRecord>()

// 审核弹窗
const auditVisible = ref(false)
const auditLoading = ref(false)
const auditFormRef = ref<FormInstance>()
const auditForm = reactive({
  id: 0,
  status: 'approved' as VerificationStatus,
  rejectReason: ''
})

// 审核表单验证规则
const auditRules: Record<string, RuleObject[]> = {
  status: [{ required: true, message: '请选择审核结果' }],
  rejectReason: [
    {
      required: true,
      message: '请输入拒绝原因',
      trigger: 'blur',
      validator: async (_rule: RuleObject, value: string) => {
        if (auditForm.status === 'rejected' && !value) {
          return Promise.reject('请输入拒绝原因')
        }
        return Promise.resolve()
      }
    }
  ]
}

// 获取状态颜色
const getStatusColor = (status: VerificationStatus) => {
  const colorMap: Record<VerificationStatus, string> = {
    pending: 'processing',
    approved: 'success',
    rejected: 'error'
  }
  return colorMap[status]
}

// 获取状态文本
const getStatusText = (status: VerificationStatus) => {
  const textMap: Record<VerificationStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status]
}

// 日期范围变化处理
const onDateRangeChange = (_: any, dateStrings: [string, string]) => {
  searchForm.startTime = dateStrings[0] || undefined
  searchForm.endTime = dateStrings[1] || undefined
}

// 查询数据
const fetchData = async () => {
  try {
    loading.value = true
    const res = await getVerificationList(searchForm)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取认证列表失败:', error)
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 查询按钮点击
const handleSearch = () => {
  searchForm.pageNum = 1
  fetchData()
}

// 重置按钮点击
const handleReset = () => {
  searchForm.realName = ''
  searchForm.idCardNumber = ''
  searchForm.status = undefined
  searchForm.startTime = undefined
  searchForm.endTime = undefined
  dateRange.value = undefined
  handleSearch()
}

// 表格变化处理
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  searchForm.pageNum = pagination.current
  searchForm.pageSize = pagination.pageSize
  fetchData()
}

// 查看详情
const handleView = async (record: VerificationRecord) => {
  try {
    const res = await getVerificationDetail(record.id)
    console.log(res)
    if (res.code === 200 && res.data) {
      currentRecord.value = res.data
      detailVisible.value = true
    } else {
      message.error(res.msg || '获取详情失败')
    }
  } catch (error) {
    console.error('获取认证详情失败:', error)
    message.error('获取详情失败')
  }
}

// 打开审核弹窗
const handleAudit = (record: VerificationRecord) => {
  auditForm.id = record.id
  auditForm.status = 'approved'
  auditForm.rejectReason = ''
  auditVisible.value = true
}

// 提交审核
const handleAuditSubmit = async () => {
  try {
    if (!auditFormRef.value) return
    await auditFormRef.value.validate()
    auditLoading.value = true

    const res = await auditVerification({
      id: auditForm.id,
      status: auditForm.status,
      rejectReason: auditForm.status === 'rejected' ? auditForm.rejectReason : undefined
    })

    if (res.code === 200) {
      message.success('审核成功')
      auditVisible.value = false
      fetchData()
    } else {
      message.error(res.msg || '审核失败')
    }
  } catch (error) {
    console.error('审核失败:', error)
    message.error('审核失败')
  } finally {
    auditLoading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style lang="less" scoped>
.verification-container {
  padding: 24px;

  .search-card {
    margin-bottom: 16px;
  }

  .id-card-images {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;

    .image-item {
      text-align: center;

      .image-title {
        margin-bottom: 8px;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 500;
      }
    }
  }

  .business-license {
    margin-top: 24px;
    text-align: center;

    .image-title {
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
    }
  }
}
</style> 