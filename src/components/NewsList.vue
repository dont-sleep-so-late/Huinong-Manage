<template>
  <div class="news-list">
    <a-list :data-source="newsList" :pagination="pagination" class="news-list-content">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a @click="showNewsDetail(item.id)">{{ item.title }}</a>
            </template>
            <template #description>
              <span>{{ item.date }}</span>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>

    <!-- 新闻详情弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="newsDetail.title"
      :footer="null"
      width="800px"
      class="news-detail-modal"
    >
      <div class="news-detail-content">
        <div class="news-meta">
          <span>发布时间：{{ newsDetail.date }}</span>
          <span v-if="newsDetail.source">来源：{{ newsDetail.source }}</span>
        </div>
        <div class="news-content" v-html="newsDetail.content"></div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
export default {
  name: 'NewsList'
}
</script>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getNewsList, getNewsDetail } from '@/api/price'
import { message } from 'ant-design-vue'
import type { PaginationProps } from 'ant-design-vue'

interface NewsItem {
  id: string
  title: string
  date: string
  link: string
}

interface NewsDetail {
  id: string
  title: string
  date: string
  content: string
  source: string
  link: string
}

const newsList = ref<NewsItem[]>([])
const newsDetail = ref<NewsDetail>({
  id: '',
  title: '',
  date: '',
  content: '',
  source: '',
  link: ''
})
const modalVisible = ref(false)
const pagination = ref<PaginationProps>({
  current: 1,
  pageSize: 5,
  total: 0,
  onChange: (page: number, pageSize: number) => {
    pagination.value.current = page
    fetchNewsList()
  }
})

// 获取新闻列表
const fetchNewsList = async () => {
  try {
    const { data } = await getNewsList({
      page: pagination.value.current || 1,
      rows: pagination.value.pageSize || 5
    })
    if (data.message === 'success') {
      newsList.value = data.result.table
      pagination.value.total = data.result.total
    }
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    message.error('获取新闻列表失败')
  }
}

// 显示新闻详情
const showNewsDetail = async (id: string) => {
  try {
    const { data } = await getNewsDetail(id)
    if (data.message === 'success') {
      newsDetail.value = data.result
      modalVisible.value = true
    }
  } catch (error) {
    console.error('获取新闻详情失败:', error)
    message.error('获取新闻详情失败')
  }
}

onMounted(() => {
  fetchNewsList()
})
</script>

<style lang="less" scoped>
.news-list {
  .news-list-content {
    background: #fff;
    padding: 5px;
  }
}

.news-detail-modal {
  :deep(.ant-modal-body) {
    max-height: 40vh;
    overflow-y: auto;
  }

  .news-meta {
    margin-bottom: 16px;
    color: #666;
    
    span {
      margin-right: 16px;
    }
  }

  .news-content {
    line-height: 1.8;
    
    :deep(p) {
      margin-bottom: 1em;
    }
  }
}
</style> 