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
      <div class="table-operations">
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><plus-outlined /></template>
            新增
          </a-button>
          <a-button @click="handleBatchDelete" :disabled="selectedRowKeys.length === 0">
            <template #icon><delete-outlined /></template>
            批量删除
          </a-button>
          <a-button @click="handleBatchStatus(1)" :disabled="selectedRowKeys.length === 0">
            <template #icon><check-outlined /></template>
            批量上架
          </a-button>
          <a-button @click="handleBatchStatus(0)" :disabled="selectedRowKeys.length === 0">
            <template #icon><stop-outlined /></template>
            批量下架
          </a-button>
          <a-button @click="handleExport">
            <template #icon><export-outlined /></template>
            导出
          </a-button>
        </a-space>
      </div>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 商品图片 -->
          <template v-if="column.dataIndex === 'images'">
            <a-image
              :width="50"
              :src="record.images && record.images.length > 0 ? record.images[0] : ''"
              :fallback="'https://via.placeholder.com/50'"
            />
          </template>

          <!-- 商品状态 -->
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '上架' : '下架' }}
            </a-tag>
          </template>

          <!-- 操作 -->
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a @click="handleSpecs(record)">规格</a>
              <a @click="handleToggleStatus(record)">
                {{ record.status === 1 ? '下架' : '上架' }}
              </a>
              <a-popconfirm
                title="确定要删除该商品吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a class="danger-link">删除</a>
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
        :rules="rules"
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
          <image-upload
            v-model:value="formData.images[0]"
            :max-size="2"
            upload-text="上传主图"
            alt="商品主图"
            @change="handleImageUploaded"
          />
          <div class="upload-tip">建议尺寸：800x800px，大小不超过2MB</div>
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
      v-model:visible="specsVisible"
      title="商品规格"
      width="600px"
      @ok="handleSpecsOk"
      @cancel="handleSpecsCancel"
    >
      <div v-for="(specs, specId) in specsOptions" :key="specId" class="spec-group">
        <div class="spec-title">{{ specNames[specId] }}</div>
        <a-checkbox-group v-model:value="specsForm[specId]">
          <a-checkbox
            v-for="spec in specs"
            :key="spec.id"
            :value="spec.id"
          >
            {{ spec.name }}
          </a-checkbox>
        </a-checkbox-group>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import {
  SearchOutlined,
  RedoOutlined,
  PlusOutlined,
  ExportOutlined,
  DeleteOutlined,
  CheckOutlined,
  StopOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/table/interface'
import ImageUpload from '@/components/ImageUpload'
import {
  getProductList,
  getProductCount,
  getProductDetail,
  addProduct,
  updateProduct,
  deleteProduct,
  batchDeleteProducts,
  updateProductStatus,
  batchUpdateProductStatus,
  getCategories,
  type Product,
  type ProductQuery
} from '@/api/product'

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
const categoryOptions = ref<any[]>([])

// 搜索表单数据
const searchForm = reactive<Partial<ProductQuery>>({
  name: '',
  categoryId: undefined,
  status: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  pageNum: 1,
  pageSize: 10,
  orderBy: 'createTime',
  orderType: 'desc'
})

// 表格数据
const loading = ref(false)
const dataSource = ref<Product[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 选择行
const selectedRowKeys = ref<Key[]>([])
const onSelectChange = (keys: Key[]) => {
  selectedRowKeys.value = keys
}

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增商品')
const formRef = ref()
const formData = reactive<Partial<Product>>({
  categoryId: [],
  name: '',
  images: [''],
  price: undefined,
  stock: undefined,
  description: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const rules = {
  categoryId: [{ required: true, message: '请选择商品分类' }],
  name: [{ required: true, message: '请输入商品名称' }],
  price: [{ required: true, message: '请输入商品价格' }],
  stock: [{ required: true, message: '请输入商品库存' }]
}

// 规格弹窗
const specsVisible = ref(false)
const specsOptions = ref({
  1: [
    { id: 1, name: '红色' },
    { id: 2, name: '蓝色' },
    { id: 3, name: '黑色' }
  ],
  2: [
    { id: 4, name: 'S' },
    { id: 5, name: 'M' },
    { id: 6, name: 'L' }
  ]
})
const specNames = {
  1: '颜色',
  2: '尺寸'
}
const specsForm = reactive<Record<number, number[]>>({
  1: [],
  2: []
})

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
  formData.images = ['']
  formData.price = undefined
  formData.stock = undefined
  formData.description = ''
  formData.sort = 0
  formData.status = 1
  modalVisible.value = true
}

// 编辑
const handleEdit = async (record: Product) => {
  try {
    const res = await getProductDetail(record.id)
    modalTitle.value = '编辑商品'
    formData.id = res.id
    formData.categoryId = res.categoryId
    formData.name = res.name
    formData.images = res.images
    formData.price = res.price
    formData.stock = res.stock
    formData.description = res.description
    formData.sort = res.sort
    formData.status = res.status
    modalVisible.value = true
  } catch (error) {
    console.error('获取商品详情失败:', error)
    message.error('获取商品详情失败')
  }
}

// 规格
const handleSpecs = (record: Product) => {
  // TODO: 获取商品规格
  specsVisible.value = true
}

// 切换状态
const handleToggleStatus = async (record: Product) => {
  try {
    const newStatus = record.status === 1 ? 0 : 1
    await updateProductStatus(record.id, newStatus)
    message.success(newStatus === 1 ? '上架成功' : '下架成功')
    fetchData()
  } catch (error) {
    console.error('更新商品状态失败:', error)
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: Product) => {
  try {
    await deleteProduct(record.id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除商品失败:', error)
    message.error('删除失败')
  }
}

// 弹窗确认
const handleModalOk = () => {
  formRef.value?.validate().then(async () => {
    try {
      if (modalTitle.value === '新增商品') {
        await addProduct(formData as Omit<Product, 'id' | 'createTime' | 'updateTime' | 'categoryName' | 'sellerId' | 'sellerName'>)
        message.success('添加成功')
      } else {
        const { id, ...updateData } = formData
        await updateProduct(id!, updateData as Partial<Product>)
        message.success('更新成功')
      }
      modalVisible.value = false
      fetchData()
    } catch (error) {
      console.error('保存商品失败:', error)
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
    const params: ProductQuery = {
      pageNum: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      name: searchForm.name,
      categoryId: searchForm.categoryId,
      status: searchForm.status,
      minPrice: searchForm.minPrice,
      maxPrice: searchForm.maxPrice,
      orderBy: searchForm.orderBy,
      orderType: searchForm.orderType
    }
    
    const [list, total] = await Promise.all([
      getProductList(params),
      getProductCount(params)
    ])
    
    dataSource.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取商品列表失败:', error)
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 获取商品分类
const fetchCategories = async () => {
  try {
    const res = await getCategories()
    categoryOptions.value = res
  } catch (error) {
    console.error('获取商品分类失败:', error)
    message.error('获取商品分类失败')
  }
}

// 图片上传成功
const handleImageUploaded = (url: string) => {
  if (!formData.images) {
    formData.images = ['']
  }
  formData.images[0] = url
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的商品')
    return
  }
  
  try {
    await batchDeleteProducts(selectedRowKeys.value.map(key => Number(key)))
    message.success('批量删除成功')
    selectedRowKeys.value = []
    fetchData()
  } catch (error) {
    console.error('批量删除商品失败:', error)
    message.error('批量删除失败')
  }
}

// 批量更新状态
const handleBatchStatus = async (status: 0 | 1) => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要操作的商品')
    return
  }
  
  try {
    await batchUpdateProductStatus(selectedRowKeys.value.map(key => Number(key)), status)
    message.success(status === 1 ? '批量上架成功' : '批量下架成功')
    selectedRowKeys.value = []
    fetchData()
  } catch (error) {
    console.error('批量更新商品状态失败:', error)
    message.error('批量操作失败')
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