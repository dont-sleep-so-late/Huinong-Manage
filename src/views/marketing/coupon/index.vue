<template>
  <div class="coupon">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="优惠券名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入优惠券名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="优惠券类型">
          <a-select
            v-model:value="searchForm.type"
            placeholder="请选择优惠券类型"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="1">满减券</a-select-option>
            <a-select-option :value="2">折扣券</a-select-option>
            <a-select-option :value="3">立减券</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="使用状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择使用状态"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="0">未开始</a-select-option>
            <a-select-option :value="1">进行中</a-select-option>
            <a-select-option :value="2">已结束</a-select-option>
            <a-select-option :value="3">已失效</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="有效期">
          <a-range-picker
            v-model:value="searchForm.validTime"
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
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><plus-outlined /></template>
            新增
          </a-button>
          <a-button @click="handleExport">
            <template #icon><export-outlined /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(text)">
              {{ getTypeText(text) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'value'">
            <template v-if="record.type === 1">
              满{{ record.useCondition }}减{{ record.value }}
            </template>
            <template v-else-if="record.type === 2">
              {{ record.value }}折
            </template>
            <template v-else>
              立减{{ record.value }}
            </template>
          </template>
          
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(text)">
              {{ getStatusText(text) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a @click="handleGrant(record)">发放</a>
              <a-divider type="vertical" />
              <a @click="handleRecord(record)">记录</a>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该优惠券吗？"
                @confirm="handleDelete(record)"
              >
                <a class="text-danger">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="优惠券名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入优惠券名称"
          />
        </a-form-item>
        <a-form-item label="优惠券类型" name="type">
          <a-radio-group v-model:value="formData.type">
            <a-radio :value="1">满减券</a-radio>
            <a-radio :value="2">折扣券</a-radio>
            <a-radio :value="3">立减券</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="formData.type === 1">
          <a-form-item label="使用门槛" name="useCondition">
            <a-input-number
              v-model:value="formData.useCondition"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="请输入使用门槛金额"
            />
          </a-form-item>
          <a-form-item label="优惠金额" name="value">
            <a-input-number
              v-model:value="formData.value"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="请输入优惠金额"
            />
          </a-form-item>
        </template>
        <template v-else-if="formData.type === 2">
          <a-form-item label="折扣比例" name="value">
            <a-input-number
              v-model:value="formData.value"
              :min="0"
              :max="10"
              :precision="1"
              style="width: 100%"
              placeholder="请输入折扣比例"
            />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item label="优惠金额" name="value">
            <a-input-number
              v-model:value="formData.value"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="请输入优惠金额"
            />
          </a-form-item>
        </template>
        <a-form-item label="发放总量" name="total">
          <a-input-number
            v-model:value="formData.total"
            :min="1"
            style="width: 100%"
            placeholder="请输入发放总量"
          />
        </a-form-item>
        <a-form-item label="每人限领" name="perLimit">
          <a-input-number
            v-model:value="formData.perLimit"
            :min="1"
            style="width: 100%"
            placeholder="请输入每人限领数量"
          />
        </a-form-item>
        <a-form-item label="有效期类型" name="validType">
          <a-radio-group v-model:value="formData.validType">
            <a-radio :value="1">固定日期</a-radio>
            <a-radio :value="2">领取后生效</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="formData.validType === 1">
          <a-form-item label="有效期" name="validTime">
            <a-range-picker
              v-model:value="formData.validTime"
              :show-time="{ format: 'HH:mm:ss' }"
              format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item label="有效天数" name="validDays">
            <a-input-number
              v-model:value="formData.validDays"
              :min="1"
              style="width: 100%"
              placeholder="请输入有效天数"
            />
          </a-form-item>
        </template>
        <a-form-item label="使用说明" name="note">
          <a-textarea
            v-model:value="formData.note"
            :rows="4"
            placeholder="请输入使用说明"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 发放弹窗 -->
    <a-modal
      v-model:open="grantVisible"
      title="优惠券发放"
      @ok="handleGrantOk"
      @cancel="handleGrantCancel"
    >
      <a-form
        ref="grantFormRef"
        :model="grantForm"
        :rules="grantRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="发放方式" name="type">
          <a-radio-group v-model:value="grantForm.type">
            <a-radio :value="1">直接发放</a-radio>
            <a-radio :value="2">指定会员</a-radio>
            <a-radio :value="3">新人券</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="grantForm.type === 2">
          <a-form-item label="选择会员" name="memberIds">
            <a-select
              v-model:value="grantForm.memberIds"
              mode="multiple"
              placeholder="请选择会员"
              :options="memberOptions"
              :field-names="{
                label: 'nickname',
                value: 'id'
              }"
            />
          </a-form-item>
        </template>
        <a-form-item label="发放数量" name="quantity">
          <a-input-number
            v-model:value="grantForm.quantity"
            :min="1"
            :max="currentRecord?.total"
            style="width: 100%"
            placeholder="请输入发放数量"
          />
        </a-form-item>
        <a-form-item label="备注说明" name="note">
          <a-textarea
            v-model:value="grantForm.note"
            :rows="4"
            placeholder="请输入备注说明"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 记录弹窗 -->
    <a-modal
      v-model:open="recordVisible"
      title="发放记录"
      width="1000px"
      :footer="null"
    >
      <a-table
        :columns="recordColumns"
        :data-source="recordData"
        :loading="recordLoading"
        :pagination="recordPagination"
        @change="handleRecordTableChange"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.key === 'useStatus'">
            <a-tag :color="text === 1 ? 'success' : 'default'">
              {{ text === 1 ? '已使用' : '未使用' }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'useTime'">
            {{ text || '-' }}
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import {
  SearchOutlined,
  RedoOutlined,
  PlusOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'

interface CouponInfo {
  id: number
  name: string
  type: number
  value: number
  useCondition?: number
  total: number
  used: number
  perLimit: number
  validType: number
  validTime?: [Dayjs, Dayjs]
  validDays?: number
  status: number
  note?: string
  createTime: string
}

interface CouponRecord {
  id: number
  memberId: number
  memberNickname: string
  useStatus: number
  useTime?: string
  createTime: string
}

interface SearchForm {
  name?: string
  type?: number
  status?: number
  validTime?: [Dayjs, Dayjs]
  pageNum: number
  pageSize: number
}

interface GrantForm {
  type: number
  memberIds?: number[]
  quantity: number
  note: string
}

// 表格列定义
const columns = [
  {
    title: '优惠券名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '优惠券类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '优惠内容',
    dataIndex: 'value',
    key: 'value'
  },
  {
    title: '发放总量',
    dataIndex: 'total',
    key: 'total'
  },
  {
    title: '已使用',
    dataIndex: 'used',
    key: 'used'
  },
  {
    title: '每人限领',
    dataIndex: 'perLimit',
    key: 'perLimit'
  },
  {
    title: '使用状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 记录表格列定义
const recordColumns = [
  {
    title: '会员昵称',
    dataIndex: 'memberNickname',
    key: 'memberNickname'
  },
  {
    title: '使用状态',
    dataIndex: 'useStatus',
    key: 'useStatus'
  },
  {
    title: '使用时间',
    dataIndex: 'useTime',
    key: 'useTime'
  },
  {
    title: '领取时间',
    dataIndex: 'createTime',
    key: 'createTime'
  }
]

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  name: '',
  type: undefined,
  status: undefined,
  validTime: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<CouponInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增优惠券')
const formRef = ref()
const formData = reactive({
  id: undefined,
  name: '',
  type: 1,
  value: undefined,
  useCondition: undefined,
  total: undefined,
  perLimit: undefined,
  validType: 1,
  validTime: undefined,
  validDays: undefined,
  note: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入优惠券名称' }
  ],
  type: [
    { required: true, message: '请选择优惠券类型' }
  ],
  value: [
    { required: true, message: '请输入优惠内容' }
  ],
  useCondition: [
    { required: true, message: '请输入使用门槛' }
  ],
  total: [
    { required: true, message: '请输入发放总量' }
  ],
  perLimit: [
    { required: true, message: '请输入每人限领数量' }
  ],
  validType: [
    { required: true, message: '请选择有效期类型' }
  ],
  validTime: [
    { required: true, message: '请选择有效期' }
  ],
  validDays: [
    { required: true, message: '请输入有效天数' }
  ]
}

// 发放弹窗
const grantVisible = ref(false)
const grantFormRef = ref()
const currentRecord = ref<CouponInfo>()
const grantForm = reactive<GrantForm>({
  type: 1,
  memberIds: undefined,
  quantity: 1,
  note: ''
})

// 发放表单验证规则
const grantRules = {
  type: [
    { required: true, message: '请选择发放方式' }
  ],
  memberIds: [
    { required: true, message: '请选择会员' }
  ],
  quantity: [
    { required: true, message: '请输入发放数量' }
  ]
}

// 会员选项
const memberOptions = ref([
  {
    id: 1,
    nickname: '测试会员'
  }
])

// 记录弹窗
const recordVisible = ref(false)
const recordLoading = ref(false)
const recordData = ref<CouponRecord[]>([])
const recordPagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

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
      return '满减券'
    case 2:
      return '折扣券'
    case 3:
      return '立减券'
    default:
      return '未知'
  }
}

// 获取状态颜色
const getStatusColor = (status?: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'default'
    case 3:
      return 'error'
    default:
      return 'default'
  }
}

// 获取状态文本
const getStatusText = (status?: number) => {
  switch (status) {
    case 0:
      return '未开始'
    case 1:
      return '进行中'
    case 2:
      return '已结束'
    case 3:
      return '已失效'
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
  searchForm.name = ''
  searchForm.type = undefined
  searchForm.status = undefined
  searchForm.validTime = undefined
  handleSearch()
}

// 导出
const handleExport = () => {
  message.success('导出成功')
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增优惠券'
  formData.id = undefined
  formData.name = ''
  formData.type = 1
  formData.value = undefined
  formData.useCondition = undefined
  formData.total = undefined
  formData.perLimit = undefined
  formData.validType = 1
  formData.validTime = undefined
  formData.validDays = undefined
  formData.note = ''
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: CouponInfo) => {
  modalTitle.value = '编辑优惠券'
  Object.assign(formData, record)
  modalVisible.value = true
}

// 发放
const handleGrant = (record: CouponInfo) => {
  currentRecord.value = record
  grantForm.type = 1
  grantForm.memberIds = undefined
  grantForm.quantity = 1
  grantForm.note = ''
  grantVisible.value = true
}

// 发放确认
const handleGrantOk = () => {
  grantFormRef.value?.validate().then(async () => {
    try {
      // TODO: 调用发放API
      message.success('发放成功')
      grantVisible.value = false
      fetchData()
    } catch (error) {
      message.error('发放失败')
    }
  })
}

// 发放取消
const handleGrantCancel = () => {
  grantVisible.value = false
  grantFormRef.value?.resetFields()
}

// 记录
const handleRecord = (record: CouponInfo) => {
  currentRecord.value = record
  recordPagination.current = 1
  recordVisible.value = true
  fetchRecordData()
}

// 删除
const handleDelete = async (record: CouponInfo) => {
  try {
    // TODO: 调用删除API
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

// 弹窗确认
const handleModalOk = () => {
  formRef.value?.validate().then(async () => {
    try {
      // TODO: 调用保存API
      message.success('保存成功')
      modalVisible.value = false
      fetchData()
    } catch (error) {
      message.error('保存失败')
    }
  })
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

// 表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

// 记录表格变化
const handleRecordTableChange = (pag: TablePaginationConfig) => {
  recordPagination.current = pag.current
  recordPagination.pageSize = pag.pageSize
  fetchRecordData()
}

// 获取表格数据
const fetchData = async () => {
  loading.value = true
  try {
    // TODO: 调用查询API
    // 模拟数据
    tableData.value = [
      {
        id: 1,
        name: '新人专享券',
        type: 1,
        value: 10,
        useCondition: 100,
        total: 1000,
        used: 100,
        perLimit: 1,
        validType: 1,
        status: 1,
        createTime: '2024-01-01 10:00:00'
      }
    ]
    pagination.total = 1
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 获取记录数据
const fetchRecordData = async () => {
  recordLoading.value = true
  try {
    // TODO: 调用查询API
    // 模拟数据
    recordData.value = [
      {
        id: 1,
        memberId: 1,
        memberNickname: '测试会员',
        useStatus: 1,
        useTime: '2024-01-01 12:00:00',
        createTime: '2024-01-01 10:00:00'
      }
    ]
    recordPagination.total = 1
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    recordLoading.value = false
  }
}

// 初始化
fetchData()
</script>

<style lang="less" scoped>
.coupon {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    :deep(.ant-card-body) {
      padding-top: 0;
    }
  }

  .text-danger {
    color: #ff4d4f;
  }
}
</style> 