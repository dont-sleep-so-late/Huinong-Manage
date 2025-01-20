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
        <a-button type="primary" @click="handleAdd">
          <template #icon><plus-outlined /></template>
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
            <img :src="text" alt="icon" class="category-icon" />
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="text === 1 ? 'success' : 'error'">
              {{ text === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleAdd(record)">添加子分类</a>
              <a-divider type="vertical" />
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm
                :title="record.status === 1 ? '确定要禁用该分类吗？' : '确定要启用该分类吗？'"
                @confirm="handleToggleStatus(record)"
              >
                <a>{{ record.status === 1 ? '禁用' : '启用' }}</a>
              </a-popconfirm>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该分类吗？"
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
            v-model:value="formData.parentId"
            :options="categoryOptions"
            placeholder="请选择上级分类"
            :field-names="{
              label: 'name',
              value: 'id',
              children: 'children'
            }"
          />
        </a-form-item>
        <a-form-item label="分类名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入分类名称"
          />
        </a-form-item>
        <a-form-item label="分类图标" name="icon">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="formData.icon" :src="formData.icon" alt="icon" class="upload-icon" />
            <div v-else>
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
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
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
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
  PlusOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { UploadChangeParam } from 'ant-design-vue'

interface CategoryInfo {
  id: number
  parentId: number
  name: string
  icon: string
  sort: number
  status: number
  createTime: string
  children?: CategoryInfo[]
}

interface SearchForm {
  name?: string
  status?: number
  pageNum: number
  pageSize: number
}

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

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  name: '',
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<CategoryInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 分类选项
const categoryOptions = ref<CategoryInfo[]>([])

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增分类')
const formRef = ref()
const formData = reactive<Partial<CategoryInfo>>({
  parentId: 0,
  name: '',
  icon: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入分类名称' }
  ],
  icon: [
    { required: true, message: '请上传分类图标' }
  ],
  sort: [
    { required: true, message: '请输入排序号' }
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
    formData.icon = info.file.response.url
    loading.value = false
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
  searchForm.status = undefined
  handleSearch()
}

// 新增
const handleAdd = (record?: CategoryInfo) => {
  modalTitle.value = record ? '新增子分类' : '新增分类'
  formData.id = undefined
  formData.parentId = record ? record.id : 0
  formData.name = ''
  formData.icon = ''
  formData.sort = 0
  formData.status = 1
  fileList.value = []
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: CategoryInfo) => {
  modalTitle.value = '编辑分类'
  Object.assign(formData, record)
  fileList.value = [
    {
      uid: '-1',
      name: 'icon.png',
      status: 'done',
      url: record.icon
    }
  ]
  modalVisible.value = true
}

// 切换状态
const handleToggleStatus = async (record: CategoryInfo) => {
  try {
    // TODO: 调用切换状态API
    message.success(record.status === 1 ? '禁用成功' : '启用成功')
    fetchData()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: CategoryInfo) => {
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
        parentId: 0,
        name: '蔬菜水果',
        icon: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        sort: 1,
        status: 1,
        createTime: '2024-01-01 00:00:00',
        children: [
          {
            id: 2,
            parentId: 1,
            name: '新鲜蔬菜',
            icon: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            sort: 1,
            status: 1,
            createTime: '2024-01-01 00:00:00'
          }
        ]
      }
    ]
    pagination.total = 1
    
    // 更新分类选项
    categoryOptions.value = tableData.value
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

  .upload-icon {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .text-danger {
    color: #ff4d4f;
  }
}
</style> 