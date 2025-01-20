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
            <a-select-option :value="5">已退款</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="支付方式">
          <a-select
            v-model:value="searchForm.payType"
            placeholder="请选择支付方式"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="1">微信支付</a-select-option>
            <a-select-option :value="2">支付宝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="下单时间">
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
          
          <template v-else-if="column.key === 'payType'">
            {{ text === 1 ? '微信支付' : '支付宝' }}
          </template>
          
          <template v-else-if="column.key === 'amount'">
            ¥{{ text.toFixed(2) }}
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleDetail(record)">详情</a>
              <template v-if="record.status === 1">
                <a-divider type="vertical" />
                <a @click="handleDelivery(record)">发货</a>
              </template>
              <template v-if="record.status === 0">
                <a-divider type="vertical" />
                <a-popconfirm
                  title="确定要取消该订单吗？"
                  @confirm="handleCancel(record)"
                >
                  <a>取消</a>
                </a-popconfirm>
              </template>
              <template v-if="record.status === 2">
                <a-divider type="vertical" />
                <a @click="handleLogistics(record)">物流</a>
              </template>
              <a-divider type="vertical" />
              <a @click="handleRemark(record)">备注</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 订单详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="订单详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions bordered>
        <a-descriptions-item label="订单编号">
          {{ currentOrder?.orderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(currentOrder?.status)">
            {{ getStatusText(currentOrder?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="支付方式">
          {{ currentOrder?.payType === 1 ? '微信支付' : '支付宝' }}
        </a-descriptions-item>
        <a-descriptions-item label="订单金额">
          ¥{{ currentOrder?.amount?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="下单时间">
          {{ currentOrder?.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="支付时间">
          {{ currentOrder?.payTime }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>收货信息</h3>
      <a-descriptions bordered>
        <a-descriptions-item label="收货人">
          {{ currentOrder?.receiver }}
        </a-descriptions-item>
        <a-descriptions-item label="联系电话">
          {{ currentOrder?.phone }}
        </a-descriptions-item>
        <a-descriptions-item label="收货地址">
          {{ currentOrder?.address }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>商品信息</h3>
      <a-table
        :columns="productColumns"
        :data-source="currentOrder?.products"
        :pagination="false"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.key === 'image'">
            <img :src="text" alt="商品图片" class="product-image" />
          </template>
          
          <template v-else-if="column.key === 'price' || column.key === 'amount'">
            ¥{{ text.toFixed(2) }}
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 发货弹窗 -->
    <a-modal
      v-model:open="deliveryVisible"
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
        <a-form-item label="物流公司" name="company">
          <a-select
            v-model:value="deliveryForm.company"
            placeholder="请选择物流公司"
          >
            <a-select-option value="SF">顺丰快递</a-select-option>
            <a-select-option value="YTO">圆通快递</a-select-option>
            <a-select-option value="ZTO">中通快递</a-select-option>
            <a-select-option value="STO">申通快递</a-select-option>
            <a-select-option value="YUNDA">韵达快递</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="物流单号" name="trackingNo">
          <a-input
            v-model:value="deliveryForm.trackingNo"
            placeholder="请输入物流单号"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 物流弹窗 -->
    <a-modal
      v-model:open="logisticsVisible"
      title="物流信息"
      :footer="null"
    >
      <a-timeline>
        <a-timeline-item
          v-for="(item, index) in logisticsList"
          :key="index"
          :color="index === 0 ? 'green' : 'gray'"
        >
          <p>{{ item.content }}</p>
          <p class="timeline-time">{{ item.time }}</p>
        </a-timeline-item>
      </a-timeline>
    </a-modal>

    <!-- 备注弹窗 -->
    <a-modal
      v-model:open="remarkVisible"
      title="订单备注"
      @ok="handleRemarkOk"
      @cancel="handleRemarkCancel"
    >
      <a-form
        ref="remarkFormRef"
        :model="remarkForm"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="备注">
          <a-textarea
            v-model:value="remarkForm.content"
            :rows="4"
            placeholder="请输入备注内容"
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
  status: number
  payType: number
  amount: number
  createTime: string
  payTime: string
  receiver: string
  phone: string
  address: string
  products: OrderProduct[]
  remark?: string
}

interface OrderProduct {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  amount: number
  specs: string
}

interface SearchForm {
  orderNo?: string
  status?: number
  payType?: number
  createTime?: [Dayjs, Dayjs]
  pageNum: number
  pageSize: number
}

interface DeliveryForm {
  company: string
  trackingNo: string
}

interface LogisticsInfo {
  content: string
  time: string
}

// 表格列定义
const columns = [
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
    title: '支付方式',
    dataIndex: 'payType',
    key: 'payType'
  },
  {
    title: '订单金额',
    dataIndex: 'amount',
    key: 'amount'
  },
  {
    title: '收货人',
    dataIndex: 'receiver',
    key: 'receiver'
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone'
  },
  {
    title: '下单时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 商品表格列定义
const productColumns = [
  {
    title: '商品图片',
    dataIndex: 'image',
    key: 'image'
  },
  {
    title: '商品名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '规格',
    dataIndex: 'specs',
    key: 'specs'
  },
  {
    title: '单价',
    dataIndex: 'price',
    key: 'price'
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity'
  },
  {
    title: '小计',
    dataIndex: 'amount',
    key: 'amount'
  }
]

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  orderNo: '',
  status: undefined,
  payType: undefined,
  createTime: undefined,
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

// 订单详情
const detailVisible = ref(false)
const currentOrder = ref<OrderInfo>()

// 发货弹窗
const deliveryVisible = ref(false)
const deliveryFormRef = ref()
const deliveryForm = reactive<DeliveryForm>({
  company: '',
  trackingNo: ''
})

// 发货表单验证规则
const deliveryRules = {
  company: [
    { required: true, message: '请选择物流公司' }
  ],
  trackingNo: [
    { required: true, message: '请输入物流单号' }
  ]
}

// 物流弹窗
const logisticsVisible = ref(false)
const logisticsList = ref<LogisticsInfo[]>([
  {
    content: '已签收，签收人：张三',
    time: '2024-01-03 10:00:00'
  },
  {
    content: '快件已到达【北京市朝阳区某某营业点】',
    time: '2024-01-02 14:30:00'
  },
  {
    content: '快件已从【广州转运中心】发出',
    time: '2024-01-01 16:20:00'
  },
  {
    content: '快件已揽收',
    time: '2024-01-01 10:00:00'
  }
])

// 备注弹窗
const remarkVisible = ref(false)
const remarkFormRef = ref()
const remarkForm = reactive({
  content: ''
})

// 获取状态颜色
const getStatusColor = (status?: number) => {
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

// 获取状态文本
const getStatusText = (status?: number) => {
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
  searchForm.orderNo = ''
  searchForm.status = undefined
  searchForm.payType = undefined
  searchForm.createTime = undefined
  handleSearch()
}

// 导出
const handleExport = () => {
  message.success('导出成功')
}

// 查看详情
const handleDetail = (record: OrderInfo) => {
  currentOrder.value = record
  detailVisible.value = true
}

// 发货
const handleDelivery = (record: OrderInfo) => {
  deliveryForm.company = ''
  deliveryForm.trackingNo = ''
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

// 取消订单
const handleCancel = async (record: OrderInfo) => {
  try {
    // TODO: 调用取消订单API
    message.success('取消成功')
    fetchData()
  } catch (error) {
    message.error('取消失败')
  }
}

// 查看物流
const handleLogistics = (record: OrderInfo) => {
  // TODO: 获取物流信息
  logisticsVisible.value = true
}

// 备注
const handleRemark = (record: OrderInfo) => {
  remarkForm.content = record.remark || ''
  remarkVisible.value = true
}

// 备注确认
const handleRemarkOk = async () => {
  try {
    // TODO: 调用保存备注API
    message.success('保存成功')
    remarkVisible.value = false
    fetchData()
  } catch (error) {
    message.error('保存失败')
  }
}

// 备注取消
const handleRemarkCancel = () => {
  remarkVisible.value = false
  remarkForm.content = ''
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
        orderNo: 'DD202401010001',
        status: 1,
        payType: 1,
        amount: 99.8,
        createTime: '2024-01-01 10:00:00',
        payTime: '2024-01-01 10:01:00',
        receiver: '张三',
        phone: '13800138000',
        address: '广东省广州市天河区某某路1号',
        products: [
          {
            id: 1,
            name: '新鲜胡萝卜',
            image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            price: 2.5,
            quantity: 2,
            amount: 5,
            specs: '500g/盒装'
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

  .product-image {
    width: 64px;
    height: 64px;
    object-fit: cover;
  }

  .timeline-time {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    margin-top: 4px;
  }
}
</style> 