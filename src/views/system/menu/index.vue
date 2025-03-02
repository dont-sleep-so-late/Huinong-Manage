<template>
  <div class="menu-list">
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
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'icon'">
            <component :is="isValidIcon(text) ? icons[text] : null" />
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getTypeColor(text)">
              {{ getTypeText(text) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="Number(text) === 1 ? 'success' : 'error'">
              {{ Number(text) === 1 ? '显示' : '隐藏' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="() => handleAdd(record)">新增</a>
              <a-divider type="vertical" />
              <a @click="() => handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm
                :title="record.status === 1 ? '确定要隐藏该菜单吗？' : '确定要显示该菜单吗？'"
                @confirm="() => handleToggleStatus(record)"
              >
                <a>{{ record.status === 1 ? '隐藏' : '显示' }}</a>
              </a-popconfirm>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该菜单吗？"
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
          v-if="formData.parentId !== undefined"
          label="上级菜单"
          name="parentId"
        >
          <a-tree-select
            v-model:value="formData.parentId"
            :tree-data="menuTree"
            placeholder="请选择上级菜单"
            :field-names="{
              label: 'name',
              value: 'id'
            }"
            :disabled="!!formData.id"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        <a-form-item label="菜单名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入菜单名称"
          />
        </a-form-item>
        <a-form-item label="权限编码" name="code">
          <a-input
            v-model:value="formData.code"
            placeholder="请输入权限编码"
          />
        </a-form-item>
        <a-form-item label="权限类型" name="type">
          <a-select
            v-model:value="formData.type"
            placeholder="请选择权限类型"
            style="width: 100%"
            :options="typeOptions"
            @change="handleTypeChange"
          />
        </a-form-item>
        <a-form-item label="图标" name="icon">
          <a-select
            v-model:value="formData.icon"
            placeholder="请选择图标"
            style="width: 100%"
            allow-clear
            @change="handleIconChange"
          >
            <a-select-option v-for="option in iconOptions" :key="option.value" :value="option.value">
              <span>
                <component :is="isValidIcon(option.value) ? icons[option.value] : null" />
                <span style="margin-left: 8px">{{ option.label }}</span>
              </span>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="路由地址" name="path">
          <a-input
            v-model:value="formData.path"
            placeholder="请输入路由地址"
          />
        </a-form-item>
        <a-form-item label="组件路径" name="component">
          <a-input
            v-model:value="formData.component"
            placeholder="请输入组件路径"
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
            <a-radio :value="1">显示</a-radio>
            <a-radio :value="0">隐藏</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, h } from 'vue'
import type { TableColumnsType, FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { DefaultOptionType } from 'ant-design-vue/es/select'
import type { SelectProps } from 'ant-design-vue/es/select'
import {
  PlusOutlined,
  HomeOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { DataNode } from 'ant-design-vue/es/tree'
import {
  getPermissionTree,
  createPermission,
  updatePermission,
  deletePermission,
  updatePermissionStatus,
  type PermissionItem,
  type PermissionType
} from '@/api/permission'

// 图标映射
const icons = {
  HomeOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined
} as const

// 类型定义
type PermissionType = 'menu' | 'button' | 'data'
type IconType = keyof typeof icons

// 图标选项
const iconOptions = (Object.keys(icons) as IconType[]).map(key => ({
  label: key,
  value: key
}))

// 权限类型选项
const typeOptions = [
  { label: '菜单', value: 'menu' as const },
  { label: '按钮', value: 'button' as const },
  { label: '数据', value: 'data' as const }
]

interface MenuItem {
  id: number
  parentId: number | null
  name: string
  code: string
  type: PermissionType
  icon: IconType | null
  path: string
  component: string
  sortOrder: number
  status: 0 | 1
  children?: MenuItem[]
}

interface FormState {
  id?: number
  parentId: number | null
  name: string
  code: string
  type: PermissionType
  icon: IconType | null
  path: string
  component: string
  sortOrder: number
  status: 0 | 1
}

// 表单初始值
const initialFormState: FormState = {
  parentId: null,
  name: '',
  code: '',
  type: 'menu',
  icon: null,
  path: '',
  component: '',
  sortOrder: 0,
  status: 1
}

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增菜单')
const formRef = ref<FormInstance>()
const formData = reactive<FormState>({...initialFormState})

// 表单验证规则
const formRules: Record<keyof FormState, Rule[]> = {
  id: [],
  parentId: [
    { required: false, message: '请选择上级菜单' }
  ],
  name: [
    { required: true, message: '请输入菜单名称' }
  ],
  code: [
    { required: true, message: '请输入权限编码' }
  ],
  type: [
    { required: true, message: '请选择权限类型' }
  ],
  path: [
    { required: true, message: '请输入路由地址' }
  ],
  component: [
    { required: false, message: '请输入组件路径' }
  ],
  icon: [
    { required: false }
  ],
  sortOrder: [
    { required: true, message: '请输入排序号', type: 'number' }
  ],
  status: [
    { required: true, message: '请选择状态', type: 'number' }
  ]
}

// 表格列定义
const columns: TableColumnsType<MenuItem> = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    customRender: ({ text }) => {
      return isValidIcon(text) ? h(icons[text]) : null
    }
  },
  {
    title: '权限类型',
    dataIndex: 'type',
    key: 'type',
    customRender: ({ text }) => {
      return h('a-tag', { color: getTypeColor(text) }, () => getTypeText(text))
    }
  },
  {
    title: '权限编码',
    dataIndex: 'code',
    key: 'code'
  },
  {
    title: '路由地址',
    dataIndex: 'path',
    key: 'path'
  },
  {
    title: '组件',
    dataIndex: 'component',
    key: 'component'
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    key: 'sortOrder'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }) => {
      const status = Number(text)
      return h('a-tag', { color: status === 1 ? 'success' : 'error' }, () => status === 1 ? '显示' : '隐藏')
    }
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    customRender: ({ record }) => {
      if (!isMenuItem(record)) return null
      return h('a-space', {}, [
        h('a', { onClick: () => handleAdd(record) }, '新增'),
        h('a-divider', { type: 'vertical' }),
        h('a', { onClick: () => handleEdit(record) }, '编辑'),
        h('a-divider', { type: 'vertical' }),
        h('a-popconfirm', {
          title: record.status === 1 ? '确定要隐藏该菜单吗？' : '确定要显示该菜单吗？',
          onConfirm: () => handleToggleStatus(record)
        }, {
          default: () => h('a', {}, record.status === 1 ? '隐藏' : '显示')
        }),
        h('a-divider', { type: 'vertical' }),
        h('a-popconfirm', {
          title: '确定要删除该菜单吗？',
          onConfirm: () => handleDelete(record)
        }, {
          default: () => h('a', { class: 'text-danger' }, '删除')
        })
      ])
    }
  }
]

// 表格数据
const loading = ref(false)
const tableData = ref<MenuItem[]>([])

// 菜单树数据
const menuTree = ref<MenuItem[]>([])

// 类型检查函数
const isMenuItem = (value: unknown): value is MenuItem => {
  return value !== null && typeof value === 'object' && 'id' in value && 'name' in value && 'type' in value
}

const isValidIcon = (value: unknown): value is IconType => {
  return typeof value === 'string' && value in icons
}

const isValidType = (value: unknown): value is PermissionType => {
  return typeof value === 'string' && ['menu', 'button', 'data'].includes(value)
}

// 辅助函数
const getTypeColor = (type: unknown) => {
  if (!isValidType(type)) return 'default'
  switch (type) {
    case 'menu':
      return 'blue'
    case 'button':
      return 'green'
    case 'data':
      return 'orange'
    default:
      return 'default'
  }
}

const getTypeText = (type: unknown) => {
  if (!isValidType(type)) return '未知类型'
  switch (type) {
    case 'menu':
      return '菜单'
    case 'button':
      return '按钮'
    case 'data':
      return '数据'
    default:
      return type
  }
}

// 处理函数
const handleAdd = (parent?: unknown) => {
  Object.assign(formData, initialFormState)
  if (isMenuItem(parent)) {
    formData.parentId = parent.id
    modalTitle.value = '新增子菜单'
  } else {
    formData.parentId = null
    modalTitle.value = '新增菜单'
  }
  modalVisible.value = true
}

const handleEdit = (record: unknown) => {
  if (!isMenuItem(record)) return
  Object.assign(formData, record)
  modalTitle.value = '编辑菜单'
  modalVisible.value = true
}

const handleToggleStatus = async (record: unknown) => {
  if (!isMenuItem(record)) return
  try {
    await updatePermissionStatus(record.id, record.status === 1 ? 0 : 1)
    message.success('操作成功')
    fetchData()
  } catch (error) {
    console.error('切换状态失败:', error)
    message.error('操作失败')
  }
}

const handleDelete = async (record: unknown) => {
  if (!isMenuItem(record)) return
  try {
    await deletePermission(record.id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

const handleModalOk = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const data = {
      ...formData,
      sortOrder: Number(formData.sortOrder)
    }
    if (data.id) {
      await updatePermission(data.id, data)
      message.success('更新成功')
    } else {
      await createPermission(data)
      message.success('创建成功')
    }
    modalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

// 获取菜单数据
const fetchData = async () => {
  try {
    loading.value = true
    const res = await getPermissionTree()
    if (Array.isArray(res)) {
      const convertedData = res.map(item => ({
        ...item,
        type: item.type || 'menu',
        icon: item.icon && isValidIcon(item.icon) ? item.icon : null,
        status: item.status as 0 | 1
      }))
      tableData.value = convertedData
      menuTree.value = convertedData
    } else {
      message.error('获取数据失败')
    }
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 表单相关类型
type SelectValue = string | number | undefined

const handleTypeChange = (value: string) => {
  if (isValidType(value)) {
    formData.type = value
  }
}

const handleIconChange = (value: string | null) => {
  formData.icon = value && isValidIcon(value) ? value : null
}

// 初始化
fetchData()
</script>

<style lang="less" scoped>
.menu-list {
  .text-danger {
    color: #ff4d4f;
  }
}
</style> 