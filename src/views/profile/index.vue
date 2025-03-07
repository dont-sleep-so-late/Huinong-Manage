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
              <ImageUpload 
                v-model:value="formState.avatar" 
                upload-text="上传头像" 
                alt="用户头像"
                :max-size="2"
                @change="handleAvatarChange"
              />
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
import { getProfile, updateProfile, updatePassword } from '@/api/user'
import type { RuleObject } from 'ant-design-vue/es/form'
import type { FormInstance } from 'ant-design-vue'
import ImageUpload from '@/components/ImageUpload/ImageUpload.vue'

// 定义用户信息接口
interface UserInfo {
  id?: number;
  username?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role?: string;
  createTime?: string | null;
  verified?: boolean;
}

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
const rules: Record<string, RuleObject[]> = {
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
const passwordRules: Record<string, RuleObject[]> = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: async (rule: RuleObject, value: string) => {
        if (value !== passwordForm.newPassword) {
          throw new Error('两次输入的密码不一致')
        }
      },
      trigger: 'blur'
    }
  ]
}

// 表单相关
const submitting = ref(false)
const passwordSubmitting = ref(false)
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 初始化表单数据
onMounted(async () => {
  await fetchUserProfile()
})

// 获取用户个人信息
const fetchUserProfile = async () => {
  try {
    const {data} = await getProfile()
    
    // 直接使用响应数据，因为API直接返回用户对象而不是标准的{code, message, data}格式
    if (data) {
      // 使用类型断言将response转换为UserInfo类型
      const userInfo = data as unknown as UserInfo
      formState.username = userInfo.username || ''
      formState.nickname = userInfo.nickname || ''
      formState.phone = userInfo.phone || ''
      formState.email = userInfo.email || ''
      formState.avatar = userInfo.avatar || ''
      
      // 如果需要，可以更新用户存储中的信息
      if (userStore.userInfo) {
        userStore.userInfo = {
          ...userStore.userInfo,
          ...userInfo
        }
      }
    } else {
      message.error('获取个人信息失败')
    }
  } catch (error) {
    console.error('获取个人信息失败:', error)
    message.error('获取个人信息失败，请稍后重试')
  }
}

// 处理头像变更
const handleAvatarChange = (url: string) => {
  formState.avatar = url
  console.log('头像已更新:', url)
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (!formRef.value) return
    await formRef.value.validate()
    submitting.value = true
    
    const {data} = await updateProfile({
      nickname: formState.nickname,
      phone: formState.phone,
      email: formState.email,
      avatar: formState.avatar
    })
    
    console.log('更新个人信息响应:', data)
    
    // 直接使用响应数据，因为API直接返回用户对象
    const userResponse = data as unknown as UserInfo
    if (userResponse && userResponse.id) {
      // 更新用户信息到store
      await userStore.getUserInfo()
      message.success('个人信息修改成功')
    } else {
      message.error('修改失败，请重试')
    }
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
    if (!passwordFormRef.value) return
    await passwordFormRef.value.validate()
    passwordSubmitting.value = true
    
    const response = await updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    
    console.log('修改密码响应:', response)
    
    if (response && response.code === 200) {
      message.success('密码修改成功，请重新登录')
      await userStore.logout()
    } else {
      message.error(response?.message || '修改失败，请重试')
    }
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
}
</style> 