<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <img src="@/assets/logo.png" alt="logo" class="logo" />
        <h1>惠农商城后台管理系统</h1>
      </div>
      
      <a-form
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @finish="handleSubmit"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="loginForm.username"
            size="large"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <user-outlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password
            v-model:value="loginForm.password"
            size="large"
            placeholder="请输入密码"
          >
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="remember">
          <a-checkbox v-model:checked="loginForm.remember">
            记住密码
          </a-checkbox>
          <a class="login-form-forgot" href="">
            忘记密码
          </a>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="login-form-button"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/store'
import type { LoginParams } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

// 登录表单
const loginForm = reactive<LoginParams>({
  username: '',
  password: '',
  remember: true
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ]
}

// 提交表单
const handleSubmit = async () => {
  loading.value = true
  try {
    const success = await userStore.login(loginForm.username, loginForm.password)
    if (success) {
      await userStore.getUserInfo()
      message.success('登录成功')
      router.push('/')
    } else {
      message.error('登录失败，请检查用户名和密码')
    }
  } catch (error) {
    message.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  background-image: url('@/assets/login-bg.svg');
  background-repeat: no-repeat;
  background-position: center 110px;
  background-size: 100%;

  .login-content {
    width: 368px;
    margin: 0 auto;
    padding: 24px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .logo {
      width: 64px;
      margin-bottom: 16px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
    }
  }

  .login-form {
    .login-form-forgot {
      float: right;
    }

    .login-form-button {
      width: 100%;
    }
  }
}
</style> 