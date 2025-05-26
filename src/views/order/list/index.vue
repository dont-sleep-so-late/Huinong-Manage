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
        row-key="id"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(text)">
              {{ getStatusText(text) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'payType'">
            {{ text === PaymentMethod.ALIPAY ? '支付宝' : '微信支付' }}
          </template>
          
          <template v-else-if="column.key === 'amount'">
            ¥{{ text.toFixed(2) }}
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleDetail(asOrder(record))">详情</a>
              <template v-if="record.status === OrderStatus.PAID">
                <a-divider type="vertical" />
                <a @click="handleDelivery(asOrder(record))">发货</a>
              </template>
              <template v-if="record.status === OrderStatus.PENDING">
                <a-divider type="vertical" />
                <a-popconfirm
                  title="确定要取消该订单吗？"
                  @confirm="() => handleCancel(asOrder(record))"
                >
                  <a>取消</a>
                </a-popconfirm>
              </template>
              <template v-if="record.status === OrderStatus.SHIPPED">
                <a-divider type="vertical" />
                <a @click="handleLogistics(asOrder(record))">物流</a>
              </template>
              <a-divider type="vertical" />
              <a @click="handleRemark(asOrder(record))">备注</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 订单详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="订单详情"
      width="1400px"
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
          {{ currentOrder?.paymentMethod ? (currentOrder.paymentMethod === PaymentMethod.ALIPAY ? '支付宝' : '微信支付') : '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="订单金额">
          ¥{{ currentOrder?.totalAmount?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="运费">
          ¥{{ currentOrder?.freightAmount?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="应付金额">
          ¥{{ currentOrder?.payableAmount?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ currentOrder?.createdTime }}
        </a-descriptions-item>
        <a-descriptions-item label="支付时间">
          {{ currentOrder?.paymentTime || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="发货时间">
          {{ currentOrder?.shipTime || '-' }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>收货信息</h3>
      <a-descriptions bordered>
        <a-descriptions-item label="收货人">
          {{ currentOrder?.shippingName }}
        </a-descriptions-item>
        <a-descriptions-item label="联系电话">
          {{ currentOrder?.shippingPhone }}
        </a-descriptions-item>
        <a-descriptions-item label="收货地址">
          {{ currentOrder?.shippingAddress }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>商品信息</h3>
      <a-table
        :columns="productColumns"
        :data-source="currentOrder?.items"
        :pagination="false"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'productImage'">
            <img :src="text" alt="商品图片" style="width: 64px; height: 64px; object-fit: cover;" />
          </template>
          <template v-else-if="column.key === 'spec'">
            {{ record.specName }}: {{ record.specValue }}
          </template>
          <template v-else-if="column.key === 'price' || column.key === 'subtotal'">
            ¥{{ text.toFixed(2) }}
          </template>
        </template>
      </a-table>

      <template v-if="currentOrder?.logistics">
        <a-divider />
        <h3>物流信息</h3>
        <a-descriptions bordered>
          <a-descriptions-item label="物流公司">
            {{ currentOrder.logistics.logisticsCompany }}
          </a-descriptions-item>
          <a-descriptions-item label="物流单号">
            {{ currentOrder.logistics.logisticsNumber }}
          </a-descriptions-item>
          <a-descriptions-item label="当前位置">
            {{ currentOrder.logistics.currentAddress }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ currentOrder.logistics.updatedTime }}
          </a-descriptions-item>
        </a-descriptions>
      </template>
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
import { ref, reactive, h, VNode } from 'vue'
import { message, Space, Divider, Popconfirm } from 'ant-design-vue'
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import {
  getOrderList,
  getOrderDetail,
  updateOrderStatus,
  updateOrderRemark,
  deleteOrder,
  shipOrder,
  type Order,
  type OrderQuery,
  type OrderItem,
  type ShipParams,
  OrderStatus,
  PaymentMethod
} from '@/api/order'

interface ExtendedOrderQuery extends OrderQuery {
  createTime?: [Dayjs, Dayjs]
  payType?: number
}

// 物流信息接口
interface LogisticsInfo {
  content: string
  time: string
}

// 发货表单接口
interface DeliveryForm {
  company: string
  trackingNo: string
}

// 表格列定义
const columns = [
  {
    title: '订单编号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    width: 180
  },
  {
    title: '买家',
    dataIndex: 'userNickname',
    key: 'userNickname',
    width: 120
  },
  {
    title: '卖家昵称',
    dataIndex: 'sellerNickname',
    key: 'sellerNickname',
    width: 120
  },
  {
    title: '卖家姓名',
    dataIndex: 'sellerRealName',
    key: 'sellerRealName',
    width: 120
  },
  {
    title: '订单金额',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 100,
    align: 'right',
    customRender: ({ text }: { text: number }) => `¥${text.toFixed(2)}`
  },
  {
    title: '收货人',
    dataIndex: 'shippingName',
    key: 'shippingName',
    width: 100
  },
  {
    title: '联系电话',
    dataIndex: 'shippingPhone',
    key: 'shippingPhone',
    width: 120
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    customRender: ({ text }: { text: OrderStatus }) => h('span', {}, getStatusText(text))
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    key: 'createdTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 200,
    customRender: ({ record }: { record: Order }) => {
      const children: VNode[] = []

      // 详情按钮
      children.push(h('a', { onClick: () => handleDetail(record) }, '详情'))

      // 发货按钮
      if (record.status === OrderStatus.PAID) {
        children.push(h(Divider, { type: 'vertical' }))
        children.push(h('a', { onClick: () => handleDelivery(record) }, '发货'))
      }

      // 取消按钮
      if (record.status === OrderStatus.PENDING) {
        children.push(h(Divider, { type: 'vertical' }))
        children.push(
          h(Popconfirm, {
            title: '确定要取消该订单吗？',
            onConfirm: () => handleCancel(record)
          }, {
            default: () => h('a', {}, '取消')
          })
        )
      }

      // 物流按钮
      if (record.status === OrderStatus.SHIPPED) {
        children.push(h(Divider, { type: 'vertical' }))
        children.push(h('a', { onClick: () => handleLogistics(record) }, '物流'))
      }

      // 备注按钮
      children.push(h(Divider, { type: 'vertical' }))
      children.push(h('a', { onClick: () => handleRemark(record) }, '备注'))

      // 删除按钮
      children.push(h(Divider, { type: 'vertical' }))
      children.push(
        h(Popconfirm, {
          title: '确定要删除该订单吗？',
          description: '删除后不可恢复，请谨慎操作！',
          okText: '确定',
          cancelText: '取消',
          okType: 'danger',
          onConfirm: () => handleDelete(record)
        }, {
          default: () => h('a', { style: { color: '#ff4d4f' } }, '删除')
        })
      )

      return h(Space, {}, () => children)
    }
  }
] as TableColumnType<Order>[]

// 商品表格列定义
const productColumns = [
  {
    title: '商品图片',
    dataIndex: 'productImage',
    key: 'productImage'
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    key: 'productName'
  },
  {
    title: '规格',
    key: 'spec',
    customRender: ({ record }: { record: OrderItem }) => `${record.specName}: ${record.specValue}`
  },
  {
    title: '单价',
    dataIndex: 'price',
    key: 'price',
    customRender: ({ text }: { text: number }) => `¥${text.toFixed(2)}`
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity'
  },
  {
    title: '小计',
    dataIndex: 'subtotal',
    key: 'subtotal',
    customRender: ({ text }: { text: number }) => `¥${text.toFixed(2)}`
  }
]

// 搜索表单数据
const searchForm = reactive<ExtendedOrderQuery>({
  orderNo: '',
  status: undefined,
  payType: undefined,
  createTime: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<Order[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 订单详情
const detailVisible = ref(false)
const currentOrder = ref<Order>()

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
  orderId: 0,
  content: ''
})

// 获取状态颜色
const getStatusColor = (status?: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'warning'
    case OrderStatus.PAID:
      return 'processing'
    case OrderStatus.SHIPPED:
      return 'processing'
    case OrderStatus.COMPLETED:
      return 'success'
    case OrderStatus.CANCELLED:
      return 'default'
    default:
      return 'default'
  }
}

// 获取状态文本
const getStatusText = (status?: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return '待付款'
    case OrderStatus.PAID:
      return '待发货'
    case OrderStatus.SHIPPED:
      return '已发货'
    case OrderStatus.COMPLETED:
      return '已完成'
    case OrderStatus.CANCELLED:
      return '已取消'
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
const handleDetail = async (record: Order) => {
  try {
    const { data } = await getOrderDetail(record.id)
    currentOrder.value = data
    detailVisible.value = true
  } catch (error) {
    console.error('获取订单详情失败:', error)
    message.error('获取详情失败')
  }
}

// 发货
const handleDelivery = (record: Order) => {
  currentOrder.value = record
  deliveryForm.company = ''
  deliveryForm.trackingNo = ''
  deliveryVisible.value = true
}

// 发货确认
const handleDeliveryOk = () => {
  deliveryFormRef.value?.validate().then(async () => {
    try {
      await shipOrder(currentOrder.value!.id, {
        trackingNo: deliveryForm.trackingNo,
        logisticsCompany: deliveryForm.company
      })
      message.success('发货成功')
      deliveryVisible.value = false
      fetchData()
    } catch (error) {
      console.error('发货失败:', error)
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
const handleCancel = async (record: Order) => {
  try {
    await updateOrderStatus(record.id, OrderStatus.CANCELLED)
    message.success('取消成功')
    fetchData()
  } catch (error) {
    console.error('取消订单失败:', error)
    message.error('取消失败')
  }
}

// 查看物流
const handleLogistics = (record: Order) => {
  // TODO: 获取物流信息
  logisticsVisible.value = true
}

// 备注
const handleRemark = (record: Order) => {
  remarkForm.content = record.remark || ''
  remarkForm.orderId = record.id
  remarkVisible.value = true
}

// 备注确认
const handleRemarkOk = async () => {
  try {
    await updateOrderRemark(remarkForm.orderId, remarkForm.content)
    message.success('保存成功')
    remarkVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存备注失败:', error)
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
    const params: OrderQuery = {
      orderNo: searchForm.orderNo,
      status: searchForm.status as OrderStatus,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    }
    
    // 处理时间范围
    if (searchForm.createTime) {
      params.startTime = searchForm.createTime[0].format('YYYY-MM-DD HH:mm:ss')
      params.endTime = searchForm.createTime[1].format('YYYY-MM-DD HH:mm:ss')
    }
    
    const { data } = await getOrderList(params)
    tableData.value = data.records
    pagination.total = data.total
    pagination.current = data.current
    pagination.pageSize = data.size
  } catch (error) {
    console.error('获取订单列表失败:', error)
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 类型转换函数
const asOrder = (record: Record<string, any>): Order => record as Order

// 删除订单
const handleDelete = async (record: Order) => {
  try {
    await deleteOrder(record.id)
    message.success('删除成功')
    // 如果当前页只有一条数据，且不是第一页，则跳转到上一页
    if (tableData.value.length === 1 && pagination.current! > 1) {
      pagination.current = (pagination.current || 1) - 1
    }
    fetchData()
  } catch (error) {
    console.error('删除订单失败:', error)
    message.error('删除失败')
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
  }

  .timeline-time {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    margin-top: 4px;
  }
}
</style> 