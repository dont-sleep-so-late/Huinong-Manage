<template>
  <div class="profile-container">
    <a-card title="个人信息" :bordered="false">
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="formState.username" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="昵称" name="nickname">
              <a-input v-model:value="formState.nickname" placeholder="请输入昵称" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="手机号" name="phone">
              <a-input v-model:value="formState.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="头像" name="avatar">
              <a-upload
                v-model:file-list="fileList"
                name="avatar"
                list-type="picture-card"
                class="avatar-uploader"
                :show-upload-list="false"
                :before-upload="beforeUpload"
                @change="handleChange"
              >
                <img v-if="formState.avatar" :src="formState.avatar" alt="avatar" />
                <div v-else>
                  <loading-outlined v-if="uploading" />
                  <plus-outlined v-else />
                  <div class="ant-upload-text">上传</div>
                </div>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="submitting">保存修改</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="修改密码" :bordered="false" style="margin-top: 24px;">
      <a-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        layout="vertical"
        @finish="handlePasswordSubmit"
      >
        <a-form-item label="原密码" name="oldPassword">
          <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入原密码" />
        </a-form-item>

        <a-form-item label="新密码" name="newPassword">
          <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>

        <a-form-item label="确认新密码" name="confirmPassword">
          <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="passwordSubmitting">修改密码</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/store'
import { updateUserInfo, updatePassword } from '@/api/user'
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'

const userStore = useUserStore()

// 表单状态
const formState = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  avatar: ''
})

// 表单验证规则
const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 密码表单状态
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: async (rule: any, value: string) => {
        if (value !== passwordForm.newPassword) {
          throw new Error('两次输入的密码不一致')
        }
      },
      trigger: 'blur'
    }
  ]
}

// 上传相关
const fileList = ref([])
const uploading = ref(false)
const submitting = ref(false)
const passwordSubmitting = ref(false)

// 初始化表单数据
onMounted(() => {
  const userInfo = userStore.userInfo
  if (userInfo) {
    formState.username = userInfo.username
    formState.nickname = userInfo.nickname || ''
    formState.phone = userInfo.phone || ''
    formState.email = userInfo.email || ''
    formState.avatar = userInfo.avatar || ''
  }
})

// 上传前校验
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
  }
  return isJpgOrPng && isLt2M
}

// 处理上传变化
const handleChange = (info: UploadChangeParam) => {
  if (info.file.status === 'uploading') {
    uploading.value = true
    return
  }
  if (info.file.status === 'done') {
    uploading.value = false
    formState.avatar = info.file.response.url
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    submitting.value = true
    const response = await updateUserInfo({
      nickname: formState.nickname,
      phone: formState.phone,
      email: formState.email,
      avatar: formState.avatar
    })
    
    // 更新 store 中的用户信息
    await userStore.getUserInfo()
    message.success('个人信息修改成功')
  } catch (error) {
    console.error('修改个人信息失败:', error)
    message.error('修改失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 提交密码修改
const handlePasswordSubmit = async () => {
  try {
    passwordSubmitting.value = true
    await updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    message.success('密码修改成功，请重新登录')
    await userStore.logout()
  } catch (error) {
    console.error('修改密码失败:', error)
    message.error('修改失败，请重试')
  } finally {
    passwordSubmitting.value = false
  }
}
</script>

<style lang="less" scoped>
.profile-container {
  padding: 24px;
  
  .avatar-uploader {
    :deep(.ant-upload) {
      width: 128px;
      height: 128px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style> 