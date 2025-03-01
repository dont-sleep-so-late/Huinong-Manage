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
        <a-space>
          <a-button type="primary" @click="handleAdd">新增轮播图</a-button>
          <a-button @click="handleRefresh">刷新</a-button>
        </a-space>
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
          <template v-if="column.key === 'sort'">
            <a-input-number
              v-model:value="record.sort"
              :min="0"
              :max="999"
              @change="(value) => handleSortChange(record.id, value)"
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
              <a-button type="link" @click="handleView(record)">查看</a-button>
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
      :confirm-loading="modalLoading"
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
          <a-input
            v-model:value="form.title"
            placeholder="请输入轮播图标题"
            :maxLength="50"
            show-count
          />
        </a-form-item>
        <a-form-item label="图片" name="image">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :action="`${uploadUrl}/upload`"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            @change="handleImageChange"
          >
            <div v-if="fileList.length < 1">
              <plus-outlined />
              <div class="ant-upload-text">上传图片</div>
            </div>
          </a-upload>
          <div class="upload-tip">建议尺寸：750x350px，大小不超过2MB</div>
        </a-form-item>
        <a-form-item label="链接" name="url">
          <a-input
            v-model:value="form.url"
            placeholder="请输入跳转链接"
            :maxLength="255"
            show-count
          />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number
            v-model:value="form.sort"
            :min="0"
            :max="999"
            style="width: 100%"
          />
          <div class="form-tip">数字越小越靠前，取值范围：0-999</div>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-switch v-model:checked="form.status" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      title="轮播图详情"
      @cancel="detailVisible = false"
    >
      <a-descriptions :column="1">
        <a-descriptions-item label="ID">{{ detail.id }}</a-descriptions-item>
        <a-descriptions-item label="标题">{{ detail.title }}</a-descriptions-item>
        <a-descriptions-item label="图片">
          <a-image :width="200" :src="detail.image" />
        </a-descriptions-item>
        <a-descriptions-item label="链接">{{ detail.url }}</a-descriptions-item>
        <a-descriptions-item label="排序">{{ detail.sort }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          {{ detail.status === 1 ? '启用' : '禁用' }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ detail.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="更新时间">
          {{ detail.updateTime }}
        </a-descriptions-item>
      </a-descriptions>
      <template #footer>
        <a-button type="primary" @click="detailVisible = false">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getBannerList,
  getBannerDetail,
  addBanner,
  updateBanner,
  deleteBanner,
  updateBannerStatus,
  updateBannerSort,
  type Banner,
  type BannerQuery,
  type BannerForm
} from '@/api/banner'

// 上传相关
const uploadUrl = import.meta.env.VITE_UPLOAD_URL
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

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
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 200,
    ellipsis: true
  },
  {
    title: '图片',
    dataIndex: 'image',
    key: 'image',
    width: 120
  },
  {
    title: '链接',
    dataIndex: 'url',
    key: 'url',
    width: 200,
    ellipsis: true
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 表单
const modalVisible = ref(false)
const modalLoading = ref(false)
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
  title: [
    { required: true, message: '请输入轮播图标题' },
    { max: 50, message: '标题最多50个字符' }
  ],
  image: [{ required: true, message: '请上传轮播图图片' }],
  url: [
    { required: true, message: '请输入跳转链接' },
    { max: 255, message: '链接最多255个字符' }
  ],
  sort: [{ required: true, message: '请输入排序号' }]
}

// 详情
const detailVisible = ref(false)
const detail = ref<Banner>({} as Banner)

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

// 刷新
const handleRefresh = () => {
  fetchData()
}

// 表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

// 查看详情
const handleView = async (record: Banner) => {
  try {
    const res = await getBannerDetail(record.id)
    detail.value = res
    detailVisible.value = true
  } catch (error) {
    console.error('获取轮播图详情失败:', error)
    message.error('获取轮播图详情失败')
  }
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
const handleEdit = async (record: Banner) => {
  try {
    const res = await getBannerDetail(record.id)
    modalTitle.value = '编辑轮播图'
    modalVisible.value = true
    Object.assign(form, res)
    fileList.value = [
      {
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: res.image
      }
    ]
  } catch (error) {
    console.error('获取轮播图详情失败:', error)
    message.error('获取轮播图详情失败')
  }
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await deleteBanner(id)
    message.success('删除成功')
    if (dataSource.value.length === 1 && pagination.current! > 1) {
      pagination.current--
    }
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

// 排序变更
const handleSortChange = async (id: number, value: number) => {
  try {
    await updateBannerSort(id, value)
    message.success('排序更新成功')
    fetchData()
  } catch (error) {
    console.error('更新轮播图排序失败:', error)
    message.error('更新轮播图排序失败')
  }
}

// 图片上传前校验
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片必须小于2MB!')
    return false
  }
  return true
}

// 图片变更
const handleImageChange = (info: any) => {
  if (info.file.status === 'done') {
    form.image = info.file.response.url
    message.success('图片上传成功')
  } else if (info.file.status === 'error') {
    message.error('图片上传失败')
  }
}

// 弹窗确认
const handleModalOk = async () => {
  try {
    modalLoading.value = true
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
  } finally {
    modalLoading.value = false
  }
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
  fileList.value = []
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

  .upload-tip {
    color: #999;
    font-size: 12px;
    margin-top: 4px;
  }

  .form-tip {
    color: #999;
    font-size: 12px;
    margin-top: 4px;
  }
}
</style> 