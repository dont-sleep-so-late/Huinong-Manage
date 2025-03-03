<template>
  <div class="message-center">
    <a-card :bordered="false">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="0" tab="全部消息" />
        <a-tab-pane key="1" tab="订单通知" />
        <a-tab-pane key="2" tab="审核通知" />
        <a-tab-pane key="3" tab="系统通知" />
      </a-tabs>
      
      <div class="table-operations">
        <a-space>
          <a-button
            type="primary"
            :disabled="!selectedRowKeys.length"
            @click="handleBatchRead"
          >
            标记已读
          </a-button>
          <a-button
            danger
            :disabled="!selectedRowKeys.length"
            @click="handleBatchDelete"
          >
            批量删除
          </a-button>
          <a-button @click="handleRefresh">刷新</a-button>
        </a-space>
      </div>
      
      <a-table
        :loading="loading"
        :columns="columns"
        :data-source="messageList"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <div :class="{ 'unread-message': !record.isRead }">
              {{ record.title }}
            </div>
          </template>
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleView(record)">查看</a-button>
              <a-button 
                v-if="!record.isRead" 
                type="link" 
                @click="handleMarkRead(record)"
              >
                标为已读
              </a-button>
              <a-button type="link" danger @click="handleDelete(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 消息详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      title="消息详情"
      :footer="null"
      @ok="detailVisible = false"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="标题">{{ currentMessage.title }}</a-descriptions-item>
        <a-descriptions-item label="发送时间">{{ currentMessage.createdTime }}</a-descriptions-item>
        <a-descriptions-item label="发送人">{{ currentMessage.sender }}</a-descriptions-item>
        <a-descriptions-item label="内容">{{ currentMessage.content }}</a-descriptions-item>
      </a-descriptions>
      <div class="modal-footer">
        <a-button type="primary" @click="detailVisible = false">确定</a-button>
      </div>
    </a-modal>
    
    <!-- 删除确认弹窗 -->
    <a-modal
      v-model:visible="deleteVisible"
      title="删除确认"
      :confirm-loading="confirmLoading"
      @ok="confirmDelete"
      @cancel="deleteVisible = false"
    >
      <p>确定要删除选中的消息吗？此操作不可恢复。</p>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, h } from 'vue'
import { message, Modal, Tag } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/table/interface'
import {
  getMessageList,
  batchMarkMessagesAsRead,
  batchDeleteMessages,
  type Message,
  type MessageQuery
} from '@/api/message'

// 表格列定义
const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 300,
    ellipsis: true
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 120
  },
  {
    title: '发送人',
    dataIndex: 'sender',
    key: 'sender',
    width: 120
  },
  {
    title: '发送时间',
    dataIndex: 'createdTime',
    key: 'createdTime',
    width: 180,
    sorter: true
  },
  {
    title: '状态',
    dataIndex: 'isRead',
    key: 'isRead',
    width: 100,
    customRender: ({ text }: { text: boolean }) => {
      return h(Tag, {
        color: text ? 'green' : 'orange'
      }, { default: () => text ? '已读' : '未读' })
    }
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
]

// 状态定义
const loading = ref(false)
const activeTab = ref('0')
const messageList = ref<Message[]>([])
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 表格选择
const selectedRowKeys = ref<Key[]>([])
const rowSelection = {
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: Key[]) => {
    selectedRowKeys.value = keys
  }
}

// 详情弹窗
const detailVisible = ref(false)
const currentMessage = ref<Partial<Message>>({})

// 删除弹窗
const deleteVisible = ref(false)
const confirmLoading = ref(false)
const deleteIds = ref<number[]>([])
const isMultiple = ref(false)

// 获取消息列表
const fetchMessages = async () => {
  loading.value = true
  try {
    const params: MessageQuery = {
      pageNum: pagination.current as number,
      pageSize: pagination.pageSize as number
    }
    
    // 根据标签页筛选消息类型
    if (activeTab.value !== '0') {
      params.type = Number(activeTab.value) as 1 | 2 | 3
    }
    
    const res = await getMessageList(params)
    messageList.value = res.records
    pagination.total = res.total
  } catch (error) {
    console.error('获取消息列表失败:', error)
    message.error('获取消息列表失败')
  } finally {
    loading.value = false
  }
}

// 处理标签页切换
const handleTabChange = () => {
  pagination.current = 1
  selectedRowKeys.value = []
  fetchMessages()
}

// 处理表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchMessages()
}

// 刷新
const handleRefresh = () => {
  fetchMessages()
}

// 查看消息详情
const handleView = async (record: Message) => {
  currentMessage.value = record
  detailVisible.value = true
  
  // 如果是未读消息，标记为已读
  if (!record.isRead) {
    await handleMarkRead(record, false)
  }
}

// 标记为已读
const handleMarkRead = async (record: Message, showTip = true) => {
  try {
    await batchMarkMessagesAsRead([record.id])
    if (showTip) {
      message.success('标记已读成功')
    }
    // 更新列表中的状态
    const index = messageList.value.findIndex(item => item.id === record.id)
    if (index !== -1) {
      messageList.value[index].isRead = true
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    if (showTip) {
      message.error('标记已读失败')
    }
  }
}

// 批量标记为已读
const handleBatchRead = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要标记的消息')
    return
  }
  
  try {
    const ids = selectedRowKeys.value.map(key => Number(key))
    await batchMarkMessagesAsRead(ids)
    message.success('批量标记已读成功')
    fetchMessages()
    selectedRowKeys.value = []
  } catch (error) {
    console.error('批量标记已读失败:', error)
    message.error('批量标记已读失败')
  }
}

// 删除单个消息
const handleDelete = (record: Message) => {
  deleteIds.value = [record.id]
  isMultiple.value = false
  deleteVisible.value = true
}

// 批量删除消息
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的消息')
    return
  }
  
  deleteIds.value = selectedRowKeys.value.map(key => Number(key))
  isMultiple.value = true
  deleteVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  confirmLoading.value = true
  try {
    await batchDeleteMessages(deleteIds.value)
    message.success(`${isMultiple.value ? '批量' : ''}删除成功`)
    deleteVisible.value = false
    fetchMessages()
    selectedRowKeys.value = []
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  } finally {
    confirmLoading.value = false
  }
}

// 获取消息类型文本
const getTypeText = (type: number) => {
  const map: Record<number, string> = {
    1: '订单通知',
    2: '审核通知',
    3: '系统通知'
  }
  return map[type] || '未知类型'
}

// 获取消息类型颜色
const getTypeColor = (type: number) => {
  const map: Record<number, string> = {
    1: 'blue',
    2: 'orange',
    3: 'purple'
  }
  return map[type] || 'default'
}

onMounted(() => {
  fetchMessages()
})
</script>

<style lang="less" scoped>
.message-center {
  .table-operations {
    margin-bottom: 16px;
  }
  
  .unread-message {
    position: relative;
    font-weight: 500;
    
    &::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #f5222d;
      margin-right: 8px;
      vertical-align: middle;
    }
  }
  
  .modal-footer {
    margin-top: 24px;
    text-align: right;
  }
}
</style> 