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
            v-model:value="searchForm.categoryIds"
            :options="categories"
            placeholder="请选择商品分类"
            :field-names="{
              label: 'name',
              value: 'id',
              children: 'children'
            }"
            allow-clear
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
              <template #icon><IconProvider name="search" /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><IconProvider name="redo" /></template>
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
            <template #icon><IconProvider name="plus" /></template>
            新增
          </a-button>
          <a-button @click="handleBatchDelete" :disabled="selectedRowKeys.length === 0">
            <template #icon><IconProvider name="delete" /></template>
            批量删除
          </a-button>
          <a-button @click="handleBatchStatus(1)" :disabled="selectedRowKeys.length === 0">
            <template #icon><IconProvider name="check" /></template>
            批量上架
          </a-button>
          <a-button @click="handleBatchStatus(0)" :disabled="selectedRowKeys.length === 0">
            <template #icon><IconProvider name="stop" /></template>
            批量下架
          </a-button>
          <a-button @click="handleExport">
            <template #icon><IconProvider name="export" /></template>
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
          <template v-if="column.dataIndex === 'mainImage'">
            <a-image
              :width="50"
              :src="record.mainImage || ''"
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
            v-model="formData.categoryId"
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
            :maxlength="100"
          />
        </a-form-item>
        <a-form-item label="商品主图" name="mainImage">
          <image-upload
            v-model:value="formData.mainImage"
            :max-size="2"
            upload-text="上传主图"
            alt="商品主图"
            @change="handleMainImageUploaded"
          />
          <div class="upload-tip">建议尺寸：800x800px，大小不超过2MB</div>
        </a-form-item>
        <a-form-item label="详情图片" name="detailImages">
          <div class="detail-images">
            <image-upload
              v-for="(url, index) in formData.detailImages"
              :key="index"
              v-model:value="formData.detailImages[index]"
              :max-size="2"
              upload-text="上传详情图"
              alt="商品详情图"
              @change="(val) => handleDetailImageUploaded(val, index)"
            />
            <a-button 
              v-if="formData.detailImages.length < 9" 
              @click="addDetailImage" 
              class="add-image-btn"
            >
              <template #icon><IconProvider name="plus" /></template>
              添加图片
            </a-button>
          </div>
          <div class="upload-tip">最多上传9张详情图，每张大小不超过2MB</div>
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
        <a-form-item label="产地" name="region">
          <a-input
            v-model:value="formData.region"
            placeholder="请输入产地"
            :maxlength="50"
          />
        </a-form-item>
        <a-form-item label="计量单位" name="unit">
          <a-input
            v-model:value="formData.unit"
            placeholder="请输入计量单位"
          />
        </a-form-item>
        <a-form-item label="重量(kg)" name="weight">
          <a-input-number
            v-model:value="formData.weight"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入商品重量"
          />
        </a-form-item>
        <a-form-item label="商品描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            :rows="4"
            placeholder="请输入商品描述"
            :maxlength="500"
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
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/table/interface'
import ImageUpload from '@/components/ImageUpload'
import IconProvider from '@/components/IconProvider.vue'
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
  type ProductQuery,
  type ProductCreateDTO,
  type ProductSpec
} from '@/api/product'

// 表格列定义
const columns = [
  {
    title: '商品图片',
    dataIndex: 'mainImage',
    key: 'mainImage'
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
    title: '产地',
    dataIndex: 'region',
    key: 'region'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    key: 'createdTime'
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
  categoryIds: [],
  status: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  pageNum: 1,
  pageSize: 10,
  orderBy: 'createdTime',
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
const formData = reactive<Partial<ProductCreateDTO & { id?: number }>>({
  categoryId: undefined,
  name: '',
  mainImage: '',
  detailImages: [''],
  price: undefined,
  stock: undefined,
  description: '',
  region: '',
  unit: '个',
  weight: 0.5,
  status: 1
})

// 表单验证规则
const rules = {
  categoryId: [{ required: true, message: '请选择商品分类' }],
  name: [{ required: true, message: '请输入商品名称' }],
  mainImage: [{ required: true, message: '请上传商品主图' }],
  price: [{ required: true, message: '请输入商品价格' }],
  stock: [{ required: true, message: '请输入商品库存' }],
  region: [{ required: true, message: '请输入产地' }],
  unit: [{ required: true, message: '请输入计量单位' }],
  weight: [{ required: true, message: '请输入商品重量' }],
  description: [{ required: true, message: '请输入商品描述' }]
}

// 规格弹窗
const specsVisible = ref(false)
const currentProductId = ref<number>()
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

// 获取分类列表
const categories = ref<any[]>([])
const fetchCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res
  } catch (error) {
    console.error('获取分类列表失败:', error)
    message.error('获取分类列表失败')
  }
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  const params: ProductQuery = {
    pageNum: pagination.current,
    pageSize: pagination.pageSize,
    name: searchForm.name,
    status: searchForm.status,
    minPrice: searchForm.minPrice,
    maxPrice: searchForm.maxPrice,
    orderBy: searchForm.orderBy,
    orderType: searchForm.orderType
  }

  // 处理分类ID
  if (searchForm.categoryIds && searchForm.categoryIds.length > 0) {
    params.categoryId = Number(searchForm.categoryIds[searchForm.categoryIds.length - 1])
  }

  fetchData(params)
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.categoryIds = []
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
  formData.categoryId = undefined
  formData.name = ''
  formData.mainImage = ''
  formData.detailImages = ['']
  formData.price = undefined
  formData.stock = undefined
  formData.description = ''
  formData.region = ''
  formData.unit = '个'
  formData.weight = 0.5
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
    formData.mainImage = res.mainImage
    formData.detailImages = res.detailImages || ['']
    formData.price = res.price
    formData.stock = res.stock
    formData.description = res.description
    formData.region = res.region
    formData.unit = res.unit
    formData.weight = res.weight
    formData.status = res.status
    modalVisible.value = true
  } catch (error) {
    console.error('获取商品详情失败:', error)
    message.error('获取商品详情失败')
  }
}

// 规格
const handleSpecs = (record: Product) => {
  currentProductId.value = record.id
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

// 添加详情图片
const addDetailImage = () => {
  if (formData.detailImages && formData.detailImages.length < 9) {
    formData.detailImages.push('')
  }
}

// 主图上传成功
const handleMainImageUploaded = (url: string) => {
  formData.mainImage = url
}

// 详情图上传成功
const handleDetailImageUploaded = (url: string, index: number) => {
  if (formData.detailImages) {
    formData.detailImages[index] = url
  }
}

// 弹窗确认
const handleModalOk = () => {
  formRef.value?.validate().then(async () => {
    try {
      const submitData: ProductCreateDTO = {
        name: formData.name!,
        description: formData.description!,
        mainImage: formData.mainImage!,
        detailImages: formData.detailImages?.filter(img => img) || [],
        categoryId: formData.categoryId as number,
        price: formData.price!,
        stock: formData.stock!,
        status: formData.status!,
        region: formData.region!,
        unit: formData.unit!,
        weight: formData.weight!
      }

      if (modalTitle.value === '新增商品') {
        await addProduct(submitData)
        message.success('添加成功')
      } else {
        const { id } = formData
        await updateProduct(id!, submitData)
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
  Object.keys(specsForm).forEach(key => {
    specsForm[Number(key)] = []
  })
}

// 表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

// 获取表格数据
const fetchData = async (params?: ProductQuery) => {
  loading.value = true
  try {
    const queryParams: ProductQuery = params || {
      pageNum: pagination.current || 1,
      pageSize: pagination.pageSize || 10
    }
    
    const result = await getProductList(queryParams)
    
    dataSource.value = result.records
    pagination.total = result.total
  } catch (error) {
    console.error('获取商品列表失败:', error)
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
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
onMounted(() => {
  fetchData()
  fetchCategories()
})
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

  .detail-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .add-image-btn {
      width: 104px;
      height: 104px;
    }
  }

  .upload-tip {
    margin-top: 8px;
    color: #999;
    font-size: 12px;
  }

  .text-danger {
    color: #ff4d4f;
  }
}
</style> 