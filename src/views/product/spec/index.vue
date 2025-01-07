<template>
  <div class="spec-list">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="规格名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入规格名称"
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
        <!-- 状态 -->
        <template #status="{ text }">
          <a-tag :color="text === 1 ? 'success' : 'error'">
            {{ text === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm
              :title="record.status === 1 ? '确定要禁用该规格吗？' : '确定要启用该规格吗？'"
              @confirm="handleToggleStatus(record)"
            >
              <a>{{ record.status === 1 ? '禁用' : '启用' }}</a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该规格吗？"
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
        <a-form-item label="规格名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入规格名称"
          />
        </a-form-item>
        <a-form-item label="规格值" name="values">
          <a-form-list
            v-model:value="formData.values"
            :rules="[{ required: true, message: '请输入规格值' }]"
          >
            <template #default="{ fields, add, remove }">
              <div v-for="(field, index) in fields" :key="field.key">
                <a-space align="baseline">
                  <a-form-item
                    :name="[field.name]"
                    :rules="[{ required: true, message: '请输入规格值' }]"
                  >
                    <a-input
                      v-model:value="formData.values![field.name]"
                      placeholder="请输入规格值"
                    />
                  </a-form-item>
                  <minus-circle-outlined
                    v-if="fields.length > 1"
                    class="dynamic-delete-button"
                    @click="() => remove(field.name)"
                  />
                </a-space>
              </div>
              <a-form-item>
                <a-button type="dashed" block @click="() => add()">
                  <plus-outlined />
                  添加规格值
                </a-button>
              </a-form-item>
            </template>
          </a-form-list>
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
  PlusOutlined,
  MinusCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'

interface SpecInfo {
  id: number
  categoryId: number[]
  name: string
  values: string[]
  sort: number
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

// 表格列定义
const columns = [
  {
    title: '规格名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '规格值',
    dataIndex: 'values',
    key: 'values',
    customRender: ({ text }: { text: string[] }) => text.join('、')
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort'
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
const tableData = ref<SpecInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 弹窗相关
const modalVisible = ref(false)
const modalTitle = ref('新增规格')
const formRef = ref()
const formData = reactive<Partial<SpecInfo>>({
  categoryId: [],
  name: '',
  values: [''],
  sort: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  categoryId: [
    { required: true, message: '请选择商品分类' }
  ],
  name: [
    { required: true, message: '请输入规格名称' }
  ],
  values: [
    { required: true, message: '请输入规格值' }
  ],
  sort: [
    { required: true, message: '请输入排序号' }
  ]
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
  modalTitle.value = '新增规格'
  formData.id = undefined
  formData.categoryId = []
  formData.name = ''
  formData.values = ['']
  formData.sort = 0
  formData.status = 1
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: SpecInfo) => {
  modalTitle.value = '编辑规格'
  Object.assign(formData, record)
  modalVisible.value = true
}

// 切换状态
const handleToggleStatus = async (record: SpecInfo) => {
  try {
    // TODO: 调用切换状态API
    message.success(record.status === 1 ? '禁用成功' : '启用成功')
    fetchData()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: SpecInfo) => {
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
        categoryId: [1, 2],
        name: '重量',
        values: ['500g', '1kg', '2kg'],
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
.spec-list {
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