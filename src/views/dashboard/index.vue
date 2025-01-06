<template>
  <div class="dashboard">
    <!-- 数据概览 -->
    <a-row :gutter="24">
      <a-col :span="6">
        <a-card>
          <template #cover>
            <div class="statistic-card">
              <shopping-outlined class="icon" />
              <a-statistic title="商品总数" :value="statistics.productCount" />
            </div>
          </template>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <template #cover>
            <div class="statistic-card">
              <shopping-cart-outlined class="icon" />
              <a-statistic title="订单总数" :value="statistics.orderCount" />
            </div>
          </template>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <template #cover>
            <div class="statistic-card">
              <user-outlined class="icon" />
              <a-statistic title="用户总数" :value="statistics.userCount" />
            </div>
          </template>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <template #cover>
            <div class="statistic-card">
              <dollar-outlined class="icon" />
              <a-statistic
                title="销售总额"
                :value="statistics.totalSales"
                :precision="2"
                prefix="￥"
              />
            </div>
          </template>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表展示 -->
    <a-row :gutter="24" class="chart-row">
      <!-- 销售趋势 -->
      <a-col :span="12">
        <a-card title="销售趋势">
          <div ref="salesChart" class="chart"></div>
        </a-card>
      </a-col>
      
      <!-- 用户增长 -->
      <a-col :span="12">
        <a-card title="用户增长">
          <div ref="userChart" class="chart"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最新动态 -->
    <a-card title="最新动态" class="latest-news">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 待处理订单 -->
        <a-tab-pane key="1" tab="待处理订单">
          <a-table
            :columns="orderColumns"
            :data-source="latestOrders"
            :pagination="false"
          >
            <template #status="{ text }">
              <a-tag :color="getOrderStatusColor(text)">
                {{ getOrderStatusText(text) }}
              </a-tag>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 系统通知 -->
        <a-tab-pane key="2" tab="系统通知">
          <a-list
            :data-source="notifications"
            :pagination="false"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :title="item.title"
                  :description="item.time"
                >
                  <template #avatar>
                    <a-avatar
                      :style="{ backgroundColor: item.color }"
                      :icon="getNotificationIcon(item.type)"
                    />
                  </template>
                </a-list-item-meta>
                <div>{{ item.content }}</div>
              </a-list-item>
            </template>
          </a-list>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  BellOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'

// 统计数据
const statistics = ref({
  productCount: 1234,
  orderCount: 567,
  userCount: 890,
  totalSales: 123456.78
})

// 图表实例
let salesChartInstance: echarts.ECharts | null = null
let userChartInstance: echarts.ECharts | null = null

// 图表DOM引用
const salesChart = ref<HTMLElement | null>(null)
const userChart = ref<HTMLElement | null>(null)

// 初始化销售趋势图表
const initSalesChart = () => {
  if (salesChart.value) {
    salesChartInstance = echarts.init(salesChart.value)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          data: [820, 932, 901, 934, 1290, 1330, 1320]
        }
      ]
    }
    salesChartInstance.setOption(option)
  }
}

// 初始化用户增长图表
const initUserChart = () => {
  if (userChart.value) {
    userChartInstance = echarts.init(userChart.value)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '用户数',
          type: 'bar',
          data: [120, 200, 150, 80, 70, 110, 130]
        }
      ]
    }
    userChartInstance.setOption(option)
  }
}

// 订单表格列定义
const orderColumns = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo'
  },
  {
    title: '商品',
    dataIndex: 'product',
    key: 'product'
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' }
  }
]

// 最新订单数据
const latestOrders = ref([
  {
    key: '1',
    orderNo: 'NO20220101001',
    product: '有机蔬菜礼盒',
    amount: 199,
    status: 'pending'
  },
  {
    key: '2',
    orderNo: 'NO20220101002',
    product: '新鲜水果组合',
    amount: 299,
    status: 'processing'
  },
  {
    key: '3',
    orderNo: 'NO20220101003',
    product: '农家土鸡蛋',
    amount: 99,
    status: 'success'
  }
])

// 系统通知数据
const notifications = ref([
  {
    id: 1,
    title: '系统更新通知',
    content: '系统将于今晚22:00进行例行维护更新',
    time: '2022-01-01 10:00:00',
    type: 'info',
    color: '#1890ff'
  },
  {
    id: 2,
    title: '订单异常提醒',
    content: '有3个订单支付异常，请及时处理',
    time: '2022-01-01 09:30:00',
    type: 'warning',
    color: '#faad14'
  }
])

// 标签页激活key
const activeTab = ref('1')

// 获取订单状态颜色
const getOrderStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    success: 'green',
    failed: 'red'
  }
  return colors[status] || 'default'
}

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    success: '已完成',
    failed: '失败'
  }
  return texts[status] || status
}

// 获取通知图标
const getNotificationIcon = (type: string) => {
  const icons: Record<string, any> = {
    info: InfoCircleOutlined,
    warning: WarningOutlined,
    notification: BellOutlined
  }
  return icons[type] || BellOutlined
}

// 监听窗口大小变化
const handleResize = () => {
  salesChartInstance?.resize()
  userChartInstance?.resize()
}

onMounted(() => {
  initSalesChart()
  initUserChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  salesChartInstance?.dispose()
  userChartInstance?.dispose()
})
</script>

<style lang="less" scoped>
.dashboard {
  .statistic-card {
    padding: 20px;
    display: flex;
    align-items: center;

    .icon {
      font-size: 48px;
      margin-right: 16px;
      color: #1890ff;
    }
  }

  .chart-row {
    margin-top: 24px;
  }

  .chart {
    height: 300px;
  }

  .latest-news {
    margin-top: 24px;
  }
}
</style> 