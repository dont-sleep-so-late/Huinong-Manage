<template>
  <div class="message-container">
    <a-card class="message-card">
      <template #title>
        <div class="card-title">
          <span>消息</span>
          <div class="title-actions">
            <a-button type="primary" @click="handleReadAll" :loading="loading">
              全部标为已读
            </a-button>
          </div>
        </div>
      </template>

      <a-spin :spinning="loading">
        <div class="message-list">
          <template v-if="messageList.length > 0">
            <div
              v-for="message in messageList"
              :key="message.id"
              class="message-item"
              :class="{ 'unread': !message.isRead }"
              @click="handleMessageClick(message)"
            >
              <div class="message-content">
                <div class="message-header">
                  <div class="message-title-wrapper">
                    <a-tag :color="getMessageTypeColor(message.type)" class="message-type-tag">
                      {{ getMessageTypeText(message.type) }}
                    </a-tag>
                    <span class="message-title">{{ message.title }}</span>
                  </div>
                  <span class="message-time">{{ formatTime(message.createdTime) }}</span>
                </div>
                <div class="message-body">{{ message.content }}</div>
              </div>
              <div class="message-status">
                <a-tag :color="message.isRead ? 'default' : 'blue'">
                  {{ message.isRead ? '已读' : '未读' }}
                </a-tag>
              </div>
            </div>
          </template>
          <a-empty v-else description="暂无消息" />
        </div>

        <div class="pagination">
          <a-pagination
            v-model:current="current"
            :total="total"
            :pageSize="pageSize"
            show-quick-jumper
            show-size-changer
            :page-size-options="['10', '20', '50']"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
          />
        </div>
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getMessageList, markMessageAsRead, markAllMessagesAsRead } from '@/api/message'
import type { Message } from '@/api/message'

interface MessageItem extends Message {}

const loading = ref(false)
const messageList = ref<MessageItem[]>([])
const current = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取消息列表
const fetchMessages = async () => {
  loading.value = true
  try {
    const res = await getMessageList({
      pageNum: current.value,
      pageSize: pageSize.value
    })
    messageList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error('获取消息列表失败:', error)
    antMessage.error('获取消息列表失败')
  } finally {
    loading.value = false
  }
}

// 处理消息点击
const handleMessageClick = async (message: MessageItem) => {
  if (!message.isRead) {
    try {
      await markMessageAsRead(message.id)
      message.isRead = true
      antMessage.success('已标记为已读')
    } catch (error) {
      console.error('标记消息已读失败:', error)
      antMessage.error('标记消息已读失败')
    }
  }
}

// 处理全部标为已读
const handleReadAll = async () => {
  loading.value = true
  try {
    await markAllMessagesAsRead()
    messageList.value.forEach(msg => msg.isRead = true)
    antMessage.success('已全部标记为已读')
  } catch (error) {
    console.error('标记全部已读失败:', error)
    antMessage.error('标记全部已读失败')
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = (page: number) => {
  current.value = page
  fetchMessages()
}

// 处理每页条数变化
const handleSizeChange = (_current: number, size: number) => {
  pageSize.value = size
  current.value = 1
  fetchMessages()
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 获取消息类型文本
const getMessageTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '订单通知'
    case 2:
      return '商品审核'
    case 3:
      return '系统通知'
    default:
      return '未知类型'
  }
}

// 获取消息类型对应的标签颜色
const getMessageTypeColor = (type: number) => {
  switch (type) {
    case 1:
      return 'orange'
    case 2:
      return 'green'
    case 3:
      return 'blue'
    default:
      return 'default'
  }
}

onMounted(() => {
  fetchMessages()
})
</script>

<style scoped>
.message-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.message-card {
  background: #fff;
  border-radius: 8px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-actions {
  display: flex;
  gap: 8px;
}

.message-list {
  margin-bottom: 24px;
}

.message-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-item:hover {
  background-color: #fafafa;
}

.message-item.unread {
  background-color: #f0f7ff;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-type-tag {
  margin-right: 4px;
}

.message-title {
  font-weight: 500;
  font-size: 16px;
}

.message-time {
  color: #999;
  font-size: 14px;
}

.message-body {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.message-status {
  margin-left: 16px;
}

.pagination {
  text-align: right;
  margin-top: 16px;
}
</style> 