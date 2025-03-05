<template>
  <div class="category-list">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="分类名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入分类名称"
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
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
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
      <template #extra>
        <a-button type="primary" @click="() => handleAdd()">
          <template #icon><IconProvider name="plus" /></template>
          新增
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'icon'">
            <img v-if="text" :src="text" alt="icon" class="category-icon" />
            <span v-else>-</span>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="text === 1 ? 'success' : 'error'">
              {{ text === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="() => handleAdd(record)">添加子分类</a>
              <a-divider type="vertical" />
              <a @click="() => handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm
                :title="record.status === 1 ? '确定要禁用该分类吗？' : '确定要启用该分类吗？'"
                @confirm="() => handleToggleStatus(record)"
              >
                <a>{{ record.status === 1 ? '禁用' : '启用' }}</a>
              </a-popconfirm>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该分类吗？"
                @confirm="() => handleDelete(record)"
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
        <a-form-item
          v-if="formData.parentId !== 0"
          label="上级分类"
          name="parentId"
        >
          <a-cascader
            v-model:value="parentIdValue"
            :options="categoryOptions"
            placeholder="请选择上级分类"
            :field-names="{
              label: 'name',
              value: 'id',
              children: 'children'
            }"
            :disabled="isEdit"
          />
        </a-form-item>
        <a-form-item label="分类名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入分类名称"
          />
        </a-form-item>
        <a-form-item label="分类图标" name="icon">
          <image-upload
            v-model:value="formData.icon"
            :max-size="2"
            upload-text="上传图标"
            alt="分类图标"
            @change="handleIconUploaded"
          />
        </a-form-item>
        <a-form-item label="Banner图" name="banner">
          <image-upload
            v-model:value="formData.banner"
            :max-size="2"
            upload-text="上传Banner"
            alt="分类Banner"
            @change="handleBannerUploaded"
          />
        </a-form-item>
        <a-form-item label="排序" name="sortOrder">
          <a-input-number
            v-model:value="formData.sortOrder"
            :min="0"
            style="width: 100%"
            placeholder="请输入排序号"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import ImageUpload from '@/components/ImageUpload'
import IconProvider from '@/components/IconProvider.vue'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryDetail,
  getCategoryTree,
  updateCategoryStatus,
  getCategoryPage,
  type Category,
  type CategoryDTO,
  type CategoryQuery
} from '@/api/category'

// 表格列定义
const columns = [
  {
    title: '分类名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon'
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    key: 'sortOrder'
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

// 搜索表单数据
const searchForm = reactive<CategoryQuery>({
  name: '',
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<Category[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 分类选项
const categoryOptions = ref<Category[]>([])

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增分类')
const formRef = ref()
const isEdit = ref(false)
const formData = reactive<Partial<CategoryDTO & { id?: number }>>({
  parentId: 0,
  name: '',
  icon: '',
  banner: '',
  sortOrder: 0,
  status: 1,
  level: 1
})

// 处理Cascader组件的值
const parentIdValue = ref<string[]>([])

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入分类名称' }
  ],
  icon: [
    { required: true, message: '请上传分类图标' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序号' }
  ]
}

// 图标上传成功
const handleIconUploaded = (url: string) => {
  formData.icon = url
}

// Banner上传成功
const handleBannerUploaded = (url: string) => {
  formData.banner = url
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.status = undefined
  handleSearch()
}

// 新增
const handleAdd = (record?: any) => {
  isEdit.value = false
  modalTitle.value = record ? '新增子分类' : '新增分类'
  formData.id = undefined
  formData.parentId = record ? record.id : 0
  formData.level = record ? record.level + 1 : 1
  formData.name = ''
  formData.icon = ''
  formData.banner = ''
  formData.sortOrder = 0
  formData.status = 1
  
  // 设置Cascader的值
  if (record && record.id) {
    parentIdValue.value = [record.id.toString()]
  } else {
    parentIdValue.value = []
  }
  
  modalVisible.value = true
}

// 编辑
const handleEdit = async (record: any) => {
  try {
    isEdit.value = true
    modalTitle.value = '编辑分类'
    const {data} = await getCategoryDetail(record.id)
    formData.id = data.id
    formData.parentId = data.parentId
    formData.level = data.level
    formData.name = data.name
    formData.icon = data.icon || ''
    formData.banner = data.banner || ''
    formData.sortOrder = data.sortOrder
    formData.status = data.status
    
    // 设置Cascader的值
    if (data.parentId && data.parentId !== 0) {
      parentIdValue.value = [data.parentId.toString()]
    } else {
      parentIdValue.value = []
    }
    
    modalVisible.value = true
  } catch (error) {
    console.error('获取分类详情失败:', error)
    message.error('获取分类详情失败')
  }
}

// 切换状态
const handleToggleStatus = async (record: any) => {
  try {
    const newStatus = record.status === 1 ? 0 : 1
    await updateCategoryStatus(record.id, newStatus)
    message.success(record.status === 1 ? '禁用成功' : '启用成功')
    fetchData()
  } catch (error) {
    console.error('更新分类状态失败:', error)
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: any) => {
  try {
    await deleteCategory(record.id)
    message.success('删除成功')
    fetchData()
    fetchCategoryTree()
  } catch (error) {
    console.error('删除分类失败:', error)
    message.error('删除失败')
  }
}

// 弹窗确认
const handleModalOk = () => {
  formRef.value?.validate().then(async () => {
    try {
      // 从Cascader获取parentId
      if (parentIdValue.value && parentIdValue.value.length > 0) {
        formData.parentId = parseInt(parentIdValue.value[parentIdValue.value.length - 1])
      }
      
      if (isEdit.value) {
        const { id, ...updateData } = formData
        await updateCategory(id!, updateData as Partial<CategoryDTO>)
        message.success('更新成功')
      } else {
        await createCategory(formData as CategoryDTO)
        message.success('创建成功')
      }
      modalVisible.value = false
      fetchData()
      fetchCategoryTree()
    } catch (error) {
      console.error('保存分类失败:', error)
      message.error('保存失败')
    }
  })
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
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
    const params: CategoryQuery = {
      pageNum: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      name: searchForm.name,
      status: searchForm.status
    }
    
    const {data} = await getCategoryPage(params)
    
    tableData.value = data.records
    pagination.total = data.total
  } catch (error) {
    console.error('获取分类列表失败:', error)
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 获取分类树
const fetchCategoryTree = async () => {
  try {
    const {data} = await getCategoryTree()
    categoryOptions.value = data
  } catch (error) {
    console.error('获取分类树失败:', error)
    message.error('获取分类树失败')
  }
}

// 初始化
onMounted(() => {
  fetchData()
  fetchCategoryTree()
})
</script>

<style lang="less" scoped>
.category-list {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    :deep(.ant-card-body) {
      padding-top: 0;
    }
  }

  .category-icon {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }

  .text-danger {
    color: #ff4d4f;
  }
}
</style> 