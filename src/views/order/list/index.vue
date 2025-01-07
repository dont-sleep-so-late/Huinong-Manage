<template>
  <div class="order-list">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
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
        <a-form-item label="订单状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择订单状态"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="0">待付款</a-select-option>
            <a-select-option :value="1">待发货</a-select-option>
            <a-select-option :value="2">已发货</a-select-option>
            <a-select-option :value="3">已完成</a-select-option>
            <a-select-option :value="4">已取消</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="下单时间">
          <a-range-picker
            v-model:value="searchForm.orderTime"
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
        <!-- 订单状态 -->
        <template #status="{ text }">
          <a-tag :color="getStatusColor(text)">
            {{ getStatusText(text) }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleDetail(record)">详情</a>
            <template v-if="record.status === 1">
              <a-divider type="vertical" />
              <a @click="handleDelivery(record)">发货</a>
            </template>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 订单详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      title="订单详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions bordered>
        <a-descriptions-item label="订单编号">
          {{ detailData.orderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="下单时间">
          {{ detailData.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(detailData.status)">
            {{ getStatusText(detailData.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="用户名">
          {{ detailData.username }}
        </a-descriptions-item>
        <a-descriptions-item label="联系电话">
          {{ detailData.phone }}
        </a-descriptions-item>
        <a-descriptions-item label="收货地址">
          {{ detailData.address }}
        </a-descriptions-item>
        <a-descriptions-item label="商品总价">
          ¥{{ detailData.totalAmount?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="运费">
          ¥{{ detailData.freightAmount?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="实付金额">
          ¥{{ detailData.payAmount?.toFixed(2) }}
        </a-descriptions-item>
      </a-descriptions>

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

      <template v-if="detailData.status === 2">
        <a-divider />
        <a-descriptions bordered>
          <a-descriptions-item label="快递公司">
            {{ detailData.expressCompany }}
          </a-descriptions-item>
          <a-descriptions-item label="快递单号">
            {{ detailData.expressNo }}
          </a-descriptions-item>
          <a-descriptions-item label="发货时间">
            {{ detailData.deliveryTime }}
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-modal>

    <!-- 发货弹窗 -->
    <a-modal
      v-model:visible="deliveryVisible"
      title="订单发货"
      @ok="handleDeliveryOk"
      @cancel="handleDeliveryCancel"
    >
      <a-form
        ref="deliveryFormRef"
        :model="deliveryForm"
        :rules="deliveryRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="快递公司" name="expressCompany">
          <a-select
            v-model:value="deliveryForm.expressCompany"
            placeholder="请选择快递公司"
          >
            <a-select-option value="SF">顺丰快递</a-select-option>
            <a-select-option value="YTO">圆通快递</a-select-option>
            <a-select-option value="ZTO">中通快递</a-select-option>
            <a-select-option value="YD">韵达快递</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="快递单号" name="expressNo">
          <a-input
            v-model:value="deliveryForm.expressNo"
            placeholder="请输入快递单号"
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

interface OrderInfo {
  id: number
  orderNo: string
  username: string
  phone: string
  address: string
  totalAmount: number
  freightAmount: number
  payAmount: number
  status: number
  createTime: string
  deliveryTime?: string
  expressCompany?: string
  expressNo?: string
  products?: OrderProduct[]
}

interface OrderProduct {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  specification: string
}

interface SearchForm {
  orderNo?: string
  username?: string
  status?: number
  orderTime?: [Dayjs, Dayjs]
  pageNum: number
  pageSize: number
}

interface DeliveryForm {
  expressCompany?: string
  expressNo?: string
}

// 表格列定义
const columns = [
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
    title: '实付金额',
    dataIndex: 'payAmount',
    key: 'payAmount',
    customRender: ({ text }: { text: number }) => `¥${text.toFixed(2)}`
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' }
  },
  {
    title: '下单时间',
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
  orderNo: '',
  username: '',
  status: undefined,
  orderTime: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<OrderInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 详情弹窗
const detailVisible = ref(false)
const detailData = reactive<Partial<OrderInfo>>({})

// 发货弹窗
const deliveryVisible = ref(false)
const deliveryFormRef = ref()
const deliveryForm = reactive<DeliveryForm>({
  expressCompany: undefined,
  expressNo: ''
})

// 发货表单验证规则
const deliveryRules = {
  expressCompany: [
    { required: true, message: '请选择快递公司' }
  ],
  expressNo: [
    { required: true, message: '请输入快递单号' }
  ]
}

// 获取状态文本
const getStatusText = (status: number) => {
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
      return ''
    case 4:
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
  searchForm.orderNo = ''
  searchForm.username = ''
  searchForm.status = undefined
  searchForm.orderTime = undefined
  handleSearch()
}

// 导出
const handleExport = () => {
  message.success('导出成功')
}

// 查看详情
const handleDetail = (record: OrderInfo) => {
  Object.assign(detailData, record)
  detailVisible.value = true
}

// 发货
const handleDelivery = (record: OrderInfo) => {
  deliveryForm.expressCompany = undefined
  deliveryForm.expressNo = ''
  deliveryVisible.value = true
}

// 发货确认
const handleDeliveryOk = () => {
  deliveryFormRef.value?.validate().then(async () => {
    try {
      // TODO: 调用发货API
      message.success('发货成功')
      deliveryVisible.value = false
      fetchData()
    } catch (error) {
      message.error('发货失败')
    }
  })
}

// 发货取消
const handleDeliveryCancel = () => {
  deliveryVisible.value = false
  deliveryFormRef.value?.resetFields()
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
        orderNo: '202401010001',
        username: '张三',
        phone: '13800138000',
        address: '北京市朝阳区xxx街道xxx号',
        totalAmount: 199,
        freightAmount: 10,
        payAmount: 209,
        status: 1,
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
.order-list {
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