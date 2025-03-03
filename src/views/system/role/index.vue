<template>
  <div class="role-list">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="角色名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入角色名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="角色编码">
          <a-input
            v-model:value="searchForm.code"
            placeholder="请输入角色编码"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            :value="searchForm.status"
            placeholder="请选择状态"
            style="width: 120px"
            allow-clear
            :options="statusOptions"
            @change="handleStatusChange"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><SearchOutlined /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><RedoOutlined /></template>
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
          <template #icon><PlusOutlined /></template>
          新增
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="Number(text) === 1 ? 'success' : 'error'">
              {{ Number(text) === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="() => handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a @click="() => handlePermission(record)">权限设置</a>
              <a-divider type="vertical" />
              <a-popconfirm
                :title="record.status === 1 ? '确定要禁用该角色吗？' : '确定要启用该角色吗？'"
                @confirm="() => handleToggleStatus(record)"
              >
                <a>{{ record.status === 1 ? '禁用' : '启用' }}</a>
              </a-popconfirm>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该角色吗？"
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
        <a-form-item label="角色名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入角色名称"
          />
        </a-form-item>
        <a-form-item label="角色编码" name="code">
          <a-input
            v-model:value="formData.code"
            placeholder="请输入角色编码"
            :disabled="!!formData.id"
          />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            :rows="4"
            placeholder="请输入角色描述"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限设置弹窗 -->
    <a-modal
      v-model:open="permissionVisible"
      title="权限设置"
      @ok="handlePermissionOk"
      @cancel="handlePermissionCancel"
    >
      <a-tree
        v-model:checked-keys="checkedKeys"
        :tree-data="treeData"
        checkable
        :default-expand-all="true"
        :field-names="{
          key: 'key',
          title: 'title',
          children: 'children'
        }"
      />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import {
  SearchOutlined,
  RedoOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { DataNode } from 'ant-design-vue/es/tree'
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { SelectValue } from 'ant-design-vue/es/select'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
  updateRolePermissions,
  getRolePermissionTree,
  type RoleInfo,
  type RoleQuery,
  type PermissionNode
} from '@/api/role'

// 表格列定义
const columns: ColumnsType<RoleInfo> = [
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '角色编码',
    dataIndex: 'code',
    key: 'code'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
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

// 状态选项
const statusOptions = [
  { value: 1, label: '正常' },
  { value: 0, label: '禁用' }
]

// 搜索表单数据
const searchForm = reactive<RoleQuery>({
  name: '',
  code: '',
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

// 处理状态选择
const handleStatusChange = (value: SelectValue) => {
  searchForm.status = value === undefined ? undefined : (Number(value) as 0 | 1)
}

// 表格数据
const loading = ref(false)
const tableData = ref<RoleInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增角色')
const formRef = ref<FormInstance>()

interface RoleForm {
  id?: number
  name: string
  code: string
  description: string
  status: 0 | 1
}

const formData = reactive<RoleForm>({
  name: '',
  code: '',
  description: '',
  status: 1
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入角色名称' }
  ],
  code: [
    { required: true, message: '请输入角色编码' },
    { pattern: /^[a-z_]+$/, message: '角色编码只能包含小写字母和下划线' }
  ],
  description: [
    { required: true, message: '请输入角色描述' }
  ]
}

// 权限设置弹窗
const permissionVisible = ref(false)
const checkedKeys = ref<number[]>([])
const currentRoleId = ref<number>()
const permissionTree = ref<PermissionNode[]>([])

// 将权限树数据转换为 ant-design-vue 的树形结构
const convertToTreeData = (nodes: PermissionNode[]): DataNode[] => {
  return nodes.map(node => ({
    key: node.id,
    title: node.name,
    children: node.children ? convertToTreeData(node.children) : undefined
  }))
}

// 将权限树数据转换为 ant-design-vue 的树形结构
const treeData = computed(() => convertToTreeData(permissionTree.value))

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.status = undefined
  handleSearch()
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增角色'
  formData.id = undefined
  formData.name = ''
  formData.code = ''
  formData.description = ''
  formData.status = 1
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: RoleInfo) => {
  modalTitle.value = '编辑角色'
  formData.id = record.id
  formData.name = record.name
  formData.code = record.code
  formData.description = record.description
  formData.status = record.status
  modalVisible.value = true
}

// 权限设置
const handlePermission = async (record: RoleInfo) => {
  currentRoleId.value = record.id
  try {
    const data = await getRolePermissionTree(record.id)
    permissionTree.value = data.permissionTree
    checkedKeys.value =  data.checkedKeys.map(Number)
    permissionVisible.value = true
  } catch (error) {
    message.error('获取权限数据失败')
  }
}

// 切换状态
const handleToggleStatus = async (record: RoleInfo) => {
  try {
    await updateRoleStatus(record.id, record.status === 1 ? 0 : 1)
    message.success(record.status === 1 ? '禁用成功' : '启用成功')
    fetchData()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: RoleInfo) => {
  try {
    await deleteRole(record.id)
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
      const { id, name, code, description } = formData
      if (id) {
        await updateRole(id, { name, code, description })
      } else {
        await createRole({ name, code, description })
      }
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

// 权限设置确认
const handlePermissionOk = async () => {
  try {
    if (!currentRoleId.value) return
    await updateRolePermissions(
      currentRoleId.value,
      checkedKeys.value.map(key => Number(key))
    )
    message.success('保存成功')
    permissionVisible.value = false
  } catch (error) {
    message.error('保存失败')
  }
}

// 权限设置取消
const handlePermissionCancel = () => {
  permissionVisible.value = false
  currentRoleId.value = undefined
  checkedKeys.value = []
}

// 表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  searchForm.pageNum = pag.current ?? 1
  searchForm.pageSize = pag.pageSize ?? 10
  fetchData()
}

// 获取表格数据
const fetchData = async () => {
  loading.value = true
  try {
    const data = await getRoleList(searchForm)
    tableData.value = data.records
    pagination.total = data.total
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
.role-list {
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
}
</style> 