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
          >
            <a-select-option :value="1">上架</a-select-option>
            <a-select-option :value="0">下架</a-select-option>
          </a-select>
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

    <!-- 操作按钮 -->
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

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <!-- 商品图片 -->
        <template #image="{ text }">
          <a-image
            :width="50"
            :src="text"
            :preview="{
              src: text
            }"
          />
        </template>

        <!-- 价格 -->
        <template #price="{ text }">
          ¥{{ text.toFixed(2) }}
        </template>

        <!-- 状态 -->
        <template #status="{ text }">
          <a-tag :color="text === 1 ? 'success' : 'error'">
            {{ text === 1 ? '上架' : '下架' }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="handleSpec(record)">规格</a>
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
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
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
        <a-form-item label="商品名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入商品名称"
          />
        </a-form-item>
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
        <a-form-item label="商品图片" name="image">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="formData.image" :src="formData.image" alt="商品图片" style="width: 100%" />
            <div v-else>
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
            :step="0.01"
            style="width: 100%"
            placeholder="请输入商品价格"
          />
        </a-form-item>
        <a-form-item label="商品库存" name="stock">
          <a-input-number
            v-model:value="formData.stock"
            :min="0"
            :precision="0"
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
      v-model:visible="specVisible"
      title="商品规格"
      width="800px"
      @ok="handleSpecOk"
      @cancel="handleSpecCancel"
    >
      <a-form layout="vertical">
        <a-form-item
          v-for="(spec, index) in specList"
          :key="index"
          :label="'规格' + (index + 1)"
        >
          <a-space>
            <a-input
              v-model:value="spec.name"
              placeholder="规格名称"
              style="width: 200px"
            />
            <a-input-number
              v-model:value="spec.price"
              :min="0"
              :precision="2"
              :step="0.01"
              placeholder="价格"
              style="width: 200px"
            />
            <a-input-number
              v-model:value="spec.stock"
              :min="0"
              :precision="0"
              placeholder="库存"
              style="width: 200px"
            />
            <minus-circle-outlined
              v-if="specList.length > 1"
              class="dynamic-delete-button"
              @click="removeSpec(spec)"
            />
          </a-space>
        </a-form-item>
        <a-form-item>
          <a-button type="dashed" block @click="addSpec">
            <plus-outlined />
            添加规格
          </a-button>
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
  ExportOutlined,
  MinusCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'

interface ProductInfo {
  id: number
  name: string
  categoryId: number[]
  image: string
  price: number
  stock: number
  description: string
  status: number
  createTime: string
}

interface SearchForm {
  name?: string
  categoryId?: number[]
  status?: number
  pageNum: number
  pageSize: number
}

interface SpecItem {
  id?: number
  name: string
  price: number
  stock: number
}

// 表格列定义
const columns = [
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
    slots: { customRender: 'price' }
  },
  {
    title: '库存',
    dataIndex: 'stock',
    key: 'stock'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' }
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' }
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

// 弹窗相关
const modalVisible = ref(false)
const modalTitle = ref('新增商品')
const formRef = ref()
const formData = reactive<Partial<ProductInfo>>({
  name: '',
  categoryId: [],
  image: '',
  price: 0,
  stock: 0,
  description: '',
  status: 1
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入商品名称' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类' }
  ],
  image: [
    { required: true, message: '请上传商品图片' }
  ],
  price: [
    { required: true, message: '请输入商品价格' }
  ],
  stock: [
    { required: true, message: '请输入商品库存' }
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
    formData.image = info.file.response.url
    loading.value = false
  }
}

// 规格相关
const specVisible = ref(false)
const specList = ref<SpecItem[]>([
  {
    name: '',
    price: 0,
    stock: 0
  }
])

const addSpec = () => {
  specList.value.push({
    name: '',
    price: 0,
    stock: 0
  })
}

const removeSpec = (item: SpecItem) => {
  const index = specList.value.indexOf(item)
  if (index !== -1) {
    specList.value.splice(index, 1)
  }
}

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
  handleSearch()
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增商品'
  formData.id = undefined
  formData.name = ''
  formData.categoryId = []
  formData.image = ''
  formData.price = 0
  formData.stock = 0
  formData.description = ''
  formData.status = 1
  fileList.value = []
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: ProductInfo) => {
  modalTitle.value = '编辑商品'
  Object.assign(formData, record)
  fileList.value = [
    {
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: record.image
    }
  ]
  modalVisible.value = true
}

// 规格设置
const handleSpec = (record: ProductInfo) => {
  // TODO: 获取商品规格
  specList.value = [
    {
      id: 1,
      name: '默认',
      price: record.price,
      stock: record.stock
    }
  ]
  specVisible.value = true
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

// 导出
const handleExport = () => {
  message.success('导出成功')
}

// 表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
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

// 规格弹窗确认
const handleSpecOk = async () => {
  try {
    // TODO: 调用保存规格API
    message.success('保存成功')
    specVisible.value = false
  } catch (error) {
    message.error('保存失败')
  }
}

// 规格弹窗取消
const handleSpecCancel = () => {
  specVisible.value = false
  specList.value = [
    {
      name: '',
      price: 0,
      stock: 0
    }
  ]
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
        name: '有机蔬菜礼盒',
        categoryId: [1, 2],
        image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        price: 199,
        stock: 100,
        description: '新鲜有机蔬菜礼盒，包含多种时令蔬菜',
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

  .text-danger {
    color: #ff4d4f;
  }

  .dynamic-delete-button {
    color: #ff4d4f;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: #ff7875;
    }
  }
}
</style> 