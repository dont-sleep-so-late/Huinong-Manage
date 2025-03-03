<template>
  <a-popover
    placement="bottomRight"
    trigger="click"
    v-model:open="visible"
    @openChange="handleVisibleChange"
    overlayClassName="message-popover"
  >
    <template #content>
      <div class="message-container">
        <div class="message-header">
          <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
            <a-tab-pane key="0" tab="全部消息" />
            <a-tab-pane key="1" tab="订单通知" />
            <a-tab-pane key="2" tab="审核通知" />
            <a-tab-pane key="3" tab="系统通知" />
          </a-tabs>
          <a-button type="link" @click="handleReadAll">全部已读</a-button>
        </div>
        <a-spin :spinning="loading">
          <a-list
            class="message-list"
            :data-source="messageList"
            :pagination="false"
            :locale="{ emptyText: '暂无消息' }"
          >
            <template #renderItem="{ item }">
              <a-list-item @click="handleMessageClick(item)">
                <div class="message-item" :class="{ 'unread': !item.isRead }">
                  <div class="message-title">
                    <span class="title-text">{{ item.title }}</span>
                    <span class="message-time">{{ formatTime(item.createdTime) }}</span>
                  </div>
                  <div class="message-content">{{ item.content }}</div>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-spin>
        <div class="message-footer">
          <a-button type="link" @click="handleViewMore">查看更多</a-button>
        </div>
      </div>
    </template>
    <a-badge :count="unreadCount" :dot="false" :overflowCount="99">
      <a-button type="link">
        <IconProvider name="bell" />
      </a-button>
    </a-badge>
  </a-popover>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getMessageList, getUnreadMessageCount, batchMarkMessagesAsRead, type Message } from '@/api/message'
import IconProvider from '@/components/IconProvider.vue'
import { ICON_NAMES } from '@/utils/icons'

export default defineComponent({
  name: 'MessageNotification',
  components: {
    IconProvider
  },
  props: {
    refreshInterval: {
      type: Number,
      default: 60000 // 默认1分钟刷新一次
    }
  },
  setup(props) {
    const router = useRouter()
    const visible = ref(false)
    const loading = ref(false)
    const unreadCount = ref(0)
    const activeTab = ref('0')
    const messageList = ref<Message[]>([])
    let timer: number | null = null

    // 获取未读消息数量
    const fetchUnreadCount = async () => {
      try {
        const type = activeTab.value === '0' ? undefined : Number(activeTab.value) as 1 | 2 | 3
        const res = await getUnreadMessageCount(type)
        unreadCount.value = res
      } catch (error) {
        console.error('获取未读消息数量失败:', error)
      }
    }

    // 获取消息列表
    const fetchMessages = async () => {
      if (!visible.value) return
      
      loading.value = true
      try {
        const type = activeTab.value === '0' ? undefined : Number(activeTab.value) as 1 | 2 | 3
        const params = {
          pageNum: 1,
          pageSize: 5,
          type,
          isRead: false
        }
        const res = await getMessageList(params)
        messageList.value = res.records
      } catch (error) {
        console.error('获取消息列表失败:', error)
        message.error('获取消息列表失败')
      } finally {
        loading.value = false
      }
    }

    // 格式化时间
    const formatTime = (time: string) => {
      const now = dayjs()
      const messageTime = dayjs(time)
      
      if (now.diff(messageTime, 'day') === 0) {
        return messageTime.format('HH:mm')
      } else if (now.diff(messageTime, 'day') === 1) {
        return '昨天'
      } else if (now.diff(messageTime, 'day') <= 7) {
        return `${now.diff(messageTime, 'day')}天前`
      } else {
        return messageTime.format('MM-DD')
      }
    }

    // 处理标签页切换
    const handleTabChange = () => {
      fetchMessages()
      fetchUnreadCount()
    }

    // 处理弹出层显示状态变化
    const handleVisibleChange = (newVisible: boolean) => {
      visible.value = newVisible
      if (newVisible) {
        fetchMessages()
      }
    }

    // 处理消息点击
    const handleMessageClick = async (item: Message) => {
      // 标记为已读
      if (!item.isRead) {
        await batchMarkMessagesAsRead([item.id])
        fetchUnreadCount()
      }
      
      // 根据消息类型跳转到相应页面
      if (item.type === 1 && item.relatedId) {
        // 订单通知，跳转到订单详情
        router.push(`/order/detail/${item.relatedId}`)
      } else if (item.type === 2) {
        // 商品审核通知，跳转到商品审核页面
        router.push('/product/audit')
      } else {
        // 其他消息，跳转到消息中心
        router.push('/message')
      }
      
      visible.value = false
    }

    // 全部标记为已读
    const handleReadAll = async () => {
      if (messageList.value.length === 0) return
      
      try {
        const unreadIds = messageList.value
          .filter(item => !item.isRead)
          .map(item => item.id)
        
        if (unreadIds.length === 0) {
          message.info('没有未读消息')
          return
        }
        
        await batchMarkMessagesAsRead(unreadIds)
        message.success('已全部标记为已读')
        fetchMessages()
        fetchUnreadCount()
      } catch (error) {
        console.error('标记已读失败:', error)
        message.error('标记已读失败')
      }
    }

    // 查看更多
    const handleViewMore = () => {
      router.push('/message')
      visible.value = false
    }

    onMounted(() => {
      // 初始加载
      fetchUnreadCount()
      
      // 设置定时刷新
      timer = window.setInterval(() => {
        fetchUnreadCount()
        if (visible.value) {
          fetchMessages()
        }
      }, props.refreshInterval)
    })

    onUnmounted(() => {
      // 清除定时器
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    })

    return {
      visible,
      loading,
      unreadCount,
      activeTab,
      messageList,
      formatTime,
      handleTabChange,
      handleVisibleChange,
      handleMessageClick,
      handleReadAll,
      handleViewMore
    }
  }
})
</script>

<style lang="less" scoped>
.message-popover {
  width: 350px;
}

.message-container {
  width: 100%;
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #f0f0f0;
    
    :deep(.ant-tabs) {
      flex: 1;
    }
  }
  
  .message-list {
    max-height: 400px;
    overflow-y: auto;
    
    .message-item {
      padding: 8px 0;
      cursor: pointer;
      
      &.unread {
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          left: -16px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #f5222d;
        }
      }
      
      .message-title {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        
        .title-text {
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
        }
        
        .message-time {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }
      }
      
      .message-content {
        color: rgba(0, 0, 0, 0.65);
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
  
  .message-footer {
    text-align: center;
    padding: 8px 0;
    border-top: 1px solid #f0f0f0;
  }
}
</style> 