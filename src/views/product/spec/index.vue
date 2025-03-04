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
            :value="searchForm.categoryId"
            :options="categories"
            placeholder="请选择商品分类"
            :field-names="{
              label: 'name',
              value: 'id',
              children: 'children'
            }"
            @change="value => searchForm.categoryId = value"
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
              <template #icon><IconProvider name="search" /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><IconProvider name="redo" /></template>
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
          <template #icon><IconProvider name="plus" /></template>
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
          <template v-if="column.key === 'attributes'">
            <a-tag v-for="attr in record.attributes || []" :key="attr.id" color="blue" style="margin-bottom: 4px">
              {{ attr.name }}
            </a-tag>
            <span v-if="!record.attributes || record.attributes.length === 0">-</span>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="text === 1 ? 'success' : 'error'">
              {{ text === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleViewDetail(record)">查看</a>
              <a-divider type="vertical" />
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm
                :title="record.status === 1 ? '确定要禁用该规格模板吗？' : '确定要启用该规格模板吗？'"
                @confirm="handleToggleStatus(record)"
              >
                <a>{{ record.status === 1 ? '禁用' : '启用' }}</a>
              </a-popconfirm>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除该规格模板吗？"
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
        <a-form-item label="商品分类" name="categoryId">
          <a-cascader
            :value="formData.categoryId"
            :options="categories"
            placeholder="请选择商品分类"
            :field-names="{
              label: 'name',
              value: 'id',
              children: 'children'
            }"
            @change="value => formData.categoryId = value"
          />
        </a-form-item>
        <a-form-item label="规格模板名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入规格模板名称"
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

    <!-- 规格详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="规格模板详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="模板名称">{{ detailData.name }}</a-descriptions-item>
        <a-descriptions-item label="所属分类">{{ detailData.categoryName }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="detailData.status === 1 ? 'success' : 'error'">
            {{ detailData.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detailData.createdTime }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ detailData.updatedTime }}</a-descriptions-item>
      </a-descriptions>

      <div class="attribute-section">
        <div class="attribute-header">
          <h3>规格属性</h3>
          <a-button type="primary" size="small" @click="handleAddAttribute">
            <template #icon><IconProvider name="plus" /></template>
            添加属性
          </a-button>
        </div>
        
        <a-table
          :columns="attributeColumns"
          :data-source="detailData.attributes || []"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'inputType'">
              {{ getInputTypeText(text) }}
            </template>
            
            <template v-else-if="column.key === 'isRequired'">
              {{ text === 1 ? '是' : '否' }}
            </template>
            
            <template v-else-if="column.key === 'status'">
              <a-tag :color="text === 1 ? 'success' : 'error'">
                {{ text === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
            
            <template v-else-if="column.key === 'values'">
              <a-tag v-for="value in record.values" :key="value.id" color="green" style="margin-bottom: 4px">
                {{ value.value }}
              </a-tag>
              <a @click="handleManageValues(record)" style="margin-left: 8px">
                <IconProvider name="edit" />
              </a>
            </template>
            
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a @click="handleEditAttribute(record)">编辑</a>
                <a-divider type="vertical" />
                <a-popconfirm
                  title="确定要删除该规格属性吗？"
                  @confirm="handleDeleteAttribute(record)"
                >
                  <a class="text-danger">删除</a>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>

    <!-- 属性新增/编辑弹窗 -->
    <a-modal
      v-model:open="attributeModalVisible"
      :title="attributeModalTitle"
      @ok="handleAttributeModalOk"
      @cancel="handleAttributeModalCancel"
    >
      <a-form
        ref="attributeFormRef"
        :model="attributeFormData"
        :rules="attributeFormRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="属性名称" name="name">
          <a-input
            v-model:value="attributeFormData.name"
            placeholder="请输入属性名称"
          />
        </a-form-item>
        <a-form-item label="输入类型" name="inputType">
          <a-select
            v-model:value="attributeFormData.inputType"
            placeholder="请选择输入类型"
          >
            <a-select-option value="text">文本框</a-select-option>
            <a-select-option value="select">下拉选择</a-select-option>
            <a-select-option value="radio">单选框</a-select-option>
            <a-select-option value="checkbox">复选框</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序" name="sortOrder">
          <a-input-number
            v-model:value="attributeFormData.sortOrder"
            :min="0"
            style="width: 100%"
            placeholder="请输入排序号"
          />
        </a-form-item>
        <a-form-item label="是否必填" name="isRequired">
          <a-radio-group v-model:value="attributeFormData.isRequired">
            <a-radio :value="1">是</a-radio>
            <a-radio :value="0">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="attributeFormData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 属性值管理弹窗 -->
    <a-modal
      v-model:open="valuesModalVisible"
      title="管理属性值"
      @ok="handleValuesModalOk"
      @cancel="handleValuesModalCancel"
    >
      <a-form>
        <template v-for="(value, index) in attributeValues" :key="index">
          <a-form-item
            :label="index === 0 ? '属性值' : ''"
            :colon="index === 0"
            :label-col="index === 0 ? { span: 4 } : { span: 0 }"
            :wrapper-col="index === 0 ? { span: 18 } : { span: 18, offset: 4 }"
          >
            <a-space>
              <a-input
                v-model:value="attributeValues[index]"
                placeholder="请输入属性值"
              />
              <a-button
                v-if="attributeValues.length > 1"
                type="link"
                danger
                @click="() => attributeValues.splice(index, 1)"
              >
                <template #icon><IconProvider name="minus-circle" /></template>
              </a-button>
            </a-space>
          </a-form-item>
        </template>
        <a-form-item :wrapper-col="{ span: 18, offset: 4 }">
          <a-button type="dashed" block @click="() => attributeValues.push('')">
            <template #icon><IconProvider name="plus" /></template>
            添加属性值
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { CascaderProps } from 'ant-design-vue'
import IconProvider from '@/components/IconProvider.vue'
import { getCategories } from '@/api/product'
import {
  getSpecTemplatePage,
  getSpecTemplateDetail,
  createSpecTemplate,
  updateSpecTemplate,
  deleteSpecTemplate,
  updateSpecTemplateStatus,
  createSpecAttribute,
  updateSpecAttribute,
  deleteSpecAttribute,
  getSpecAttributeValueList,
  createSpecAttributeValue,
  updateSpecAttributeValue,
  deleteSpecAttributeValue,
  type SpecTemplate,
  type SpecAttribute,
  type SpecAttributeValue,
  type SpecTemplateDTO,
  type SpecAttributeDTO,
  type SpecAttributeValueDTO,
  type SpecTemplateQuery
} from '@/api/spec'

// 表格列定义
const columns = [
  {
    title: '模板名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '所属分类',
    dataIndex: 'categoryName',
    key: 'categoryName'
  },
  {
    title: '规格属性',
    key: 'attributes'
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

// 属性表格列定义
const attributeColumns = [
  {
    title: '属性名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '输入类型',
    dataIndex: 'inputType',
    key: 'inputType'
  },
  {
    title: '是否必填',
    dataIndex: 'isRequired',
    key: 'isRequired'
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    key: 'sortOrder'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '属性值',
    key: 'values'
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 商品分类选项
const categories = ref<any[]>([])

// 自定义类型，扩展SpecTemplateQuery以允许categoryId为数组
interface SearchFormType extends Omit<SpecTemplateQuery, 'categoryId'> {
  categoryId?: (string | number)[] | undefined;
}

// 搜索表单数据
const searchForm = reactive<SearchFormType>({
  name: '',
  categoryId: undefined,
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const loading = ref(false)
const tableData = ref<SpecTemplate[]>([])
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 自定义类型，扩展SpecTemplateDTO以允许categoryId为undefined或数组
interface FormDataType {
  name: string;
  categoryId?: (string | number)[] | undefined;
  status: 0 | 1;
}

// 处理表单提交前的数据转换
const getSubmitData = computed(() => {
  const submitData: SpecTemplateDTO = {
    name: formData.name,
    categoryId: Array.isArray(formData.categoryId) && formData.categoryId.length > 0
      ? Number(formData.categoryId[formData.categoryId.length - 1]) 
      : 0,
    status: formData.status
  };
  return submitData;
});

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增规格模板')
const formRef = ref()
const formData = reactive<FormDataType>({
  name: '',
  categoryId: undefined,
  status: 1
})

// 表单验证规则
const formRules = {
  categoryId: [
    { required: true, message: '请选择商品分类' }
  ],
  name: [
    { required: true, message: '请输入规格模板名称' }
  ]
}

// 详情弹窗
const detailVisible = ref(false)
const detailData = reactive<SpecTemplate>({
  id: 0,
  name: '',
  categoryId: 0,
  categoryName: '',
  status: 1,
  attributes: []
})

// 属性新增/编辑弹窗
const attributeModalVisible = ref(false)
const attributeModalTitle = ref('新增规格属性')
const attributeFormRef = ref()
const attributeFormData = reactive<SpecAttributeDTO>({
  templateId: 0,
  name: '',
  inputType: 'text',
  sortOrder: 0,
  isRequired: 1,
  status: 1
})

// 属性表单验证规则
const attributeFormRules = {
  name: [
    { required: true, message: '请输入属性名称' }
  ],
  inputType: [
    { required: true, message: '请选择输入类型' }
  ]
}

// 属性值管理弹窗
const valuesModalVisible = ref(false)
const currentAttributeId = ref<number>(0)
const attributeValues = ref<string[]>([''])
const originalAttributeValues = ref<SpecAttributeValue[]>([])

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res
  } catch (error) {
    console.error('获取分类列表失败:', error)
    message.error('获取分类列表失败')
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
  searchForm.categoryId = undefined
  searchForm.status = undefined
  handleSearch()
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增规格模板'
  formData.name = ''
  formData.categoryId = undefined
  formData.status = 1
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: any) => {
  modalTitle.value = '编辑规格模板'
  formData.name = record.name
  formData.categoryId = record.categoryId
  formData.status = record.status
  currentEditId.value = record.id
  modalVisible.value = true
}

// 当前编辑的模板ID
const currentEditId = ref<number>(0)

// 查看详情
const handleViewDetail = async (record: any) => {
  try {
    const res = await getSpecTemplateDetail(record.id)
    Object.assign(detailData, res as SpecTemplate)
    detailVisible.value = true
  } catch (error) {
    console.error('获取规格模板详情失败:', error)
    message.error('获取详情失败')
  }
}

// 切换状态
const handleToggleStatus = async (record: any) => {
  try {
    const newStatus = record.status === 1 ? 0 : 1
    await updateSpecTemplateStatus(record.id, newStatus)
    message.success(record.status === 1 ? '禁用成功' : '启用成功')
    fetchData()
  } catch (error) {
    console.error('更新规格模板状态失败:', error)
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (record: any) => {
  try {
    await deleteSpecTemplate(record.id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除规格模板失败:', error)
    message.error('删除失败')
  }
}

// 弹窗确认
const handleModalOk = () => {
  formRef.value?.validate().then(async () => {
    try {
      if (modalTitle.value === '新增规格模板') {
        await createSpecTemplate(getSubmitData.value)
        message.success('创建成功')
      } else {
        await updateSpecTemplate(currentEditId.value, getSubmitData.value)
        message.success('更新成功')
      }
      modalVisible.value = false
      fetchData()
    } catch (error) {
      console.error('保存规格模板失败:', error)
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
    const params: SpecTemplateQuery = {
      pageNum: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      name: searchForm.name,
      categoryId: Array.isArray(searchForm.categoryId) && searchForm.categoryId.length > 0
        ? Number(searchForm.categoryId[searchForm.categoryId.length - 1])
        : undefined,
      status: searchForm.status
    }
    
    const result = await getSpecTemplatePage(params)
    
    tableData.value = result.records
    pagination.total = result.total
  } catch (error) {
    console.error('获取规格模板列表失败:', error)
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 添加属性
const handleAddAttribute = () => {
  attributeModalTitle.value = '新增规格属性'
  attributeFormData.templateId = detailData.id
  attributeFormData.name = ''
  attributeFormData.inputType = 'text'
  attributeFormData.sortOrder = 0
  attributeFormData.isRequired = 1
  attributeFormData.status = 1
  currentAttributeId.value = 0
  attributeModalVisible.value = true
}

// 编辑属性
const handleEditAttribute = (record: any) => {
  attributeModalTitle.value = '编辑规格属性'
  attributeFormData.templateId = record.templateId
  attributeFormData.name = record.name
  attributeFormData.inputType = record.inputType
  attributeFormData.sortOrder = record.sortOrder
  attributeFormData.isRequired = record.isRequired
  attributeFormData.status = record.status
  currentAttributeId.value = record.id
  attributeModalVisible.value = true
}

// 删除属性
const handleDeleteAttribute = async (record: any) => {
  try {
    await deleteSpecAttribute(record.id)
    message.success('删除成功')
    refreshTemplateDetail()
  } catch (error) {
    console.error('删除规格属性失败:', error)
    message.error('删除失败')
  }
}

// 属性弹窗确认
const handleAttributeModalOk = () => {
  attributeFormRef.value?.validate().then(async () => {
    try {
      if (attributeModalTitle.value === '新增规格属性') {
        await createSpecAttribute(attributeFormData)
        message.success('创建成功')
      } else {
        await updateSpecAttribute(currentAttributeId.value, attributeFormData)
        message.success('更新成功')
      }
      attributeModalVisible.value = false
      refreshTemplateDetail()
    } catch (error) {
      console.error('保存规格属性失败:', error)
      message.error('保存失败')
    }
  })
}

// 属性弹窗取消
const handleAttributeModalCancel = () => {
  attributeModalVisible.value = false
  attributeFormRef.value?.resetFields()
}

// 管理属性值
const handleManageValues = async (record: any) => {
  try {
    currentAttributeId.value = record.id
    const res = await getSpecAttributeValueList(record.id)
    originalAttributeValues.value = res
    attributeValues.value = res.length > 0 ? res.map(item => item.value) : ['']
    valuesModalVisible.value = true
  } catch (error) {
    console.error('获取属性值列表失败:', error)
    message.error('获取属性值失败')
  }
}

// 属性值弹窗确认
const handleValuesModalOk = async () => {
  try {
    // 过滤空值
    const validValues = attributeValues.value.filter(v => v.trim() !== '')
    
    if (validValues.length === 0) {
      message.warning('请至少添加一个属性值')
      return
    }
    
    // 删除已移除的属性值
    const existingValues = originalAttributeValues.value
    const valuesToDelete = existingValues.filter(
      existingValue => !validValues.includes(existingValue.value)
    )
    
    for (const valueToDelete of valuesToDelete) {
      await deleteSpecAttributeValue(valueToDelete.id)
    }
    
    // 添加或更新属性值
    for (let i = 0; i < validValues.length; i++) {
      const value = validValues[i]
      const existingValue = existingValues.find(v => v.value === value)
      
      if (existingValue) {
        // 更新排序
        if (existingValue.sortOrder !== i) {
          await updateSpecAttributeValue(existingValue.id, {
            attributeId: currentAttributeId.value,
            value,
            sortOrder: i
          })
        }
      } else {
        // 创建新属性值
        await createSpecAttributeValue({
          attributeId: currentAttributeId.value,
          value,
          sortOrder: i
        })
      }
    }
    
    message.success('保存成功')
    valuesModalVisible.value = false
    refreshTemplateDetail()
  } catch (error) {
    console.error('保存属性值失败:', error)
    message.error('保存失败')
  }
}

// 属性值弹窗取消
const handleValuesModalCancel = () => {
  valuesModalVisible.value = false
}

// 刷新模板详情
const refreshTemplateDetail = async () => {
  try {
    const res = await getSpecTemplateDetail(detailData.id)
    Object.assign(detailData, res)
  } catch (error) {
    console.error('刷新规格模板详情失败:', error)
  }
}

// 获取输入类型文本
const getInputTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    text: '文本框',
    select: '下拉选择',
    radio: '单选框',
    checkbox: '复选框'
  }
  return typeMap[type] || type
}

// 初始化
onMounted(() => {
  fetchData()
  fetchCategories()
})
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
  
  .attribute-section {
    margin-top: 24px;
    
    .attribute-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
      }
    }
  }
}
</style> 