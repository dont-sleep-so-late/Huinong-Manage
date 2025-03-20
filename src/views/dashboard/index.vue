<template>
  <div class="dashboard">
    <a-row :gutter="[16, 16]">
      <!-- 农产品价格趋势图 -->
      <a-col :span="24">
        <a-card title="农产品价格趋势">
          <template #extra>
            <a-space>
              <a-cascader
                v-model:value="selectedProduct"
                :options="productTree"
                :field-names="{ label: 'label', value: 'id', children: 'children' }"
                placeholder="搜索或选择农产品"
                @change="handleProductChange"
                :show-search="true"
                :filter-option="filterOption"
                style="width: 300px"
              />
              <a-select
                v-model:value="selectedProvince"
                style="width: 120px"
                placeholder="请选择省份"
                @change="handleProvinceChange"
              >
                <a-select-option v-for="item in provinces" :key="item" :value="item">
                  {{ item }}
                </a-select-option>
              </a-select>
              <a-select
                v-model:value="selectedMarket"
                style="width: 200px"
                placeholder="请选择市场名称"
                @change="handleMarketChange"
              >
                <a-select-option v-for="market in markets" :key="market" :value="market">
                  {{ market }}
                </a-select-option>
              </a-select>
              <a-range-picker
                v-model:value="dateRange"
                :disabled-date="disabledDate"
                @change="handleDateChange"
              />
            </a-space>
          </template>
          <div ref="priceChart" style="height: 400px; width: 100%;"></div>
        </a-card>
      </a-col>
      <!-- 农产品价格分布图 -->
      <a-col :span="16">
        <a-card :title="`${currentDate}农产品价格分布图`">
          <template #extra>
            <a-cascader
              v-model:value="selectedProduct2"
              :options="productTree2"
              :field-names="{ label: 'label', value: 'value', children: 'children' }"
              placeholder="搜索或选择农产品"
              @change="handleProductChange2"
              :changeOnSelect="false"
              :show-search="true"
              :filter-option="filterOption"
              style="width: 300px"
            />
          </template>
          <div ref="priceMap" style="height: 450px; width: 100%;"></div>
        </a-card>
      </a-col>

      <!-- 价格排行榜 -->
      <a-col :span="8">
        <a-card title="批发价格最高排名">
          <div class="price-rank-list">
            <div v-for="(item, index) in topMarkets" :key="index" class="price-rank-item">
              <div class="rank-number" :class="{'top-three': index < 3}">{{ index + 1 }}</div>
              <div class="market-info">
                <div class="market-name">{{ item.marketName }}</div>
                <div class="price-value">{{ item.todayPrice }}</div>
              </div>
              <div class="price-bar-container">
                <div class="price-bar" :style="{ width: ((item.todayPrice / Math.max(...topMarkets.map(m => m.todayPrice))) * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </a-card>
        <a-card :title="`${currentDate}批发价格最低排名`" class="mt-4">
          <div class="price-rank-list">
            <div v-for="(item, index) in bottomMarkets" :key="index" class="price-rank-item">
              <div class="rank-number" :class="{'top-three': index < 3}">{{ index + 1 }}</div>
              <div class="market-info">
                <div class="market-name">{{ item.marketName }}</div>
                <div class="price-value">{{ item.todayPrice }}</div>
              </div>
              <div class="price-bar-container">
                <div class="price-bar price-bar-low" :style="{ width: ((item.todayPrice / Math.max(...bottomMarkets.map(m => m.todayPrice))) * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { message } from 'ant-design-vue'
import type { SelectProps } from 'ant-design-vue'
import type { DefaultOptionType } from 'ant-design-vue/es/cascader'
import type { CascaderProps } from 'ant-design-vue'
import * as echarts from 'echarts'
import { getProductTree, getMarketList, getPriceTrend, getProductTreeList, getNewestMarketData } from '@/api/price'
import chinaJson from '@/assets/map/china-contour.json'

// 注册地图数据
echarts.registerMap('china', chinaJson as any)

const currentDate = ref('')
const topMarkets = ref<any[]>([])
const bottomMarkets = ref<any[]>([])
const priceMap = ref<HTMLElement>()
let mapInstance: echarts.ECharts
// 农产品价格趋势相关数据
const productTree = ref<any[]>([])
const productTree2 = ref<any[]>([])
const provinces = ref<string[]>([])
const markets = ref<string[]>([])
const selectedProduct = ref<string[]>(['AE', 'AE01', 'AE01001'])
const selectedProduct2 = ref<string[]>(['畜产品', '生猪产品', 'AL01002'])
const selectedProvince = ref<string>()
const selectedMarket = ref<string>()
const dateRange = ref<[Dayjs, Dayjs]>([dayjs().subtract(3, 'week'), dayjs()])
const priceChart = ref<HTMLElement>()
let priceChartInstance: echarts.ECharts

// 获取农产品分类树
const fetchProductTree = async () => {
  try {
    const { data: res } = await getProductTree()
    if (res.code === 0) {
      productTree.value = res.data
    }
  } catch (error) {
    message.error('获取农产品分类失败')
  }
}

// 获取市场列表
const fetchMarketList = async () => {
  try {
    const { data: res } = await getMarketList()
    if (res.code === 0) {
      const marketData = res.data
      provinces.value = marketData.map((item: any) => item.province)
    }
  } catch (error) {
    message.error('获取市场列表失败')
  }
}

// 处理省份选择变化
const handleProvinceChange: SelectProps['onChange'] = async (value) => {
  if (typeof value !== 'string') return
  selectedProvince.value = value
  try {
    const { data: res } = await getMarketList()
    if (res.code === 0) {
      const marketData = res.data
      const provinceData = marketData.find((item: any) => item.province === value)
      markets.value = provinceData ? provinceData.children : []
      selectedMarket.value = ''
      updatePriceTrend()
    }
  } catch (error) {
    message.error('获取市场列表失败')
  }
}

// 处理市场选择变化
const handleMarketChange: SelectProps['onChange'] = (value) => {
  if (typeof value !== 'string') return
  selectedMarket.value = value
  updatePriceTrend()
}

// 处理农产品选择变化
const handleProductChange = () => {
  updatePriceTrend()
}

// 处理日期范围变化
const handleDateChange = () => {
  updatePriceTrend()
}

// 禁用未来日期
const disabledDate = (current: Dayjs) => {
  return current && current > dayjs().endOf('day')
}

// 更新价格趋势图表
const updatePriceTrend = async () => {
  if (!selectedProduct.value || selectedProduct.value.length < 3) {
    return
  }
  try {
    const [startTime, endTime] = dateRange.value
    const params = {
      startTime: startTime.format('YYYYMMDD'),
      endTime: endTime.format('YYYYMMDD'),
      productId: selectedProduct.value[2],
      productClass1Code: selectedProduct.value[0],
      productClass2Code: selectedProduct.value[1],
      marketName: selectedMarket.value,
      province: selectedProvince.value,
      timetype: 'r'
    }

    const { data: res } = await getPriceTrend(params)
    if (res.code === 0) {
      const { names, values } = res.data
      initPriceChart(names, values[0])
    }
  } catch (error) {
    message.error('获取价格趋势数据失败')
  }
}

// 初始化价格趋势图表
const initPriceChart = (dates: string[], prices: number[]) => {
  if (!priceChart.value) return
  if (!priceChartInstance) {
    priceChartInstance = echarts.init(priceChart.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: ¥{c}'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: 'auto',
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '价格(元/kg)',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '批发价',
        type: 'line',
        data: prices,
        smooth: true,
        markPoint: {
          data: [
            { type: 'max', name: '最高价' },
            { type: 'min', name: '最低价' }
          ]
        }
      }
    ]
  }

  priceChartInstance.setOption(option)
}

// 获取农产品分类树
const fetchProductTree2 = async () => {
  try {
    const { data: res } = await getProductTreeList()
    if (res.code === 0) {
      console.log('原始数据:', res.data)
      
      // 定义树节点类型
      interface TreeNode {
        label: string;
        value: string;
        children?: TreeNode[];
      }

      // 处理数据结构，转换为级联选择器需要的格式
      const processTreeData = (items: any): TreeNode[] => {
        if (!items || !items.children) return []
        
        return items.children
          .filter((child: any) => child && child.label && child.code)
          .map((child: any) => {
            const firstLevel: TreeNode = {
              label: child.label,
              value: child.code,
              children: []
            }
            
            if (Array.isArray(child.children)) {
              firstLevel.children = child.children
                .filter((subChild: any) => subChild && subChild.label && subChild.code)
                .map((subChild: any) => {
                  const secondLevel: TreeNode = {
                    label: subChild.label,
                    value: subChild.code,
                    children: []
                  }
                  
                  if (Array.isArray(subChild.children)) {
                    secondLevel.children = subChild.children
                      .filter((leaf: any) => leaf && leaf.label && leaf.code)
                      .map((leaf: any) => ({
                        label: leaf.label,
                        value: leaf.code
                      }))
                  }
                  
                  return secondLevel
                })
            }
            
            return firstLevel
          })
      }

      const processedData = processTreeData(res.data)
      console.log('处理后的数据:', processedData)
      productTree2.value = processedData
    }
  } catch (error) {
    console.error('获取农产品分类失败:', error)
    message.error('获取农产品分类失败')
  }
}

// 更新价格分布地图
const updatePriceMap = async (data: any[]) => {
  if (!priceMap.value || data.length === 0) return
  
  await nextTick()
  
  if (!mapInstance) {
    mapInstance = echarts.init(priceMap.value)
  }

  try {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value } = params
          if (!value) return name
          return `${name}<br/>价格：¥${value[2]}/kg<br/>涨跌：${value[3]}%`
        }
      },
      visualMap: {
        min: Math.min(...data.map(item => item.todayPrice)),
        max: Math.max(...data.map(item => item.todayPrice)),
        calculable: true,
        inRange: {
          color: ['#50a3ba', '#eac736', '#d94e5d']
        }
      },
      geo: {
        map: 'china',
        roam: true,
        emphasis: {
          label: {
            show: true
          }
        }
      },
      series: [{
        name: '价格分布',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: data.map(item => ({
          name: item.marketName,
          value: [
            Number(item.longitude),
            Number(item.latitude),
            item.todayPrice,
            item.priceHb
          ]
        })),
        symbolSize: 12,
        emphasis: {
          label: {
            show: true
          }
        }
      }]
    }

    mapInstance.setOption(option)
  } catch (error) {
    console.error('更新地图失败:', error)
    message.error('更新地图失败')
  }
}

// 处理农产品选择变化
const handleProductChange2: CascaderProps['onChange'] = async (value, selectedOptions) => {
  if (!selectedOptions || selectedOptions.length === 0) return
  
  const lastSelected = selectedOptions[selectedOptions.length - 1] as DefaultOptionType
  if (!lastSelected || typeof lastSelected.value !== 'string') return
  
  try {
    const { data: res } = await getNewestMarketData(lastSelected.value)
    if (res.code === 0) {
      currentDate.value = res.data.today || ''
      topMarkets.value = res.data.uplist || []
      bottomMarkets.value = res.data.downlist || []
      if (res.data.uplist?.length > 0 || res.data.downlist?.length > 0) {
        await updatePriceMap([...(res.data.uplist || []), ...(res.data.downlist || [])])
      } else {
        message.warning('暂无该农产品的价格数据')
      }
    }
  } catch (error) {
    console.error('获取价格数据失败:', error)
    message.error('获取价格数据失败')
  }
}

// 添加 filterOption 函数
const filterOption = (inputValue: string, path: DefaultOptionType[]) => {
  return path.some(option => {
    // 将输入和选项文本都转换为小写，去除空格后进行匹配
    const label = String(option.label).toLowerCase().trim()
    const input = inputValue.toLowerCase().trim()
    return label.includes(input)
  })
}

// 初始化
onMounted(async () => {
  await fetchProductTree()
  await fetchProductTree2()
  await fetchMarketList()
  await updatePriceTrend()
  
  // 初始化价格分布图数据
  if (selectedProduct2.value.length > 0) {
    const lastValue = selectedProduct2.value[selectedProduct2.value.length - 1]
    await getNewestMarketData(lastValue).then(({ data: res }) => {
      if (res.code === 0) {
        currentDate.value = res.data.today || ''
        topMarkets.value = res.data.uplist || []
        bottomMarkets.value = res.data.downlist || []
        if (res.data.uplist?.length > 0 || res.data.downlist?.length > 0) {
          updatePriceMap([...(res.data.uplist || []), ...(res.data.downlist || [])])
        }
      }
    }).catch((error) => {
      console.error('初始化价格分布图数据失败:', error)
      message.error('初始化价格分布图数据失败')
    })
  }
  
  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    priceChartInstance?.resize()
    mapInstance?.resize()
  })
})
</script>

<style lang="less" scoped>
.dashboard {
  padding: 24px;
}

.mt-4 {
  margin-top: 16px;
}

.price-rank-list {
  padding: 8px;
}

.price-rank-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.rank-number {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #f0f0f0;
  border-radius: 4px;
  margin-right: 12px;
  font-size: 14px;
  color: #666;
  
  &.top-three {
    background: #ff4d4f;
    color: white;
  }
}

.market-info {
  flex: 1;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.market-name {
  font-size: 14px;
  color: #333;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-value {
  font-size: 14px;
  color: #333;
  font-weight: bold;
  &::before {
    content: '¥';
    margin-right: 2px;
  }
}

.price-bar-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding-left: 36px;
  z-index: 0;
}

.price-bar {
  height: 100%;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 2px;
}

.price-bar-low {
  background: rgba(82, 196, 26, 0.1);
}

.price-change {
  &.up {
    color: #f5222d;
  }
  &.down {
    color: #52c41a;
  }
}
</style> 