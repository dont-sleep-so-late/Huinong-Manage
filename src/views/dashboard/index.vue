<template>
  <div class="dashboard">
    <a-card>
      <a-form layout="inline" @submit.prevent="handleSearch">
        <a-form-item label="品种大类：">
          <a-select v-model:value="majorCategory" style="width: 160px" placeholder="请选择大类"
            @change="onMajorCategoryChange">
            <a-select-option v-for="item in majorCategories" :key="item.varietyTypeCode"
              :value="item.varietyTypeCode">{{ item.varietyTypeName
              }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="小类：">
          <a-select v-model:value="subCategory" style="width: 180px" placeholder="请选择小类">
            <a-select-option v-for="item in subCategories" :key="item.varietyName" :value="item.varietyName">{{
              item.varietyName }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="周期：">
          <a-select v-model:value="cycle" style="width: 120px">
            <a-select-option v-for="item in cycleOptions" :key="item" :value="item">{{ item }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card style="margin-top: 16px">
      <!-- 图表区域：后续用ECharts替换 -->
      <div v-if="loading" style="text-align:center;padding:40px 0;">加载中...</div>
      <div v-else style="height:400px;">
        <div id="priceChart" ref="chartRef" style="height:100%;width:100%;"></div>
      </div>
    </a-card>
    <a-card style="margin-top: 16px">
      <NewsList />
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { getVarietyMajorCategories, getVarietyNameByPid, getSingleVarietiesCountry } from '@/api/price'
import * as echarts from 'echarts'
import axios from 'axios'
import NewsList from '@/components/NewsList.vue'

const majorCategories = ref<any[]>([])
const subCategories = ref<any[]>([])
const majorCategory = ref<string>()
const subCategory = ref<string>()
const cycle = ref<string>('近一年')
const cycleOptions = ['近7日', '近一月', '近半年', '近一年']
const xData = ref<string[]>([])
const yData = ref<string[]>([])
const marketData = ref<{name: string, price: string, date: string}[]>([])
const loading = ref(false)
const dailyList = ref<any[]>([])
const dailyPageNum = ref(1)
const dailyPageSize = 10
const dailyTotal = ref(0)
const newsListRef = ref()

// 获取大类
const fetchMajorCategories = async () => {
  try {
    const { data } = await getVarietyMajorCategories()
    majorCategories.value = data.content || []
    // 默认选中第一个
    if (majorCategories.value.length) {
      majorCategory.value = majorCategories.value[0].varietyTypeCode
      await fetchSubCategories()
    }
  } catch (e) {
    message.error('获取品种大类失败')
  }
}

// 获取子类
const fetchSubCategories = async () => {
  if (!majorCategory.value) return
  try {
    const { data } = await getVarietyNameByPid(majorCategory.value)
    // 兼容接口返回嵌套数组
    const arr = Array.isArray(data.content) ? data.content.flat() : []
    subCategories.value = arr
    if (arr.length) {
      subCategory.value = arr[0].varietyName
    }
  } catch (e) {
    message.error('获取小类失败')
  }
}

// 查询行情
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  // 如果已经存在实例，先销毁
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 初始化图表
  chartInstance = echarts.init(chartRef.value)
  
  // 如果没有数据，不渲染图表
  if (!xData.value.length || !yData.value.length) {
    chartInstance.showLoading({
      text: '暂无数据',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      fontSize: 16
    })
    return
  }
  
  // 配置图表选项
  const option = {
    title: {
      text: `${subCategory.value || ''}价格走势`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} 元/公斤'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData.value
    },
    yAxis: {
      type: 'value',
      name: '价格(元/公斤)',
      axisLabel: {
        formatter: '{value} 元'
      }
    },
    series: [
      {
        name: '价格',
        type: 'line',
        data: yData.value,
        smooth: true,
        markPoint: {
          data: [
            { type: 'max', name: '最高价' },
            { type: 'min', name: '最低价' }
          ]
        },
        lineStyle: {
          width: 3,
          color: '#1890ff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(24, 144, 255, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(24, 144, 255, 0.1)'
            }
          ])
        }
      }
    ]
  }
  
  // 设置图表选项
  chartInstance.setOption(option)
  chartInstance.hideLoading()
}

// 窗口大小变化时，调整图表大小
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听窗口大小变化
window.addEventListener('resize', resizeChart)

// 组件卸载时，移除事件监听和销毁图表实例
onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

const fetchMarketData = async () => {
  if (!subCategory.value) return
  loading.value = true
  try {
    const {data} = await getSingleVarietiesCountry({ name: subCategory.value, cycle: cycle.value })
    xData.value = data.content?.x || []
    yData.value = data.content?.y || []
    // 保存市场价格数据
    const priceData = data.content?.price || []
    if (priceData.length >= 2) {
      marketData.value = priceData.map((item: any) => ({
        name: item.marketName,
        price: item.middlePrice,
        date: item.reportTime
      }))
    }
    // 数据加载完成后初始化或更新图表
    setTimeout(initChart, 0)
  } catch (e) {
    message.error('获取行情数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchMarketData()
}

const onMajorCategoryChange = async () => {
  await fetchSubCategories()
}

const fetchDailyList = async (pageNum = 1) => {
  try {
    const res = await axios.post('https://pfsc.agri.cn/api/FarmDaily/list', {
      pageNum,
      pageSize: dailyPageSize,
      remark: ''
    }, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json, text/plain, */*'
      }
    })
    const content = res.data.content
    dailyList.value = content.list || []
    dailyTotal.value = content.totalCount || 0
    dailyPageNum.value = content.pageNum || 1
  } catch (e) {
    message.error('获取价格日报失败')
  }
}

const onDailyPageChange = (page: number) => {
  fetchDailyList(page)
}

const formatDay = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.slice(8, 10)
}
const formatMonth = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.slice(0, 7).replace('-', '/')
}

onMounted(async () => {
  await fetchMajorCategories()
  await fetchMarketData()
  await fetchDailyList()
})
</script>

<style lang="less" scoped>
.dashboard {
  padding: 24px;
}
.daily-list {
  .daily-item {
    display: flex;
    border-bottom: 1px dashed #eee;
    padding: 16px 0;
    &:last-child {
      border-bottom: none;
    }
    .daily-date {
      width: 80px;
      text-align: center;
      margin-right: 16px;
      .daily-date-day {
        font-size: 32px;
        color: #ff4d4f;
        font-weight: bold;
      }
      .daily-date-month {
        font-size: 14px;
        color: #888;
      }
    }
    .daily-content {
      flex: 1;
      .daily-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .daily-summary {
        color: #555;
        margin-bottom: 4px;
      }
      .daily-source {
        color: #aaa;
        font-size: 13px;
      }
    }
  }
}
</style>
