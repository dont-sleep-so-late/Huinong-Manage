<template>
  <div class="banner-manage">
    <!-- 搜索表单 -->
    <a-card class="general-card" :bordered="false">
      <a-form
        ref="searchFormRef"
        :model="searchForm"
        layout="horizontal"
        @submit="handleSearch"
      >
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="轮播图标题" name="title">
              <a-input
                v-model:value="searchForm.title"
                placeholder="请输入轮播图标题"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="状态" name="status">
              <a-select
                v-model:value="searchForm.status"
                placeholder="请选择状态"
                allow-clear
              >
                <a-select-option :value="1">启用</a-select-option>
                <a-select-option :value="0">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-space>
              <a-button type="primary" html-type="submit">搜索</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card class="general-card" :bordered="false">
      <template #title>
        <a-button type="primary" @click="handleAdd">新增轮播图</a-button>
      </template>
      <a-table
        :loading="loading"
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'image'">
            <a-image
              :width="100"
              :src="record.image"
              :preview="true"
            />
          </template>
          <template v-if="column.key === 'status'">
            <a-switch
              :checked="record.status === 1"
              @change="(checked) => handleStatusChange(record.id, checked)"
            />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm
                title="确定要删除这个轮播图吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
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
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item label="标题" name="title">
          <a-input v-model:value="form.title" placeholder="请输入轮播图标题" />
        </a-form-item>
        <a-form-item label="图片" name="image">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :before-upload="beforeUpload"
            @change="handleImageChange"
          >
            <div v-if="fileList.length < 1">
              <plus-outlined />
              <div class="ant-upload-text">上传图片</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="链接" name="url">
          <a-input v-model:value="form.url" placeholder="请输入跳转链接" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number
            v-model:value="form.sort"
            :min="0"
            :max="999"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-switch v-model:checked="form.status" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getBannerList,
  addBanner,
  updateBanner,
  deleteBanner,
  updateBannerStatus,
  type Banner,
  type BannerQuery,
  type BannerForm
} from '@/api/banner'

// 搜索表单
const searchFormRef = ref()
const searchForm = reactive<Partial<BannerQuery>>({
  title: undefined,
  status: undefined
})

// 表格数据
const loading = ref(false)
const dataSource = ref<Banner[]>([])
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '图片',
    dataIndex: 'image',
    key: 'image'
  },
  {
    title: '链接',
    dataIndex: 'url',
    key: 'url'
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

// 表单
const modalVisible = ref(false)
const modalTitle = ref('新增轮播图')
const formRef = ref()
const fileList = ref([])
const form = reactive<BannerForm>({
  title: '',
  image: '',
  url: '',
  sort: 0,
  status: 1
})

const rules = {
  title: [{ required: true, message: '请输入轮播图标题' }],
  image: [{ required: true, message: '请上传轮播图图片' }],
  url: [{ required: true, message: '请输入跳转链接' }],
  sort: [{ required: true, message: '请输入排序号' }]
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: BannerQuery = {
      page: pagination.current!,
      pageSize: pagination.pageSize!,
      ...searchForm
    }
    const res = await getBannerList(params)
    dataSource.value = res.data
    pagination.total = res.total
  } catch (error) {
    console.error('获取轮播图列表失败:', error)
    message.error('获取轮播图列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.current = 1
  fetchData()
}

// 表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增轮播图'
  modalVisible.value = true
  form.title = ''
  form.image = ''
  form.url = ''
  form.sort = 0
  form.status = 1
  fileList.value = []
}

// 编辑
const handleEdit = (record: Banner) => {
  modalTitle.value = '编辑轮播图'
  modalVisible.value = true
  Object.assign(form, record)
  fileList.value = [
    {
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: record.image
    }
  ]
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await deleteBanner(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除轮播图失败:', error)
    message.error('删除轮播图失败')
  }
}

// 状态变更
const handleStatusChange = async (id: number, checked: boolean) => {
  try {
    await updateBannerStatus(id, checked ? 1 : 0)
    message.success('状态更新成功')
    fetchData()
  } catch (error) {
    console.error('更新轮播图状态失败:', error)
    message.error('更新轮播图状态失败')
  }
}

// 图片上传前校验
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片必须小于2MB!')
  }
  return isImage && isLt2M
}

// 图片变更
const handleImageChange = (info: any) => {
  if (info.file.status === 'done') {
    form.image = info.file.response.url
  }
}

// 弹窗确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    if (modalTitle.value === '新增轮播图') {
      await addBanner(form)
      message.success('新增成功')
    } else {
      await updateBanner(form.id, form)
      message.success('更新成功')
    }
    modalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存轮播图失败:', error)
    message.error('保存轮播图失败')
  }
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="less" scoped>
.banner-manage {
  .general-card {
    margin-bottom: 16px;
  }
}
</style> 