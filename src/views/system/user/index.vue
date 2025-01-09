<template>
  <div class="user-list">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="用户名">
          <a-input
            v-model:value="searchForm.username"
            placeholder="请输入用户名"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input
            v-model:value="searchForm.phone"
            placeholder="请输入手机号"
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
        <a-form-item label="注册时间">
          <a-range-picker
            v-model:value="searchForm.createTime"
            :show-time="{ format: 'HH:mm:ss' }"
            format="YYYY-MM-DD HH:mm:ss"
          />
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

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="text" />
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="text === 1 ? 'success' : 'error'">
              {{ text === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a @click="handlePassword(record)">重置密码</a>
              <a-divider type="vertical" />
              <a-popconfirm
                :title="record.status === 1 ? '确定要禁用该用户吗？' : '确定要启用该用户吗？'"
                @confirm="handleToggleStatus(record)"
              >
                <a>{{ record.status === 1 ? '禁用' : '启用' }}</a>
              </a-popconfirm>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该用户吗？"
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
        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="formData.username"
            placeholder="请输入用户名"
            :disabled="!!formData.id"
          />
        </a-form-item>
        <a-form-item
          v-if="!formData.id"
          label="密码"
          name="password"
        >
          <a-input-password
            v-model:value="formData.password"
            placeholder="请输入密码"
          />
        </a-form-item>
        <a-form-item label="昵称" name="nickname">
          <a-input
            v-model:value="formData.nickname"
            placeholder="请输入昵称"
          />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input
            v-model:value="formData.phone"
            placeholder="请输入手机号"
          />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input
            v-model:value="formData.email"
            placeholder="请输入邮箱"
          />
        </a-form-item>
        <a-form-item label="头像" name="avatar">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="formData.avatar" :src="formData.avatar" alt="头像" style="width: 100%" />
            <div v-else>
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重置密码弹窗 -->
    <a-modal
      v-model:open="passwordVisible"
      title="重置密码"
      @ok="handlePasswordOk"
      @cancel="handlePasswordCancel"
    >
      <a-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="新密码" name="password">
          <a-input-password
            v-model:value="passwordForm.password"
            placeholder="请输入新密码"
          />
        </a-form-item>
        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password
            v-model:value="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
          />
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
  ExportOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { UploadChangeParam } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'

interface UserInfo {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  avatar: string
  status: number
  createTime: string
}

interface SearchForm {
  username?: string
  phone?: string
  status?: number
  createTime?: [Dayjs, Dayjs]
  pageNum: number
  pageSize: number
}

interface PasswordForm {
  password: string
  confirmPassword: string
}

// 表格列定义
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    slots: { customRender: 'avatar' }
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname'
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' }
  },
  {
    title: '注册时间',
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
  username: '',
  phone: '',
  status: undefined,
  createTime: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<UserInfo[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true
})

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增用户')
const formRef = ref()
const formData = reactive<Partial<UserInfo> & { password?: string }>({
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: '',
  avatar: '',
  status: 1
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名' }
  ],
  password: [
    { required: true, message: '请输入密码' }
  ],
  nickname: [
    { required: true, message: '请输入昵称' }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱' }
  ],
  avatar: [
    { required: true, message: '请上传头像' }
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
    formData.avatar = info.file.response.url
    loading.value = false
  }
}

// 重置密码弹窗
const passwordVisible = ref(false)
const passwordFormRef = ref()
const passwordForm = reactive<PasswordForm>({
  password: '',
  confirmPassword: ''
})

// 重置密码表单验证规则
const passwordRules = {
  password: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度不能小于6位' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码' },
    {
      validator: async (rule: any, value: string) => {
        if (value && value !== passwordForm.password) {
          throw new Error('两次输入的密码不一致')
        }
      }
    }
  ]
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.status = undefined
  searchForm.createTime = undefined
  handleSearch()
}

// 导出
const handleExport = () => {
  message.success('导出成功')
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增用户'
  formData.id = undefined
  formData.username = ''
  formData.password = ''
  formData.nickname = ''
  formData.phone = ''
  formData.email = ''
  formData.avatar = ''
  formData.status = 1
  fileList.value = []
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: UserInfo) => {
  modalTitle.value = '编辑用户'
  Object.assign(formData, record)
  fileList.value = [
    {
      uid: '-1',
      name: 'avatar.png',
      status: 'done',
      url: record.avatar
    }
  ]
  modalVisible.value = true
}

// 重置密码
const handlePassword = (record: UserInfo) => {
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  passwordVisible.value = true
}

// 切换状态
const handleToggleStatus = async (record: UserInfo) => {
  try {
    // TODO: 调用切换状态API
    message.success(record.status === 1 ? '禁用成功' : '启用成功')
    fetchData()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: UserInfo) => {
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

// 重置密码确认
const handlePasswordOk = () => {
  passwordFormRef.value?.validate().then(async () => {
    try {
      // TODO: 调用重置密码API
      message.success('重置密码成功')
      passwordVisible.value = false
    } catch (error) {
      message.error('重置密码失败')
    }
  })
}

// 重置密码取消
const handlePasswordCancel = () => {
  passwordVisible.value = false
  passwordFormRef.value?.resetFields()
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
        username: 'admin',
        nickname: '管理员',
        phone: '13800138000',
        email: 'admin@example.com',
        avatar: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
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
.user-list {
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