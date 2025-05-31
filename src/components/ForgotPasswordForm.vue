<template>
  <div class="form-content">
    <h1>重置密码</h1>
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      @finish="handleSubmit"
    >
      <!-- 手机号输入框 -->
      <a-form-item
        name="phone"
        :rules="[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'change' }
        ]"
      >
        <a-input
          v-model:value="form.phone"
          placeholder="请输入手机号"
          size="large"
        >
          <template #prefix>
            <MobileOutlined class="form-icon" />
          </template>
        </a-input>
      </a-form-item>

      <!-- 验证码输入框 -->
      <a-form-item
        name="code"
        :rules="[
          { required: true, message: '请输入验证码' },
          { len: 6, message: '验证码为6位数字' }
        ]"
      >
        <a-input-group compact>
          <a-input
            v-model:value="form.code"
            placeholder="请输入验证码"
            style="width: calc(100% - 120px)"
            size="large"
          >
            <template #prefix>
              <SafetyOutlined class="form-icon" />
            </template>
          </a-input>
          <a-button
            type="primary"
            :disabled="!!countdown || !isValidPhone"
            :loading="sendingCode"
            class="verify-code-btn"
            size="large"
            @click="handleSendCode"
          >
            {{ countdown ? `${countdown}s后重试` : '获取验证码' }}
          </a-button>
        </a-input-group>
      </a-form-item>

      <!-- 新密码输入框 -->
      <a-form-item
        name="newPassword"
        :rules="[
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码不能少于6个字符' }
        ]"
      >
        <a-input-password
          v-model:value="form.newPassword"
          placeholder="请输入新密码"
          size="large"
        >
          <template #prefix>
            <LockOutlined class="form-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-button type="primary" html-type="submit" :loading="loading" block size="large">
        重置密码
      </a-button>
      <div class="form-options" style="margin-top: 16px;">
        <a @click.prevent="$emit('backToLogin')" href="#">返回登录</a>
      </div>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { MobileOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons-vue'
import { sendCode, resetPassword } from '@/api/auth'
import CryptoJS from 'crypto-js'

defineOptions({ name: 'ForgotPasswordForm' })

const emit = defineEmits(['backToLogin'])
const formRef = ref()
const form = reactive({
  phone: '',
  code: '',
  newPassword: ''
})

const rules = {
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\\d{9}$/, message: '请输入正确的手机号' }
  ],
  code: [
    { required: true, message: '请输入验证码' },
    { len: 6, message: '验证码为6位数字' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码不能少于6个字符' }
  ]
}

const loading = ref(false)
const countdown = ref(0)
const sendingCode = ref(false)

const isValidPhone = computed(() => {
  return /^1[3-9]\d{9}$/.test(form.phone)
})

const handleSendCode = async () => {
  if (!isValidPhone.value) {
    message.error('请输入正确的手机号')
    return
  }
  sendingCode.value = true
  try {
    await sendCode({ phone: form.phone, type: 'reset' })
    message.success('验证码发送成功')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    message.error('验证码发送失败')
  } finally {
    sendingCode.value = false
  }
}

const handleSubmit = async (values: any) => {
  loading.value = true
  try {
    await resetPassword({
      phone: values.phone,
      code: values.code,
      newPassword: CryptoJS.MD5(values.newPassword).toString(),
    })
    message.success('密码重置成功')
    emit('backToLogin')
  } catch (error) {
    message.error('密码重置失败')
  } finally {
    loading.value = false
  }
}
</script>

<script lang="ts">
export default {}
</script>

<style scoped>
.form-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 50px;
  text-align: center;
}

h1 {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: bold;
  color: #001529;
}

.form-icon {
  color: #bfbfbf;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-code-btn {
  width: 120px !important;
  height: 48px !important;
  margin-top: 0 !important;
  background-color: #1890ff !important;
  border-color: #1890ff !important;
  color: #fff !important;
}

.verify-code-btn:disabled {
  background-color: #f5f5f5 !important;
  border-color: #d9d9d9 !important;
  color: rgba(0, 0, 0, 0.25) !important;
}
</style> 