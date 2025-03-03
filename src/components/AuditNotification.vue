<template>
  <a-badge :count="count" :dot="false" :overflowCount="99">
    <a-button type="link" @click="handleClick">
      <IconProvider name="check" />
    </a-button>
  </a-badge>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import IconProvider from '@/components/IconProvider.vue'
import { getPendingAuditCount } from '@/api/product'

export default defineComponent({
  name: 'AuditNotification',
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
    const count = ref(0)
    const router = useRouter()
    let timer: number | null = null

    // 获取待审核商品数量
    const fetchAuditCount = async () => {
      try {
        const res = await getPendingAuditCount()
        count.value = res
      } catch (error) {
        console.error('获取待审核商品数量失败:', error)
      }
    }

    // 点击通知图标
    const handleClick = () => {
      router.push('/product/audit')
    }

    onMounted(() => {
      // 初始加载
      fetchAuditCount()
      
      // 设置定时刷新
      timer = window.setInterval(() => {
        fetchAuditCount()
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
      count,
      handleClick
    }
  }
})
</script>

<style lang="less" scoped>
:deep(.ant-badge-count) {
  box-shadow: 0 0 0 1px #fff;
}
</style> 