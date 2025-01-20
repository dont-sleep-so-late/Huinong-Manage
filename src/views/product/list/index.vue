<template>
  <div class="product-list">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="商品名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入商品名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="商品分类">
          <a-cascader
            v-model:value="searchForm.categoryId"
            :options="categoryOptions"
            placeholder="请选择商品分类"
            :field-names="{
              label: 'name',
              value: 'id',
              children: 'children'
            }"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="1">上架</a-select-option>
            <a-select-option :value="0">下架</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="价格区间">
          <a-space>
            <a-input-number
              v-model:value="searchForm.minPrice"
              placeholder="最低价"
              :min="0"
              style="width: 120px"
            />
            <span>-</span>
            <a-input-number
              v-model:value="searchForm.maxPrice"
              placeholder="最高价"
              :min="0"
              style="width: 120px"
            />
          </a-space>
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
          <template v-if="column.key === 'image'">
            <img :src="text" alt="商品图片" class="product-image" />
          </template>
          
          <template v-else-if="column.key === 'price'">
            ¥{{ text.toFixed(2) }}
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="text === 1 ? 'success' : 'error'">
              {{ text === 1 ? '上架' : '下架' }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a @click="handleSpecs(record)">规格</a>
              <a-divider type="vertical" />
              <a-popconfirm
                :title="record.status === 1 ? '确定要下架该商品吗？' : '确定要上架该商品吗？'"
                @confirm="handleToggleStatus(record)"
              >
                <a>{{ record.status === 1 ? '下架' : '上架' }}</a>
              </a-popconfirm>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该商品吗？"
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
        <a-form-item label="商品分类" name="categoryId">
          <a-cascader
            v-model:value="formData.categoryId"
            :options="categoryOptions"
            placeholder="请选择商品分类"
            :field-names="{
              label: 'name',
              value: 'id',
              children: 'children'
            }"
          />
        </a-form-item>
        <a-form-item label="商品名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入商品名称"
          />
        </a-form-item>
        <a-form-item label="商品图片" name="images">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <div v-if="fileList.length < 5">
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="商品价格" name="price">
          <a-input-number
            v-model:value="formData.price"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入商品价格"
          />
        </a-form-item>
        <a-form-item label="商品库存" name="stock">
          <a-input-number
            v-model:value="formData.stock"
            :min="0"
            style="width: 100%"
            placeholder="请输入商品库存"
          />
        </a-form-item>
        <a-form-item label="商品描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number
            v-model:value="formData.sort"
            :min="0"
            style="width: 100%"
            placeholder="请输入排序号"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">上架</a-radio>
            <a-radio :value="0">下架</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 规格弹窗 -->
    <a-modal
      v-model:open="specsVisible"
      title="商品规格"
      width="800px"
      @ok="handleSpecsOk"
      @cancel="handleSpecsCancel"
    >
      <a-form
        ref="specsFormRef"
        :model="specsForm"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item
          v-for="spec in productSpecs"
          :key="spec.id"
          :label="spec.name"
        >
          <a-checkbox-group v-model:value="specsForm[spec.id]">
            <a-checkbox
              v-for="value in spec.values"
              :key="value"
              :value="value"
            >
              {{ value }}
            </a-checkbox>
          </a-checkbox-group>
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

interface ProductInfo {
  id: number
  categoryId: number[]
  name: string
  images: string[]
  price: number
  stock: number
  description: string
  sort: number
  status: number
  createTime: string
}

interface SearchForm {
  name?: string
  categoryId?: number[]
  status?: number
  minPrice?: number
  maxPrice?: number
  pageNum: number
  pageSize: number
}

interface SpecInfo {
  id: number
  name: string
  values: string[]
}

// 表格列定义
const columns = [
  {
    title: '商品图片',
    dataIndex: ['images', 0],
    key: 'image'
  },
  {
    title: '商品名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '价格',
    dataIndex: 'price',
    key: 'price'
  },
  {
    title: '库存',
    dataIndex: 'stock',
    key: 'stock'
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 商品分类选项
const categoryOptions = ref([
  {
    id: 1,
    name: '蔬菜水果',
    children: [
      {
        id: 2,
        name: '新鲜蔬菜'
      },
      {
        id: 3,
        name: '新鲜水果'
      }
    ]
  },
  {
    id: 4,
    name: '肉禽蛋品',
    children: [
      {
        id: 5,
        name: '猪肉'
      },
      {
        id: 6,
        name: '牛肉'
      }
    ]
  }
])

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  name: '',
  categoryId: undefined,
  status: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<ProductInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增商品')
const formRef = ref()
const formData = reactive<Partial<ProductInfo>>({
  categoryId: [],
  name: '',
  images: [],
  price: undefined,
  stock: undefined,
  description: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  categoryId: [
    { required: true, message: '请选择商品分类' }
  ],
  name: [
    { required: true, message: '请输入商品名称' }
  ],
  images: [
    { required: true, message: '请上传商品图片' }
  ],
  price: [
    { required: true, message: '请输入商品价格' }
  ],
  stock: [
    { required: true, message: '请输入商品库存' }
  ],
  description: [
    { required: true, message: '请输入商品描述' }
  ]
}

// 图片上传相关
const fileList = ref([])
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
    formData.images = info.fileList.map(file => file.response.url)
    loading.value = false
  }
}

// 规格弹窗
const specsVisible = ref(false)
const specsFormRef = ref()
const specsForm = reactive<Record<number, string[]>>({})
const productSpecs = ref<SpecInfo[]>([
  {
    id: 1,
    name: '重量',
    values: ['500g', '1kg', '2kg']
  },
  {
    id: 2,
    name: '包装',
    values: ['盒装', '袋装']
  }
])

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.categoryId = undefined
  searchForm.status = undefined
  searchForm.minPrice = undefined
  searchForm.maxPrice = undefined
  handleSearch()
}

// 导出
const handleExport = () => {
  message.success('导出成功')
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增商品'
  formData.id = undefined
  formData.categoryId = []
  formData.name = ''
  formData.images = []
  formData.price = undefined
  formData.stock = undefined
  formData.description = ''
  formData.sort = 0
  formData.status = 1
  fileList.value = []
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: ProductInfo) => {
  modalTitle.value = '编辑商品'
  Object.assign(formData, record)
  fileList.value = record.images.map((url, index) => ({
    uid: `-${index}`,
    name: `image-${index}.png`,
    status: 'done',
    url
  }))
  modalVisible.value = true
}

// 规格
const handleSpecs = (record: ProductInfo) => {
  // TODO: 获取商品规格
  specsVisible.value = true
}

// 切换状态
const handleToggleStatus = async (record: ProductInfo) => {
  try {
    // TODO: 调用切换状态API
    message.success(record.status === 1 ? '下架成功' : '上架成功')
    fetchData()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: ProductInfo) => {
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

// 规格确认
const handleSpecsOk = async () => {
  try {
    // TODO: 调用保存规格API
    message.success('保存成功')
    specsVisible.value = false
  } catch (error) {
    message.error('保存失败')
  }
}

// 规格取消
const handleSpecsCancel = () => {
  specsVisible.value = false
  specsForm.value = {}
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
        categoryId: [1, 2],
        name: '新鲜胡萝卜',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        price: 2.5,
        stock: 1000,
        description: '新鲜胡萝卜，农场直供',
        sort: 1,
        status: 1,
        createTime: '2024-01-01 00:00:00'
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
.product-list {
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

  .text-danger {
    color: #ff4d4f;
  }
}
</style> 