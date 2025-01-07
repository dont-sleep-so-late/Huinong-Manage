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
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="1">正常</a-select-option>
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
            {{ text === 1 ? '正常' : '禁用' }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="handlePermission(record)">权限设置</a>
            <a-divider type="vertical" />
            <a-popconfirm
              :title="record.status === 1 ? '确定要禁用该角色吗？' : '确定要启用该角色吗？'"
              @confirm="handleToggleStatus(record)"
            >
              <a>{{ record.status === 1 ? '禁用' : '启用' }}</a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该角色吗？"
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
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            :rows="4"
            placeholder="请输入备注"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限设置弹窗 -->
    <a-modal
      v-model:visible="permissionVisible"
      title="权限设置"
      @ok="handlePermissionOk"
      @cancel="handlePermissionCancel"
    >
      <a-tree
        v-model:checkedKeys="checkedKeys"
        :tree-data="permissionTree"
        checkable
        :defaultExpandAll="true"
      />
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
import type { DataNode } from 'ant-design-vue/es/tree'

interface RoleInfo {
  id: number
  name: string
  code: string
  sort: number
  status: number
  remark: string
  createTime: string
}

interface SearchForm {
  name?: string
  code?: string
  status?: number
  pageNum: number
  pageSize: number
}

// 表格列定义
const columns = [
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
    title: '备注',
    dataIndex: 'remark',
    key: 'remark'
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

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  name: '',
  code: '',
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

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
const formRef = ref()
const formData = reactive<Partial<RoleInfo>>({
  name: '',
  code: '',
  sort: 0,
  status: 1,
  remark: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入角色名称' }
  ],
  code: [
    { required: true, message: '请输入角色编码' },
    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线' }
  ],
  sort: [
    { required: true, message: '请输入排序号' }
  ]
}

// 权限设置弹窗
const permissionVisible = ref(false)
const checkedKeys = ref<string[]>([])
const permissionTree = ref<DataNode[]>([
  {
    title: '系统管理',
    key: 'system',
    children: [
      {
        title: '用户管理',
        key: 'system:user',
        children: [
          {
            title: '查询用户',
            key: 'system:user:list'
          },
          {
            title: '新增用户',
            key: 'system:user:add'
          },
          {
            title: '修改用户',
            key: 'system:user:edit'
          },
          {
            title: '删除用户',
            key: 'system:user:delete'
          }
        ]
      },
      {
        title: '角色管理',
        key: 'system:role',
        children: [
          {
            title: '查询角色',
            key: 'system:role:list'
          },
          {
            title: '新增角色',
            key: 'system:role:add'
          },
          {
            title: '修改角色',
            key: 'system:role:edit'
          },
          {
            title: '删除角色',
            key: 'system:role:delete'
          }
        ]
      }
    ]
  },
  {
    title: '商品管理',
    key: 'product',
    children: [
      {
        title: '商品列表',
        key: 'product:list',
        children: [
          {
            title: '查询商品',
            key: 'product:list:list'
          },
          {
            title: '新增商品',
            key: 'product:list:add'
          },
          {
            title: '修改商品',
            key: 'product:list:edit'
          },
          {
            title: '删除商品',
            key: 'product:list:delete'
          }
        ]
      },
      {
        title: '商品分类',
        key: 'product:category',
        children: [
          {
            title: '查询分类',
            key: 'product:category:list'
          },
          {
            title: '新增分类',
            key: 'product:category:add'
          },
          {
            title: '修改分类',
            key: 'product:category:edit'
          },
          {
            title: '删除分类',
            key: 'product:category:delete'
          }
        ]
      }
    ]
  },
  {
    title: '订单管理',
    key: 'order',
    children: [
      {
        title: '订单列表',
        key: 'order:list',
        children: [
          {
            title: '查询订单',
            key: 'order:list:list'
          },
          {
            title: '订单发货',
            key: 'order:list:delivery'
          }
        ]
      },
      {
        title: '售后管理',
        key: 'order:after-sale',
        children: [
          {
            title: '查询售后',
            key: 'order:after-sale:list'
          },
          {
            title: '处理售后',
            key: 'order:after-sale:process'
          }
        ]
      }
    ]
  }
])

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
  formData.sort = 0
  formData.status = 1
  formData.remark = ''
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: RoleInfo) => {
  modalTitle.value = '编辑角色'
  Object.assign(formData, record)
  modalVisible.value = true
}

// 权限设置
const handlePermission = (record: RoleInfo) => {
  // TODO: 获取角色权限
  checkedKeys.value = ['system:user:list', 'system:role:list']
  permissionVisible.value = true
}

// 切换状态
const handleToggleStatus = async (record: RoleInfo) => {
  try {
    // TODO: 调用切换状态API
    message.success(record.status === 1 ? '禁用成功' : '启用成功')
    fetchData()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: RoleInfo) => {
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

// 权限设置确认
const handlePermissionOk = async () => {
  try {
    // TODO: 调用保存权限API
    message.success('保存成功')
    permissionVisible.value = false
  } catch (error) {
    message.error('保存失败')
  }
}

// 权限设置取消
const handlePermissionCancel = () => {
  permissionVisible.value = false
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
        name: '管理员',
        code: 'ADMIN',
        sort: 1,
        status: 1,
        remark: '系统管理员，拥有所有权限',
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