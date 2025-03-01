<template>
  <div class="dashboard" v-if="false">
    <!-- 统计卡片 -->
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日订单"
            :value="statistics.todayOrder"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <shopping-outlined />
            </template>
            <template #suffix>
              <span class="stat-text">单</span>
            </template>
          </a-statistic>
          <div class="stat-footer">
            <span>总订单：{{ statistics.totalOrder }}单</span>
            <a-tag color="success">
              <rise-outlined />
              {{ statistics.orderGrowth }}%
            </a-tag>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日销售额"
            :value="statistics.todaySales"
            :precision="2"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <money-collect-outlined />
            </template>
            <template #suffix>
              <span class="stat-text">元</span>
            </template>
          </a-statistic>
          <div class="stat-footer">
            <span>总销售额：{{ statistics.totalSales }}元</span>
            <a-tag color="error">
              <fall-outlined />
              {{ statistics.salesGrowth }}%
            </a-tag>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日新增用户"
            :value="statistics.todayUser"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <user-add-outlined />
            </template>
            <template #suffix>
              <span class="stat-text">人</span>
            </template>
          </a-statistic>
          <div class="stat-footer">
            <span>总用户：{{ statistics.totalUser }}人</span>
            <a-tag color="processing">
              <rise-outlined />
              {{ statistics.userGrowth }}%
            </a-tag>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="待处理售后"
            :value="statistics.pendingAfterSale"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <alert-outlined />
            </template>
            <template #suffix>
              <span class="stat-text">单</span>
            </template>
          </a-statistic>
          <div class="stat-footer">
            <span>总售后：{{ statistics.totalAfterSale }}单</span>
            <a-tag color="warning">
              <fall-outlined />
              {{ statistics.afterSaleGrowth }}%
            </a-tag>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card title="销售趋势">
          <div ref="salesChart" style="height: 300px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="商品分类占比">
          <div ref="categoryChart" style="height: 300px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 表格 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card title="最新订单">
          <a-table
            :columns="orderColumns"
            :data-source="latestOrders"
            :pagination="false"
          >
            <!-- 订单状态 -->
            <template #status="{ text }">
              <a-tag :color="getOrderStatusColor(text)">
                {{ getOrderStatusText(text) }}
              </a-tag>
            </template>

            <!-- 操作 -->
            <template #action="{ record }">
              <a @click="handleOrderDetail(record)">查看</a>
            </template>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="热销商品">
          <a-table
            :columns="productColumns"
            :data-source="hotProducts"
            :pagination="false"
          >
            <!-- 商品图片 -->
            <template #image="{ text }">
              <a-image
                :width="40"
                :src="text"
                :preview="{
                  src: text
                }"
              />
            </template>

            <!-- 操作 -->
            <template #action="{ record }">
              <a @click="handleProductDetail(record)">查看</a>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import {
  ShoppingOutlined,
  MoneyCollectOutlined,
  UserAddOutlined,
  AlertOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'

interface Statistics {
  todayOrder: number
  totalOrder: number
  orderGrowth: number
  todaySales: number
  totalSales: number
  salesGrowth: number
  todayUser: number
  totalUser: number
  userGrowth: number
  pendingAfterSale: number
  totalAfterSale: number
  afterSaleGrowth: number
}

interface OrderInfo {
  id: number
  orderNo: string
  username: string
  amount: number
  status: number
  createTime: string
}

interface ProductInfo {
  id: number
  name: string
  image: string
  price: number
  sales: number
}

// 统计数据
const statistics = reactive<Statistics>({
  todayOrder: 0,
  totalOrder: 0,
  orderGrowth: 0,
  todaySales: 0,
  totalSales: 0,
  salesGrowth: 0,
  todayUser: 0,
  totalUser: 0,
  userGrowth: 0,
  pendingAfterSale: 0,
  totalAfterSale: 0,
  afterSaleGrowth: 0
})

// 订单表格列定义
const orderColumns = [
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
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    customRender: ({ text }: { text: number }) => `¥${text.toFixed(2)}`
  },
  {
    title: '状态',
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

// 商品表格列定义
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
    title: '价格',
    dataIndex: 'price',
    key: 'price',
    customRender: ({ text }: { text: number }) => `¥${text.toFixed(2)}`
  },
  {
    title: '销量',
    dataIndex: 'sales',
    key: 'sales'
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' }
  }
]

// 最新订单数据
const latestOrders = ref<OrderInfo[]>([])

// 热销商品数据
const hotProducts = ref<ProductInfo[]>([])

// 图表实例
const salesChart = ref<HTMLElement>()
const categoryChart = ref<HTMLElement>()
let salesChartInstance: echarts.ECharts
let categoryChartInstance: echarts.ECharts

// 获取订单状态文本
const getOrderStatusText = (status: number) => {
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

// 获取订单状态颜色
const getOrderStatusColor = (status: number) => {
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

// 查看订单详情
const handleOrderDetail = (record: OrderInfo) => {
  message.info('查看订单详情：' + record.orderNo)
}

// 查看商品详情
const handleProductDetail = (record: ProductInfo) => {
  message.info('查看商品详情：' + record.name)
}

// 初始化销售趋势图表
const initSalesChart = () => {
  if (!salesChart.value) return
  salesChartInstance = echarts.init(salesChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['订单数', '销售额']
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数',
        position: 'left'
      },
      {
        type: 'value',
        name: '销售额',
        position: 'right',
        axisLabel: {
          formatter: '{value} 元'
        }
      }
    ],
    series: [
      {
        name: '订单数',
        type: 'line',
        data: [150, 230, 224, 218, 135, 147, 260]
      },
      {
        name: '销售额',
        type: 'line',
        yAxisIndex: 1,
        data: [15000, 23000, 22400, 21800, 13500, 14700, 26000]
      }
    ]
  }
  salesChartInstance.setOption(option)
}

// 初始化商品分类占比图表
const initCategoryChart = () => {
  if (!categoryChart.value) return
  categoryChartInstance = echarts.init(categoryChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '蔬菜水果' },
          { value: 735, name: '肉禽蛋品' },
          { value: 580, name: '水产海鲜' },
          { value: 484, name: '粮油调味' },
          { value: 300, name: '休闲食品' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  categoryChartInstance.setOption(option)
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    // TODO: 调用统计API
    // 模拟数据
    Object.assign(statistics, {
      todayOrder: 128,
      totalOrder: 1580,
      orderGrowth: 12.5,
      todaySales: 12800,
      totalSales: 158000,
      salesGrowth: -5.2,
      todayUser: 25,
      totalUser: 1200,
      userGrowth: 8.3,
      pendingAfterSale: 8,
      totalAfterSale: 120,
      afterSaleGrowth: -2.1
    })
  } catch (error) {
    message.error('获取统计数据失败')
  }
}

// 获取最新订单
const fetchLatestOrders = async () => {
  try {
    // TODO: 调用查询API
    // 模拟数据
    latestOrders.value = [
      {
        id: 1,
        orderNo: '202401010001',
        username: '张三',
        amount: 209,
        status: 1,
        createTime: '2024-01-01 00:00:00'
      }
    ]
  } catch (error) {
    message.error('获取最新订单失败')
  }
}

// 获取热销商品
const fetchHotProducts = async () => {
  try {
    // TODO: 调用查询API
    // 模拟数据
    hotProducts.value = [
      {
        id: 1,
        name: '有机蔬菜礼盒',
        image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        price: 199,
        sales: 1580
      }
    ]
  } catch (error) {
    message.error('获取热销商品失败')
  }
}

// 初始化
onMounted(() => {
  fetchStatistics()
  fetchLatestOrders()
  fetchHotProducts()
  initSalesChart()
  initCategoryChart()

  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    salesChartInstance?.resize()
    categoryChartInstance?.resize()
  })
})
</script>

<style lang="less" scoped>
.dashboard {
  .stat-card {
    :deep(.ant-statistic-title) {
      margin-bottom: 8px;
    }

    :deep(.ant-statistic-content) {
      .anticon {
        margin-right: 8px;
        font-size: 24px;
      }
    }

    .stat-text {
      margin-left: 8px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
    }

    .stat-footer {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: rgba(0, 0, 0, 0.45);
    }
  }
}
</style> 