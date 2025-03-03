<template>
  <div class="image-upload">
    <a-upload
      v-model:file-list="fileList"
      list-type="picture-card"
      :show-upload-list="false"
      :action="`http://localhost:8888/api/common/file/upload/image`"
      :headers="headers"
      name="file"
      :before-upload="handleBeforeUpload"
      @change="handleChange"
    >
      <div v-if="value" class="image-preview">
        <img :src="value" :alt="alt" />
        <div class="image-actions" @click.stop>
          <a-space>
            <EyeOutlined @click="handlePreview" />
            <DeleteOutlined @click="handleRemove" />
          </a-space>
        </div>
      </div>
      <div v-else class="upload-trigger">
        <PlusOutlined />
        <div class="upload-text">{{ uploadText }}</div>
      </div>
    </a-upload>

    <!-- 图片预览 -->
    <a-modal
      v-model:open="previewVisible"
      :title="previewTitle"
      :footer="null"
      @cancel="handlePreviewCancel"
    >
      <img :src="value" style="width: 100%" />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ImageUpload'
})
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadFile } from 'ant-design-vue'
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue'

interface Props {
  value?: string
  maxSize?: number
  uploadText?: string
  alt?: string
  accept?: string
}

interface Emits {
  (e: 'update:value', value: string): void
  (e: 'change', value: string): void
  (e: 'remove'): void
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  maxSize: 2,
  uploadText: '上传图片',
  alt: '图片',
  accept: 'image/jpeg,image/png,image/gif'
})

const emit = defineEmits<Emits>()

// 文件列表
const fileList = ref<UploadFile[]>([])

// 预览相关
const previewVisible = ref(false)
const previewTitle = computed(() => props.alt)

// 获取token
const headers = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

// 上传前校验
const handleBeforeUpload = (file: File) => {
  // 检查文件类型
  const isAcceptType = props.accept.split(',').includes(file.type)
  if (!isAcceptType) {
    message.error('只能上传 JPG/PNG/GIF 格式的图片!')
    return false
  }
  
  // 检查文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    message.error(`图片大小不能超过${props.maxSize}MB!`)
    return false
  }
  
  return isAcceptType && isLtMaxSize
}

// 上传状态改变
const handleChange = (info: UploadChangeParam) => {
  if (info.file.status === 'uploading') {
    return
  }
  
  if (info.file.status === 'done') {
    const { code, data, message: msg } = info.file.response
    if (code === 200) {
      emit('update:value', data)
      emit('change', data)
      message.success('上传成功')
    } else {
      message.error(msg || '上传失败')
    }
  }
  
  if (info.file.status === 'error') {
    message.error('上传失败')
  }
}

// 预览图片
const handlePreview = () => {
  previewVisible.value = true
}

// 关闭预览
const handlePreviewCancel = () => {
  previewVisible.value = false
}

// 删除图片
const handleRemove = () => {
  emit('update:value', '')
  emit('remove')
  fileList.value = []
}
</script>

<style scoped>
.image-upload {
  display: inline-block;
}

.image-upload :deep(.ant-upload) {
  width: 104px;
  height: 104px;
}

.image-upload :deep(.ant-upload) img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: all 0.3s;
}

.image-actions .anticon {
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.image-actions .anticon:hover {
  color: #1890ff;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.upload-text {
  margin-top: 8px;
  color: #666;
}
</style> 