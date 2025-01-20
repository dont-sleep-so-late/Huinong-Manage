<template>
  <div class="merchant">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="商家名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入商家名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input
            v-model:value="searchForm.phone"
            placeholder="请输入联系电话"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="商家类型">
          <a-select
            v-model:value="searchForm.type"
            placeholder="请选择商家类型"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="1">个人商家</a-select-option>
            <a-select-option :value="2">企业商家</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="审核状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择审核状态"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="0">待审核</a-select-option>
            <a-select-option :value="1">已通过</a-select-option>
            <a-select-option :value="2">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="入驻时间">
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
          <template v-if="column.key === 'logo'">
            <img :src="text" alt="商家logo" class="merchant-logo" />
          </template>
          
          <template v-if="column.key === 'type'">
            <a-tag :color="text === 1 ? 'blue' : 'purple'">
              {{ text === 1 ? '个人商家' : '企业商家' }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(text)">
              {{ getStatusText(text) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleDetail(record)">详情</a>
              <template v-if="record.status === 0">
                <a-divider type="vertical" />
                <a @click="handleAudit(record)">审核</a>
              </template>
              <template v-if="record.status === 1">
                <a-divider type="vertical" />
                <a @click="handleProducts(record)">商品</a>
                <a-divider type="vertical" />
                <a @click="handleOrders(record)">订单</a>
                <a-divider type="vertical" />
                <a @click="handleSettlement(record)">结算</a>
              </template>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该商家吗？"
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
      width="800px"
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
        <a-form-item label="商家Logo" name="logo">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="formData.logo" :src="formData.logo" alt="logo" style="width: 100%" />
            <div v-else>
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="商家类型" name="type">
          <a-radio-group v-model:value="formData.type">
            <a-radio :value="1">个人商家</a-radio>
            <a-radio :value="2">企业商家</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="商家名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入商家名称"
          />
        </a-form-item>
        <a-form-item label="联系人" name="contact">
          <a-input
            v-model:value="formData.contact"
            placeholder="请输入联系人"
          />
        </a-form-item>
        <a-form-item label="联系电话" name="phone">
          <a-input
            v-model:value="formData.phone"
            placeholder="请输入联系电话"
          />
        </a-form-item>
        <a-form-item label="经营类目" name="categories">
          <a-select
            v-model:value="formData.categories"
            mode="multiple"
            placeholder="请选择经营类目"
          >
            <a-select-option value="1">蔬菜水果</a-select-option>
            <a-select-option value="2">肉禽蛋品</a-select-option>
            <a-select-option value="3">水产海鲜</a-select-option>
            <a-select-option value="4">粮油调味</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="经营地址" name="address">
          <a-textarea
            v-model:value="formData.address"
            :rows="2"
            placeholder="请输入经营地址"
          />
        </a-form-item>
        <template v-if="formData.type === 2">
          <a-form-item label="营业执照" name="license">
            <a-upload
              v-model:file-list="licenseList"
              list-type="picture-card"
              :show-upload-list="false"
              :before-upload="beforeUpload"
              @change="handleLicenseChange"
            >
              <img v-if="formData.license" :src="formData.license" alt="license" style="width: 100%" />
              <div v-else>
                <plus-outlined />
                <div style="margin-top: 8px">上传</div>
              </div>
            </a-upload>
          </a-form-item>
          <a-form-item label="企业名称" name="companyName">
            <a-input
              v-model:value="formData.companyName"
              placeholder="请输入企业名称"
            />
          </a-form-item>
          <a-form-item label="统一社会信用代码" name="creditCode">
            <a-input
              v-model:value="formData.creditCode"
              placeholder="请输入统一社会信用代码"
            />
          </a-form-item>
        </template>
        <a-form-item label="备注说明" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            :rows="4"
            placeholder="请输入备注说明"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:open="auditVisible"
      title="商家审核"
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
            <a-radio :value="1">通过</a-radio>
            <a-radio :value="2">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核说明" name="note">
          <a-textarea
            v-model:value="auditForm.note"
            :rows="4"
            placeholder="请输入审核说明"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 结算弹窗 -->
    <a-modal
      v-model:open="settlementVisible"
      title="商家结算"
      @ok="handleSettlementOk"
      @cancel="handleSettlementCancel"
    >
      <a-form
        ref="settlementFormRef"
        :model="settlementForm"
        :rules="settlementRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="结算金额">
          <span>¥{{ currentRecord?.amount?.toFixed(2) }}</span>
        </a-form-item>
        <a-form-item label="结算方式" name="type">
          <a-radio-group v-model:value="settlementForm.type">
            <a-radio :value="1">银行转账</a-radio>
            <a-radio :value="2">支付宝</a-radio>
            <a-radio :value="3">微信</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="收款账号" name="account">
          <a-input
            v-model:value="settlementForm.account"
            placeholder="请输入收款账号"
          />
        </a-form-item>
        <a-form-item label="收款人" name="name">
          <a-input
            v-model:value="settlementForm.name"
            placeholder="请输入收款人"
          />
        </a-form-item>
        <a-form-item label="备注说明" name="note">
          <a-textarea
            v-model:value="settlementForm.note"
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
  PlusOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { UploadChangeParam } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'

interface MerchantInfo {
  id: number
  name: string
  logo: string
  type: number
  contact: string
  phone: string
  categories: string[]
  address: string
  license?: string
  companyName?: string
  creditCode?: string
  status: number
  amount?: number
  createTime: string
  remark?: string
}

interface SearchForm {
  name?: string
  phone?: string
  type?: number
  status?: number
  createTime?: [Dayjs, Dayjs]
  pageNum: number
  pageSize: number
}

interface AuditForm {
  result: number
  note: string
}

interface SettlementForm {
  type: number
  account: string
  name: string
  note: string
}

// 表格列定义
const columns = [
  {
    title: '商家Logo',
    dataIndex: 'logo',
    key: 'logo'
  },
  {
    title: '商家名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '商家类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '联系人',
    dataIndex: 'contact',
    key: 'contact'
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone'
  },
  {
    title: '审核状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '入驻时间',
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
  name: '',
  phone: '',
  type: undefined,
  status: undefined,
  createTime: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<MerchantInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增商家')
const formRef = ref()
const formData = reactive({
  id: undefined,
  name: '',
  logo: '',
  type: 1,
  contact: '',
  phone: '',
  categories: [],
  address: '',
  license: '',
  companyName: '',
  creditCode: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入商家名称' }
  ],
  type: [
    { required: true, message: '请选择商家类型' }
  ],
  contact: [
    { required: true, message: '请输入联系人' }
  ],
  phone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确' }
  ],
  categories: [
    { required: true, message: '请选择经营类目' }
  ],
  address: [
    { required: true, message: '请输入经营地址' }
  ],
  companyName: [
    { required: true, message: '请输入企业名称' }
  ],
  creditCode: [
    { required: true, message: '请输入统一社会信用代码' }
  ]
}

// 图片上传相关
const fileList = ref([])
const licenseList = ref([])
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
    formData.logo = info.file.response.url
    loading.value = false
  }
}

const handleLicenseChange = (info: UploadChangeParam) => {
  if (info.file.status === 'uploading') {
    loading.value = true
    return
  }
  if (info.file.status === 'done') {
    // TODO: 处理上传成功后的逻辑
    formData.license = info.file.response.url
    loading.value = false
  }
}

// 审核弹窗
const auditVisible = ref(false)
const auditFormRef = ref()
const currentRecord = ref<MerchantInfo>()
const auditForm = reactive<AuditForm>({
  result: 1,
  note: ''
})

// 审核表单验证规则
const auditRules = {
  note: [
    { required: true, message: '请输入审核说明' }
  ]
}

// 结算弹窗
const settlementVisible = ref(false)
const settlementFormRef = ref()
const settlementForm = reactive<SettlementForm>({
  type: 1,
  account: '',
  name: '',
  note: ''
})

// 结算表单验证规则
const settlementRules = {
  type: [
    { required: true, message: '请选择结算方式' }
  ],
  account: [
    { required: true, message: '请输入收款账号' }
  ],
  name: [
    { required: true, message: '请输入收款人' }
  ]
}

// 获取状态颜色
const getStatusColor = (status?: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'error'
    default:
      return 'default'
  }
}

// 获取状态文本
const getStatusText = (status?: number) => {
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '已通过'
    case 2:
      return '已拒绝'
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
  searchForm.phone = ''
  searchForm.type = undefined
  searchForm.status = undefined
  searchForm.createTime = undefined
  handleSearch()
}

// 导出
const handleExport = () => {
  message.success('导出成功')
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增商家'
  formData.id = undefined
  formData.name = ''
  formData.logo = ''
  formData.type = 1
  formData.contact = ''
  formData.phone = ''
  formData.categories = []
  formData.address = ''
  formData.license = ''
  formData.companyName = ''
  formData.creditCode = ''
  formData.remark = ''
  fileList.value = []
  licenseList.value = []
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: MerchantInfo) => {
  modalTitle.value = '编辑商家'
  Object.assign(formData, record)
  fileList.value = record.logo ? [{
    uid: '-1',
    name: 'logo.png',
    status: 'done',
    url: record.logo
  }] : []
  licenseList.value = record.license ? [{
    uid: '-1',
    name: 'license.png',
    status: 'done',
    url: record.license
  }] : []
  modalVisible.value = true
}

// 查看详情
const handleDetail = (record: MerchantInfo) => {
  // TODO: 查看详情
}

// 审核
const handleAudit = (record: MerchantInfo) => {
  currentRecord.value = record
  auditForm.result = 1
  auditForm.note = ''
  auditVisible.value = true
}

// 审核确认
const handleAuditOk = () => {
  auditFormRef.value?.validate().then(async () => {
    try {
      // TODO: 调用审核API
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

// 商品管理
const handleProducts = (record: MerchantInfo) => {
  // TODO: 跳转商品管理页面
}

// 订单管理
const handleOrders = (record: MerchantInfo) => {
  // TODO: 跳转订单管理页面
}

// 结算管理
const handleSettlement = (record: MerchantInfo) => {
  currentRecord.value = record
  settlementForm.type = 1
  settlementForm.account = ''
  settlementForm.name = ''
  settlementForm.note = ''
  settlementVisible.value = true
}

// 结算确认
const handleSettlementOk = () => {
  settlementFormRef.value?.validate().then(async () => {
    try {
      // TODO: 调用结算API
      message.success('结算成功')
      settlementVisible.value = false
      fetchData()
    } catch (error) {
      message.error('结算失败')
    }
  })
}

// 结算取消
const handleSettlementCancel = () => {
  settlementVisible.value = false
  settlementFormRef.value?.resetFields()
}

// 删除
const handleDelete = async (record: MerchantInfo) => {
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

// 获取表格数据
const fetchData = async () => {
  loading.value = true
  try {
    // TODO: 调用查询API
    // 模拟数据
    tableData.value = [
      {
        id: 1,
        name: '测试商家',
        logo: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        type: 1,
        contact: '张三',
        phone: '13800138000',
        categories: ['1', '2'],
        address: '广东省广州市天河区某某路1号',
        status: 1,
        amount: 9999.99,
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

// 初始化
fetchData()
</script>

<style lang="less" scoped>
.merchant {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    :deep(.ant-card-body) {
      padding-top: 0;
    }
  }

  .merchant-logo {
    width: 64px;
    height: 64px;
    object-fit: cover;
  }

  .text-danger {
    color: #ff4d4f;
  }
}
</style> 