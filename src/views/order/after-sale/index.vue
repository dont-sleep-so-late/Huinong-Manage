<template>
  <div class="after-sale-list">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="售后编号">
          <a-input
            v-model:value="searchForm.afterSaleNo"
            placeholder="请输入售后编号"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="订单编号">
          <a-input
            v-model:value="searchForm.orderNo"
            placeholder="请输入订单编号"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input
            v-model:value="searchForm.username"
            placeholder="请输入用户名"
            allow-clear
          />
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
        <a-form-item label="售后状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择售后状态"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="0">待处理</a-select-option>
            <a-select-option :value="1">处理中</a-select-option>
            <a-select-option :value="2">已完成</a-select-option>
            <a-select-option :value="3">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="申请时间">
          <a-range-picker
            v-model:value="searchForm.applyTime"
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
        <!-- 售后类型 -->
        <template #type="{ text }">
          <a-tag :color="getTypeColor(text)">
            {{ getTypeText(text) }}
          </a-tag>
        </template>

        <!-- 售后状态 -->
        <template #status="{ text }">
          <a-tag :color="getStatusColor(text)">
            {{ getStatusText(text) }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleDetail(record)">详情</a>
            <template v-if="record.status === 0">
              <a-divider type="vertical" />
              <a @click="handleProcess(record)">处理</a>
            </template>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 售后详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      title="售后详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions bordered>
        <a-descriptions-item label="售后编号">
          {{ detailData.afterSaleNo }}
        </a-descriptions-item>
        <a-descriptions-item label="订单编号">
          {{ detailData.orderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="申请时间">
          {{ detailData.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="用户名">
          {{ detailData.username }}
        </a-descriptions-item>
        <a-descriptions-item label="联系电话">
          {{ detailData.phone }}
        </a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag :color="getTypeColor(detailData.type)">
            {{ getTypeText(detailData.type) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="售后状态">
          <a-tag :color="getStatusColor(detailData.status)">
            {{ getStatusText(detailData.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="退款金额" v-if="detailData.type !== 3">
          ¥{{ detailData.refundAmount?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="售后原因" :span="3">
          {{ detailData.reason }}
        </a-descriptions-item>
        <a-descriptions-item label="问题描述" :span="3">
          {{ detailData.description }}
        </a-descriptions-item>
      </a-descriptions>

      <template v-if="detailData.images?.length">
        <a-divider />
        <div class="image-list">
          <a-image
            v-for="(image, index) in detailData.images"
            :key="index"
            :width="100"
            :src="image"
            :preview="{
              src: image
            }"
          />
        </div>
      </template>

      <a-divider />

      <a-table
        :columns="productColumns"
        :data-source="detailData.products"
        :pagination="false"
      >
        <!-- 商品图片 -->
        <template #image="{ text }">
          <a-image
            :width="50"
            :src="text"
            :preview="{
              src: text
            }"
          />
        </template>

        <!-- 商品价格 -->
        <template #price="{ text }">
          ¥{{ text.toFixed(2) }}
        </template>
      </a-table>

      <template v-if="detailData.status !== 0">
        <a-divider />
        <a-descriptions bordered>
          <a-descriptions-item label="处理时间">
            {{ detailData.processTime }}
          </a-descriptions-item>
          <a-descriptions-item label="处理人">
            {{ detailData.processor }}
          </a-descriptions-item>
          <a-descriptions-item label="处理结果">
            {{ detailData.processResult }}
          </a-descriptions-item>
          <a-descriptions-item label="处理备注" :span="3">
            {{ detailData.processRemark }}
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-modal>

    <!-- 处理弹窗 -->
    <a-modal
      v-model:visible="processVisible"
      title="售后处理"
      @ok="handleProcessOk"
      @cancel="handleProcessCancel"
    >
      <a-form
        ref="processFormRef"
        :model="processForm"
        :rules="processRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="处理结果" name="result">
          <a-radio-group v-model:value="processForm.result">
            <a-radio :value="1">同意</a-radio>
            <a-radio :value="0">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="处理备注" name="remark">
          <a-textarea
            v-model:value="processForm.remark"
            :rows="4"
            placeholder="请输入处理备注"
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

interface AfterSaleInfo {
  id: number
  afterSaleNo: string
  orderNo: string
  username: string
  phone: string
  type: number
  status: number
  reason: string
  description: string
  refundAmount?: number
  images?: string[]
  createTime: string
  processTime?: string
  processor?: string
  processResult?: string
  processRemark?: string
  products?: AfterSaleProduct[]
}

interface AfterSaleProduct {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  specification: string
}

interface SearchForm {
  afterSaleNo?: string
  orderNo?: string
  username?: string
  type?: number
  status?: number
  applyTime?: [Dayjs, Dayjs]
  pageNum: number
  pageSize: number
}

interface ProcessForm {
  result: number
  remark: string
}

// 表格列定义
const columns = [
  {
    title: '售后编号',
    dataIndex: 'afterSaleNo',
    key: 'afterSaleNo'
  },
  {
    title: '订单编号',
    dataIndex: 'orderNo',
    key: 'orderNo'
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '售后类型',
    dataIndex: 'type',
    key: 'type',
    slots: { customRender: 'type' }
  },
  {
    title: '售后状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' }
  },
  {
    title: '申请时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' }
  }
]

// 商品列定义
const productColumns = [
  {
    title: '商品图片',
    dataIndex: 'image',
    key: 'image',
    slots: { customRender: 'image' }
  },
  {
    title: '商品名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '规格',
    dataIndex: 'specification',
    key: 'specification'
  },
  {
    title: '单价',
    dataIndex: 'price',
    key: 'price',
    slots: { customRender: 'price' }
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity'
  }
]

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  afterSaleNo: '',
  orderNo: '',
  username: '',
  type: undefined,
  status: undefined,
  applyTime: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<AfterSaleInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 详情弹窗
const detailVisible = ref(false)
const detailData = reactive<Partial<AfterSaleInfo>>({})

// 处理弹窗
const processVisible = ref(false)
const processFormRef = ref()
const processForm = reactive<ProcessForm>({
  result: 1,
  remark: ''
})

// 处理表单验证规则
const processRules = {
  result: [
    { required: true, message: '请选择处理结果' }
  ],
  remark: [
    { required: true, message: '请输入处理备注' }
  ]
}

// 获取类型文本
const getTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '退款'
    case 2:
      return '退货退款'
    case 3:
      return '换货'
    default:
      return '未知类型'
  }
}

// 获取类型颜色
const getTypeColor = (type: number) => {
  switch (type) {
    case 1:
      return 'blue'
    case 2:
      return 'purple'
    case 3:
      return 'cyan'
    default:
      return ''
  }
}

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '待处理'
    case 1:
      return '处理中'
    case 2:
      return '已完成'
    case 3:
      return '已拒绝'
    default:
      return '未知状态'
  }
}

// 获取状态颜色
const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'processing'
    case 2:
      return 'success'
    case 3:
      return 'error'
    default:
      return ''
  }
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.afterSaleNo = ''
  searchForm.orderNo = ''
  searchForm.username = ''
  searchForm.type = undefined
  searchForm.status = undefined
  searchForm.applyTime = undefined
  handleSearch()
}

// 导出
const handleExport = () => {
  message.success('导出成功')
}

// 查看详情
const handleDetail = (record: AfterSaleInfo) => {
  Object.assign(detailData, record)
  detailVisible.value = true
}

// 处理
const handleProcess = (record: AfterSaleInfo) => {
  processForm.result = 1
  processForm.remark = ''
  processVisible.value = true
}

// 处理确认
const handleProcessOk = () => {
  processFormRef.value?.validate().then(async () => {
    try {
      // TODO: 调用处理API
      message.success('处理成功')
      processVisible.value = false
      fetchData()
    } catch (error) {
      message.error('处理失败')
    }
  })
}

// 处理取消
const handleProcessCancel = () => {
  processVisible.value = false
  processFormRef.value?.resetFields()
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
        afterSaleNo: '202401010001',
        orderNo: '202401010001',
        username: '张三',
        phone: '13800138000',
        type: 2,
        status: 0,
        reason: '商品质量问题',
        description: '收到的商品有破损',
        refundAmount: 209,
        images: [
          'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        ],
        createTime: '2024-01-01 00:00:00',
        products: [
          {
            id: 1,
            name: '有机蔬菜礼盒',
            image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            price: 199,
            quantity: 1,
            specification: '默认'
          }
        ]
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
.after-sale-list {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    :deep(.ant-card-body) {
      padding-top: 0;
    }
  }

  .image-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}
</style> 