<template>
  <a-card class="news-list-card">
    <div class="news-list">
      <div v-for="item in newsList" :key="item.id" class="news-item">
        <div class="news-date">
          <div class="news-date-month">{{ formatMonth(item.date) }}</div>
          <div class="news-date-day">{{ formatDay(item.date) }}</div>
        </div>
        <div class="news-content-area">
          <div class="news-title" @click="showNewsDetail(item.id)">{{ item.title }}</div>
          <div class="news-desc">{{ item.content?.slice(0, 80) }}...</div>
          <div class="news-source">来源：{{ item.source }}</div>
        </div>
      </div>
      <a-pagination
        v-if="(paginationData.total || 0) > (paginationData.pageSize || 0)"
        :current="paginationData.current || 1"
        :total="paginationData.total || 0"
        :pageSize="paginationData.pageSize || 5"
        @change="onPageChange"
        style="margin-top: 16px; text-align: right;"
      />
    </div>
    <!-- 新闻详情弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="null"
      :footer="null"
      width="800px"
      class="news-detail-modal"
    >
      <div class="news-detail-content">
        <div class="news-detail-title">{{ newsDetail.title }}</div>
        <div class="news-detail-meta">
          <span>发布时间：{{ newsDetail.date }}</span>
          <span v-if="newsDetail.source">来源：{{ newsDetail.source }}</span>
        </div>
        <div class="news-detail-body" v-html="newsDetail.content"></div>
      </div>
    </a-modal>
  </a-card>
</template>

<script lang="ts">
export default {
  name: 'NewsList'
}
</script>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { PaginationProps } from 'ant-design-vue'
import axios from 'axios'

interface NewsItem {
  id: string
  title: string
  date: string
  link?: string
  content?: string
  source?: string
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
  pageSize: 10,
  total: 0,
  onChange: (page: number, pageSize: number) => {
    pagination.value.current = page
    fetchNewsList()
  }
})

// 便于模板使用
const paginationData = computed(() => pagination.value)

// 获取新闻列表
const fetchNewsList = async () => {
  try {
    const res = await axios.post('https://pfsc.agri.cn/api/FarmDaily/list', {
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize
    }, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json, text/plain, */*'
      }
    })
    const content = res.data.content
    newsList.value = (content.list || []).map((item: any) => ({
      id: item.id,
      title: item.counclesion,
      date: item.daylyDate?.slice(0, 10) || '',
      content: item.countentstr,
      source: item.source
    }))
    pagination.value.total = content.totalCount || 0
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    message.error('获取新闻列表失败')
  }
}

// 显示新闻详情
const showNewsDetail = async (id: string) => {
  // 直接本地查找，无需再请求详情接口
  const item = newsList.value.find(n => n.id === id)
  if (item) {
    newsDetail.value = {
      id: item.id,
      title: item.title,
      date: item.date,
      content: item.content || '',
      source: item.source || '',
      link: ''
    }
    modalVisible.value = true
  }
}

const formatDay = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.slice(-2)
}
const formatMonth = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.slice(0, 7).replace('-', '/')
}
const onPageChange = (page: number) => {
  pagination.value.current = page
  fetchNewsList()
}

onMounted(() => {
  fetchNewsList()
})
</script>

<style lang="less" scoped>
.news-list-card {
  margin-top: 16px;
}
.news-list {
  .news-item {
    display: flex;
    border-bottom: 1px dashed #eee;
    padding: 18px 0 12px 0;
    &:last-child {
      border-bottom: none;
    }
    .news-date {
      width: 90px;
      text-align: center;
      margin-right: 18px;
      border: 2px solid #e6e6e6;
      border-radius: 8px;
      padding: 8px 0 4px 0;
      background: #fafbfc;
      .news-date-month {
        font-size: 16px;
        color: #888;
        margin-bottom: 2px;
      }
      .news-date-day {
        font-size: 32px;
        color: #ff4d4f;
        font-weight: bold;
        line-height: 1;
      }
    }
    .news-content-area {
      flex: 1;
      min-width: 0;
      .news-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 6px;
        cursor: pointer;
        color: #222;
        transition: color 0.2s;
        &:hover {
          color: #1890ff;
        }
      }
      .news-desc {
        color: #555;
        margin-bottom: 4px;
        font-size: 15px;
      }
      .news-source {
        color: #aaa;
        font-size: 13px;
        text-align: right;
      }
    }
  }
}
.news-detail-modal {
  :deep(.ant-modal-body) {
    max-height: 60vh;
    overflow-y: auto;
    padding: 32px 32px 24px 32px;
    background: #fff;
    border-radius: 8px;
  }
  .news-detail-content {
    .news-detail-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 18px;
      color: #222;
      text-align: center;
    }
    .news-detail-meta {
      color: #888;
      font-size: 15px;
      margin-bottom: 18px;
      text-align: center;
      span {
        margin: 0 12px;
        display: inline-block;
      }
    }
    .news-detail-body {
      line-height: 1.8;
      font-size: 16px;
      color: #333;
      padding: 0 8px;
      :deep(p) {
        margin-bottom: 1em;
      }
    }
  }
}
</style> 