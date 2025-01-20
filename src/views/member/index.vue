<template>
  <div class="member">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="会员账号">
          <a-input
            v-model:value="searchForm.account"
            placeholder="请输入会员账号"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="手机号码">
          <a-input
            v-model:value="searchForm.phone"
            placeholder="请输入手机号码"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="会员等级">
          <a-select
            v-model:value="searchForm.level"
            placeholder="请选择会员等级"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="1">普通会员</a-select-option>
            <a-select-option :value="2">白银会员</a-select-option>
            <a-select-option :value="3">黄金会员</a-select-option>
            <a-select-option :value="4">钻石会员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="注册时间">
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
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="text" />
          </template>
          
          <template v-else-if="column.key === 'level'">
            <a-tag :color="getLevelColor(text)">
              {{ getLevelText(text) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-switch
              :checked="text === 1"
              :loading="record.statusLoading"
              @change="(checked) => handleStatusChange(checked, record)"
            />
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a @click="handlePoints(record)">积分</a>
              <a-divider type="vertical" />
              <a @click="handleOrders(record)">订单</a>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该会员吗？"
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
        <a-form-item label="头像" name="avatar">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="formData.avatar" :src="formData.avatar" alt="avatar" style="width: 100%" />
            <div v-else>
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="账号" name="account">
          <a-input
            v-model:value="formData.account"
            placeholder="请输入账号"
            :disabled="!!formData.id"
          />
        </a-form-item>
        <a-form-item
          label="密码"
          name="password"
          :rules="formData.id ? undefined : formRules.password"
        >
          <a-input-password
            v-model:value="formData.password"
            placeholder="请输入密码"
          />
        </a-form-item>
        <a-form-item label="昵称" name="nickname">
          <a-input
            v-model:value="formData.nickname"
            placeholder="请输入昵称"
          />
        </a-form-item>
        <a-form-item label="手机号码" name="phone">
          <a-input
            v-model:value="formData.phone"
            placeholder="请输入手机号码"
          />
        </a-form-item>
        <a-form-item label="会员等级" name="level">
          <a-select
            v-model:value="formData.level"
            placeholder="请选择会员等级"
          >
            <a-select-option :value="1">普通会员</a-select-option>
            <a-select-option :value="2">白银会员</a-select-option>
            <a-select-option :value="3">黄金会员</a-select-option>
            <a-select-option :value="4">钻石会员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 积分弹窗 -->
    <a-modal
      v-model:open="pointsVisible"
      title="积分管理"
      @ok="handlePointsOk"
      @cancel="handlePointsCancel"
    >
      <a-form
        ref="pointsFormRef"
        :model="pointsForm"
        :rules="pointsRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="当前积分">
          <span>{{ currentRecord?.points || 0 }}</span>
        </a-form-item>
        <a-form-item label="变更类型" name="type">
          <a-radio-group v-model:value="pointsForm.type">
            <a-radio :value="1">增加</a-radio>
            <a-radio :value="2">扣减</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="变更积分" name="points">
          <a-input-number
            v-model:value="pointsForm.points"
            :min="1"
            style="width: 100%"
            placeholder="请输入变更积分"
          />
        </a-form-item>
        <a-form-item label="变更原因" name="reason">
          <a-textarea
            v-model:value="pointsForm.reason"
            :rows="4"
            placeholder="请输入变更原因"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 订单弹窗 -->
    <a-modal
      v-model:open="ordersVisible"
      title="订单记录"
      width="1000px"
      :footer="null"
    >
      <a-table
        :columns="orderColumns"
        :data-source="orderData"
        :loading="orderLoading"
        :pagination="orderPagination"
        @change="handleOrderTableChange"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getOrderStatusColor(text)">
              {{ getOrderStatusText(text) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'amount'">
            ¥{{ text.toFixed(2) }}
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
import type { UploadChangeParam } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'

interface MemberInfo {
  id: number
  account: string
  nickname: string
  avatar: string
  phone: string
  level: number
  points: number
  status: number
  createTime: string
  statusLoading?: boolean
}

interface OrderInfo {
  id: number
  orderNo: string
  status: number
  amount: number
  createTime: string
}

interface SearchForm {
  account?: string
  phone?: string
  level?: number
  createTime?: [Dayjs, Dayjs]
  pageNum: number
  pageSize: number
}

interface PointsForm {
  type: number
  points: number
  reason: string
}

// 表格列定义
const columns = [
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar'
  },
  {
    title: '账号',
    dataIndex: 'account',
    key: 'account'
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname'
  },
  {
    title: '手机号码',
    dataIndex: 'phone',
    key: 'phone'
  },
  {
    title: '会员等级',
    dataIndex: 'level',
    key: 'level'
  },
  {
    title: '积分',
    dataIndex: 'points',
    key: 'points'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '注册时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 订单表格列定义
const orderColumns = [
  {
    title: '订单编号',
    dataIndex: 'orderNo',
    key: 'orderNo'
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '订单金额',
    dataIndex: 'amount',
    key: 'amount'
  },
  {
    title: '下单时间',
    dataIndex: 'createTime',
    key: 'createTime'
  }
]

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  account: '',
  phone: '',
  level: undefined,
  createTime: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<MemberInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增会员')
const formRef = ref()
const formData = reactive({
  id: undefined,
  account: '',
  password: '',
  nickname: '',
  avatar: '',
  phone: '',
  level: 1,
  status: 1
})

// 表单验证规则
const formRules = {
  account: [
    { required: true, message: '请输入账号' },
    { min: 4, max: 20, message: '账号长度必须在4-20个字符之间' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间' }
  ],
  nickname: [
    { required: true, message: '请输入昵称' }
  ],
  phone: [
    { required: true, message: '请输入手机号码' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确' }
  ],
  level: [
    { required: true, message: '请选择会员等级' }
  ]
}

// 图片上传相关
const fileList = ref([])
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传JPG/PNG格式的图片!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过2MB!')
  }
  return isJpgOrPng && isLt2M
}

const handleChange = (info: UploadChangeParam) => {
  if (info.file.status === 'uploading') {
    loading.value = true
    return
  }
  if (info.file.status === 'done') {
    // TODO: 处理上传成功后的逻辑
    formData.avatar = info.file.response.url
    loading.value = false
  }
}

// 积分弹窗
const pointsVisible = ref(false)
const pointsFormRef = ref()
const currentRecord = ref<MemberInfo>()
const pointsForm = reactive<PointsForm>({
  type: 1,
  points: 0,
  reason: ''
})

// 积分表单验证规则
const pointsRules = {
  points: [
    { required: true, message: '请输入变更积分' }
  ],
  reason: [
    { required: true, message: '请输入变更原因' }
  ]
}

// 订单弹窗
const ordersVisible = ref(false)
const orderLoading = ref(false)
const orderData = ref<OrderInfo[]>([])
const orderPagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 获取等级颜色
const getLevelColor = (level?: number) => {
  switch (level) {
    case 1:
      return 'blue'
    case 2:
      return 'cyan'
    case 3:
      return 'orange'
    case 4:
      return 'purple'
    default:
      return 'default'
  }
}

// 获取等级文本
const getLevelText = (level?: number) => {
  switch (level) {
    case 1:
      return '普通会员'
    case 2:
      return '白银会员'
    case 3:
      return '黄金会员'
    case 4:
      return '钻石会员'
    default:
      return '未知'
  }
}

// 获取订单状态颜色
const getOrderStatusColor = (status?: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'processing'
    case 2:
      return 'processing'
    case 3:
      return 'success'
    case 4:
      return 'default'
    case 5:
      return 'error'
    default:
      return 'default'
  }
}

// 获取订单状态文本
const getOrderStatusText = (status?: number) => {
  switch (status) {
    case 0:
      return '待付款'
    case 1:
      return '待发货'
    case 2:
      return '已发货'
    case 3:
      return '已完成'
    case 4:
      return '已取消'
    case 5:
      return '已退款'
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
  searchForm.account = ''
  searchForm.phone = ''
  searchForm.level = undefined
  searchForm.createTime = undefined
  handleSearch()
}

// 导出
const handleExport = () => {
  message.success('导出成功')
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增会员'
  formData.id = undefined
  formData.account = ''
  formData.password = ''
  formData.nickname = ''
  formData.avatar = ''
  formData.phone = ''
  formData.level = 1
  formData.status = 1
  fileList.value = []
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: MemberInfo) => {
  modalTitle.value = '编辑会员'
  Object.assign(formData, record)
  formData.password = ''
  fileList.value = record.avatar ? [{
    uid: '-1',
    name: 'avatar.png',
    status: 'done',
    url: record.avatar
  }] : []
  modalVisible.value = true
}

// 切换状态
const handleStatusChange = async (checked: boolean, record: MemberInfo) => {
  record.statusLoading = true
  try {
    // TODO: 调用切换状态API
    message.success('操作成功')
    record.status = checked ? 1 : 0
  } catch (error) {
    message.error('操作失败')
  } finally {
    record.statusLoading = false
  }
}

// 删除
const handleDelete = async (record: MemberInfo) => {
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

// 积分管理
const handlePoints = (record: MemberInfo) => {
  currentRecord.value = record
  pointsForm.type = 1
  pointsForm.points = 0
  pointsForm.reason = ''
  pointsVisible.value = true
}

// 积分确认
const handlePointsOk = () => {
  pointsFormRef.value?.validate().then(async () => {
    try {
      // TODO: 调用积分变更API
      message.success('操作成功')
      pointsVisible.value = false
      fetchData()
    } catch (error) {
      message.error('操作失败')
    }
  })
}

// 积分取消
const handlePointsCancel = () => {
  pointsVisible.value = false
  pointsFormRef.value?.resetFields()
}

// 订单记录
const handleOrders = (record: MemberInfo) => {
  currentRecord.value = record
  orderPagination.current = 1
  ordersVisible.value = true
  fetchOrderData()
}

// 表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

// 订单表格变化
const handleOrderTableChange = (pag: TablePaginationConfig) => {
  orderPagination.current = pag.current
  orderPagination.pageSize = pag.pageSize
  fetchOrderData()
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
        account: 'test001',
        nickname: '测试用户',
        avatar: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        phone: '13800138000',
        level: 1,
        points: 100,
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

// 获取订单数据
const fetchOrderData = async () => {
  orderLoading.value = true
  try {
    // TODO: 调用查询API
    // 模拟数据
    orderData.value = [
      {
        id: 1,
        orderNo: 'DD202401010001',
        status: 3,
        amount: 99.8,
        createTime: '2024-01-01 10:00:00'
      }
    ]
    orderPagination.total = 1
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    orderLoading.value = false
  }
}

// 初始化
fetchData()
</script>

<style lang="less" scoped>
.member {
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