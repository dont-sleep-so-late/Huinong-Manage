<template>
  <div class="product-audit">
    <!-- 搜索表单 -->
    <a-card class="general-card" :bordered="false">
      <a-form
        ref="searchFormRef"
        :model="searchForm"
        layout="horizontal"
        @submit="handleSearch"
      >
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="商品名称" name="name">
              <a-input
                v-model:value="searchForm.name"
                placeholder="请输入商品名称"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="商品分类" name="categoryId">
              <a-select
                v-model:value="searchForm.categoryId"
                placeholder="请选择商品分类"
                allow-clear
              >
                <a-select-option
                  v-for="item in categories"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="审核状态" name="status">
              <a-select
                v-model:value="searchForm.status"
                placeholder="请选择审核状态"
                allow-clear
              >
                <a-select-option :value="0">待审核</a-select-option>
                <a-select-option :value="1">审核通过</a-select-option>
                <a-select-option :value="2">审核拒绝</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="创建时间" name="timeRange">
              <a-range-picker
                v-model:value="timeRange"
                :show-time="{ format: 'HH:mm' }"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24" style="text-align: right">
            <a-space>
              <a-button type="primary" html-type="submit">搜索</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card class="general-card" :bordered="false">
      <template #title>
        <a-space>
          <a-button
            type="primary"
            :disabled="!selectedRowKeys.length"
            @click="handleBatchPass"
          >
            批量通过
          </a-button>
          <a-button
            danger
            :disabled="!selectedRowKeys.length"
            @click="handleBatchReject"
          >
            批量拒绝
          </a-button>
          <a-button @click="handleRefresh">刷新</a-button>
        </a-space>
      </template>
      <a-table
        :loading="loading"
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="handleView(record)">{{ record.name }}</a>
          </template>
          <template v-if="column.key === 'price'">
            ¥{{ record.price.toFixed(2) }}
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleView(record)">查看</a-button>
              <a-button
                v-if="record.status === 0"
                type="link"
                @click="handleAudit(record)"
              >
                审核
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      title="商品详情"
      width="800px"
      @cancel="detailVisible = false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="商品名称">
          {{ detail.name }}
        </a-descriptions-item>
        <a-descriptions-item label="商品分类">
          {{ detail.categoryName }}
        </a-descriptions-item>
        <a-descriptions-item label="商品价格">
          ¥{{ detail.price?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="原价">
          ¥{{ detail.originalPrice?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="商家">
          {{ detail.sellerName }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(detail.status)">
            {{ getStatusText(detail.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ detail.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="更新时间">
          {{ detail.updateTime }}
        </a-descriptions-item>
        <a-descriptions-item label="商品图片" :span="2">
          <a-image-preview-group>
            <a-space>
              <a-image
                v-for="(img, index) in detail.images"
                :key="index"
                :width="120"
                :src="img"
              />
            </a-space>
          </a-image-preview-group>
        </a-descriptions-item>
        <a-descriptions-item label="商品描述" :span="2">
          {{ detail.description }}
        </a-descriptions-item>
        <template v-if="detail.auditReason">
          <a-descriptions-item label="审核意见" :span="2">
            {{ detail.auditReason }}
          </a-descriptions-item>
        </template>
      </a-descriptions>
      <template #footer>
        <a-button type="primary" @click="detailVisible = false">确定</a-button>
      </template>
    </a-modal>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:visible="auditVisible"
      :title="isMultiple ? '批量审核' : '商品审核'"
      @ok="handleAuditSubmit"
      @cancel="handleAuditCancel"
      :confirm-loading="auditLoading"
    >
      <a-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        layout="vertical"
      >
        <a-form-item label="审核结果" name="status">
          <a-radio-group v-model:value="auditForm.status">
            <a-radio :value="1">通过</a-radio>
            <a-radio :value="2">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="审核意见"
          name="auditReason"
          :rules="[
            { required: auditForm.status === 2, message: '请输入审核意见' }
          ]"
        >
          <a-textarea
            v-model:value="auditForm.auditReason"
            :rows="4"
            placeholder="请输入审核意见"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import type { FormInstance } from 'ant-design-vue'
import type { TableRowSelection } from 'ant-design-vue'

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  categoryId: number
  categoryName: string
  price: number
  originalPrice: number
  description: string
  images: string[]
  status: number
  sellerName: string
  createTime: string
  updateTime: string
  auditReason?: string
}

interface ProductQuery {
  page: number
  pageSize: number
  name?: string
  categoryId?: number
  status?: number
  startTime?: string
  endTime?: string
}

interface AuditParams {
  id: number
  status: number
  auditReason: string
}

// 搜索表单
const searchFormRef = ref<FormInstance>()
const searchForm = reactive<Partial<ProductQuery>>({
  name: undefined,
  categoryId: undefined,
  status: undefined
})
const timeRange = ref<[Dayjs, Dayjs]>()

// 表格数据
const loading = ref(false)
const dataSource = ref<Product[]>([])
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 表格列定义
const columns = [
  {
    title: '商品名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '分类',
    dataIndex: 'categoryName',
    key: 'categoryName',
    width: 120
  },
  {
    title: '价格',
    dataIndex: 'price',
    key: 'price',
    width: 100,
    align: 'right' as const
  },
  {
    title: '商家',
    dataIndex: 'sellerName',
    key: 'sellerName',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right' as const
  }
]

// 表格选择
const selectedRowKeys = ref<number[]>([])
const rowSelection = {
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys
  }
} as const

// 商品分类
const categories = ref<Category[]>([])

// 详情弹窗
const detailVisible = ref(false)
const detail = ref<Partial<Product>>({})

// 审核弹窗
const auditVisible = ref(false)
const auditLoading = ref(false)
const auditFormRef = ref<FormInstance>()
const auditForm = reactive<AuditParams>({
  id: 0,
  status: 1,
  auditReason: ''
})
const auditRules = {
  status: [{ required: true, message: '请选择审核结果' }]
}
const isMultiple = ref(false)

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: ProductQuery = {
      page: pagination.current as number || 1,
      pageSize: pagination.pageSize as number || 10,
      ...searchForm
    }
    if (timeRange.value) {
      params.startTime = timeRange.value[0].format('YYYY-MM-DD HH:mm:ss')
      params.endTime = timeRange.value[1].format('YYYY-MM-DD HH:mm:ss')
    }
    const res = await fetch('/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    const data = await res.json()
    if (data.data && Array.isArray(data.data)) {
      dataSource.value = data.data.map((item: any): Product => ({
        id: Number(item.id),
        name: String(item.name),
        categoryId: Number(item.categoryId),
        categoryName: String(item.categoryName),
        price: Number(item.price),
        originalPrice: Number(item.originalPrice),
        description: String(item.description),
        images: Array.isArray(item.images) ? item.images : [],
        status: Number(item.status),
        sellerName: String(item.sellerName),
        createTime: String(item.createTime),
        updateTime: String(item.updateTime),
        auditReason: item.auditReason ? String(item.auditReason) : undefined
      }))
    }
    pagination.total = Number(data.total)
  } catch (error) {
    console.error('获取商品列表失败:', error)
    message.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取商品分类
const fetchCategories = async () => {
  try {
    const res = await fetch('/api/categories')
    const data = await res.json()
    categories.value = data.data
  } catch (error) {
    console.error('获取商品分类失败:', error)
    message.error('获取商品分类失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  timeRange.value = undefined
  pagination.current = 1
  fetchData()
}

// 刷新
const handleRefresh = () => {
  fetchData()
}

// 表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

// 查看详情
const handleView = async (record: Product) => {
  try {
    const res = await fetch(`/api/products/${record.id}`)
    const data = await res.json()
    if (data.data) {
      const item = data.data
      detail.value = {
        id: Number(item.id),
        name: String(item.name),
        categoryId: Number(item.categoryId),
        categoryName: String(item.categoryName),
        price: Number(item.price),
        originalPrice: Number(item.originalPrice),
        description: String(item.description),
        images: Array.isArray(item.images) ? item.images : [],
        status: Number(item.status),
        sellerName: String(item.sellerName),
        createTime: String(item.createTime),
        updateTime: String(item.updateTime),
        auditReason: item.auditReason ? String(item.auditReason) : undefined
      }
    }
    detailVisible.value = true
  } catch (error) {
    console.error('获取商品详情失败:', error)
    message.error('获取商品详情失败')
  }
}

// 审核商品
const handleAudit = (record: Product) => {
  isMultiple.value = false
  auditForm.id = record.id
  auditForm.status = 1
  auditForm.auditReason = ''
  auditVisible.value = true
}

// 批量通过
const handleBatchPass = () => {
  isMultiple.value = true
  auditForm.status = 1
  auditForm.auditReason = ''
  auditVisible.value = true
}

// 批量拒绝
const handleBatchReject = () => {
  isMultiple.value = true
  auditForm.status = 2
  auditForm.auditReason = ''
  auditVisible.value = true
}

// 提交审核
const handleAuditSubmit = async () => {
  try {
    await auditFormRef.value?.validate()
    auditLoading.value = true

    if (isMultiple.value) {
      // 批量审核
      await fetch('/api/products/batch-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: selectedRowKeys.value,
          status: auditForm.status,
          auditReason: auditForm.auditReason
        })
      })
      message.success('批量审核成功')
    } else {
      // 单个审核
      await fetch(`/api/products/${auditForm.id}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: auditForm.status,
          auditReason: auditForm.auditReason
        })
      })
      message.success('审核成功')
    }

    auditVisible.value = false
    selectedRowKeys.value = []
    fetchData()
  } catch (error) {
    console.error('审核失败:', error)
    message.error('审核失败')
  } finally {
    auditLoading.value = false
  }
}

// 取消审核
const handleAuditCancel = () => {
  auditVisible.value = false
  auditFormRef.value?.resetFields()
}

// 获取状态文本
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝',
    3: '已下架'
  }
  return map[status] || '未知'
}

// 获取状态颜色
const getStatusColor = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'error',
    3: 'default'
  }
  return map[status] || 'default'
}

onMounted(() => {
  fetchData()
  fetchCategories()
})
</script>

<style lang="less" scoped>
.product-audit {
  .general-card {
    margin-bottom: 16px;
  }
}
</style> 