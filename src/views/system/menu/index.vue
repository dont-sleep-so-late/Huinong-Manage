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
        <!-- 图标 -->
        <template #icon="{ text }">
          <component :is="text" />
        </template>

        <!-- 菜单类型 -->
        <template #type="{ text }">
          <a-tag :color="getTypeColor(text)">
            {{ getTypeText(text) }}
          </a-tag>
        </template>

        <!-- 状态 -->
        <template #status="{ text }">
          <a-tag :color="text === 1 ? 'success' : 'error'">
            {{ text === 1 ? '显示' : '隐藏' }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleAdd(record)">新增</a>
            <a-divider type="vertical" />
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm
              :title="record.status === 1 ? '确定要隐藏该菜单吗？' : '确定要显示该菜单吗？'"
              @confirm="handleToggleStatus(record)"
            >
              <a>{{ record.status === 1 ? '隐藏' : '显示' }}</a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该菜单吗？"
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
          label="上级菜单"
          name="parentId"
        >
          <a-tree-select
            v-model:value="formData.parentId"
            :tree-data="menuTree"
            placeholder="请选择上级菜单"
            :field-names="{
              label: 'title',
              value: 'key',
              children: 'children'
            }"
            :disabled="!!formData.id"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        <a-form-item label="菜单类型" name="type">
          <a-radio-group v-model:value="formData.type">
            <a-radio :value="1">目录</a-radio>
            <a-radio :value="2">菜单</a-radio>
            <a-radio :value="3">按钮</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="菜单名称" name="title">
          <a-input
            v-model:value="formData.title"
            placeholder="请输入菜单名称"
          />
        </a-form-item>
        <template v-if="formData.type !== 3">
          <a-form-item label="图标" name="icon">
            <a-select
              v-model:value="formData.icon"
              placeholder="请选择图标"
              style="width: 100%"
            >
              <a-select-option value="HomeOutlined">首页图标</a-select-option>
              <a-select-option value="ShoppingOutlined">购物图标</a-select-option>
              <a-select-option value="OrderedListOutlined">订单图标</a-select-option>
              <a-select-option value="UserOutlined">用户图标</a-select-option>
              <a-select-option value="TeamOutlined">团队图标</a-select-option>
              <a-select-option value="SettingOutlined">设置图标</a-select-option>
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
        </template>
        <a-form-item label="权限标识" name="permission" v-if="formData.type === 3">
          <a-input
            v-model:value="formData.permission"
            placeholder="请输入权限标识"
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
            <a-radio :value="1">显示</a-radio>
            <a-radio :value="0">隐藏</a-radio>
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
  HomeOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { DataNode } from 'ant-design-vue/es/tree'

interface MenuItem {
  id: number
  parentId?: number
  type: number
  title: string
  icon?: string
  path?: string
  component?: string
  permission?: string
  sort: number
  status: number
  children?: MenuItem[]
}

// 表格列定义
const columns = [
  {
    title: '菜单名称',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    slots: { customRender: 'icon' }
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    slots: { customRender: 'type' }
  },
  {
    title: '路由地址',
    dataIndex: 'path',
    key: 'path'
  },
  {
    title: '权限标识',
    dataIndex: 'permission',
    key: 'permission'
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
const tableData = ref<MenuItem[]>([])

// 菜单树数据
const menuTree = ref<DataNode[]>([])

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增菜单')
const formRef = ref()
const formData = reactive<Partial<MenuItem>>({
  type: 1,
  title: '',
  icon: undefined,
  path: '',
  component: '',
  permission: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  parentId: [
    { required: true, message: '请选择上级菜单' }
  ],
  type: [
    { required: true, message: '请选择菜单类型' }
  ],
  title: [
    { required: true, message: '请输入菜单名称' }
  ],
  icon: [
    { required: true, message: '请选择图标' }
  ],
  path: [
    { required: true, message: '请输入路由地址' }
  ],
  component: [
    { required: true, message: '请输入组件路径' }
  ],
  permission: [
    { required: true, message: '请输入权限标识' }
  ],
  sort: [
    { required: true, message: '请输入排序号' }
  ]
}

// 获取类型文本
const getTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '目录'
    case 2:
      return '菜单'
    case 3:
      return '按钮'
    default:
      return '未知类型'
  }
}

// 获取类型颜色
const getTypeColor = (type: number) => {
  switch (type) {
    case 1:
      return 'blue'
    case 2:
      return 'green'
    case 3:
      return 'purple'
    default:
      return ''
  }
}

// 新增
const handleAdd = (record?: MenuItem) => {
  modalTitle.value = record ? '新增子菜单' : '新增菜单'
  formData.id = undefined
  formData.parentId = record ? record.id : undefined
  formData.type = 1
  formData.title = ''
  formData.icon = undefined
  formData.path = ''
  formData.component = ''
  formData.permission = ''
  formData.sort = 0
  formData.status = 1
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: MenuItem) => {
  modalTitle.value = '编辑菜单'
  Object.assign(formData, record)
  modalVisible.value = true
}

// 切换状态
const handleToggleStatus = async (record: MenuItem) => {
  try {
    // TODO: 调用切换状态API
    message.success(record.status === 1 ? '隐藏成功' : '显示成功')
    fetchData()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: MenuItem) => {
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

// 转换菜单树数据
const convertMenuTree = (menus: MenuItem[]): DataNode[] => {
  return menus.map(menu => ({
    title: menu.title,
    key: menu.id,
    children: menu.children ? convertMenuTree(menu.children) : undefined
  }))
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
        type: 1,
        title: '系统管理',
        icon: 'SettingOutlined',
        path: '/system',
        sort: 1,
        status: 1,
        children: [
          {
            id: 2,
            parentId: 1,
            type: 2,
            title: '用户管理',
            icon: 'UserOutlined',
            path: '/system/user',
            component: '/system/user/index',
            sort: 1,
            status: 1,
            children: [
              {
                id: 3,
                parentId: 2,
                type: 3,
                title: '查询用户',
                permission: 'system:user:list',
                sort: 1,
                status: 1
              },
              {
                id: 4,
                parentId: 2,
                type: 3,
                title: '新增用户',
                permission: 'system:user:add',
                sort: 2,
                status: 1
              }
            ]
          }
        ]
      }
    ]
    tableData.value = data
    menuTree.value = convertMenuTree(data)
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
.menu-list {
  .text-danger {
    color: #ff4d4f;
  }
}
</style> 