<template>
  <div class="category-list">
    <!-- 操作按钮 -->
    <a-card :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><plus-outlined /></template>
          新增
        </a-button>
      </template>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="false"
      >
        <!-- 图标 -->
        <template #icon="{ text }">
          <component :is="text" />
        </template>

        <!-- 状态 -->
        <template #status="{ text }">
          <a-tag :color="text === 1 ? 'success' : 'error'">
            {{ text === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleAdd(record)">新增子分类</a>
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
        <a-form-item
          v-if="formData.parentId !== undefined"
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
            :disabled="!!formData.id"
          />
        </a-form-item>
        <a-form-item label="分类名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入分类名称"
          />
        </a-form-item>
        <a-form-item label="分类图标" name="icon">
          <a-select
            v-model:value="formData.icon"
            placeholder="请选择分类图标"
            style="width: 100%"
          >
            <a-select-option value="ShoppingOutlined">购物图标</a-select-option>
            <a-select-option value="AppstoreOutlined">应用图标</a-select-option>
            <a-select-option value="GiftOutlined">礼物图标</a-select-option>
          </a-select>
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
  PlusOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  GiftOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TableColumnType } from 'ant-design-vue'

interface CategoryInfo {
  id: number
  parentId?: number[]
  name: string
  icon: string
  sort: number
  status: number
  children?: CategoryInfo[]
}

// 表格列定义
const columns: TableColumnType[] = [
  {
    title: '分类名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    slots: { customRender: 'icon' }
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
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' }
  }
]

// 表格数据
const loading = ref(false)
const tableData = ref<CategoryInfo[]>([])

// 分类选项
const categoryOptions = ref<CategoryInfo[]>([])

// 弹窗相关
const modalVisible = ref(false)
const modalTitle = ref('新增分类')
const formRef = ref()
const formData = reactive<Partial<CategoryInfo>>({
  name: '',
  icon: undefined,
  sort: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  parentId: [
    { required: true, message: '请选择上级分类' }
  ],
  name: [
    { required: true, message: '请输入分类名称' }
  ],
  icon: [
    { required: true, message: '请选择分类图标' }
  ],
  sort: [
    { required: true, message: '请输入排序号' }
  ]
}

// 新增
const handleAdd = (record?: CategoryInfo) => {
  modalTitle.value = record ? '新增子分类' : '新增分类'
  formData.id = undefined
  formData.parentId = record ? [record.id] : undefined
  formData.name = ''
  formData.icon = undefined
  formData.sort = 0
  formData.status = 1
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: CategoryInfo) => {
  modalTitle.value = '编辑分类'
  Object.assign(formData, record)
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

// 获取表格数据
const fetchData = async () => {
  loading.value = true
  try {
    // TODO: 调用查询API
    // 模拟数据
    const data = [
      {
        id: 1,
        name: '蔬菜水果',
        icon: 'ShoppingOutlined',
        sort: 1,
        status: 1,
        children: [
          {
            id: 2,
            parentId: [1],
            name: '新鲜蔬菜',
            icon: 'AppstoreOutlined',
            sort: 1,
            status: 1
          },
          {
            id: 3,
            parentId: [1],
            name: '新鲜水果',
            icon: 'GiftOutlined',
            sort: 2,
            status: 1
          }
        ]
      },
      {
        id: 4,
        name: '肉禽蛋品',
        icon: 'ShoppingOutlined',
        sort: 2,
        status: 1,
        children: [
          {
            id: 5,
            parentId: [4],
            name: '猪肉',
            icon: 'AppstoreOutlined',
            sort: 1,
            status: 1
          },
          {
            id: 6,
            parentId: [4],
            name: '牛肉',
            icon: 'GiftOutlined',
            sort: 2,
            status: 1
          }
        ]
      }
    ]
    tableData.value = data
    categoryOptions.value = data
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
  .text-danger {
    color: #ff4d4f;
  }
}
</style> 