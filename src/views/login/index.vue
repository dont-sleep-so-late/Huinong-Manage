<template>
  <div class="login-container">
    <div class="login-box" :class="{ 'right-panel-active': activeForm === 'register' }">
      <!-- 登录表单 -->
      <div class="form-container sign-in-container" v-if="activeForm === 'login'">
        <div class="form-content">
          <h1>惠农商城后台管理系统</h1>
          <a-form
            ref="formRef"
            :model="loginForm"
            :rules="rules"
            @finish="handleLogin"
          >
            <!-- 登录方式切换 -->
            <a-form-item>
              <a-radio-group v-model:value="loginForm.loginType" button-style="solid" @change="handleLoginTypeChange">
                <a-radio-button value="phone">手机号登录</a-radio-button>
                <a-radio-button value="email">邮箱登录</a-radio-button>
                <a-radio-button value="sms">验证码登录</a-radio-button>
              </a-radio-group>
            </a-form-item>

            <!-- 账号输入框 -->
            <a-form-item
              name="account"
              :rules="accountRules"
            >
              <a-input
                v-model:value="loginForm.account"
                :placeholder="getAccountPlaceholder"
                size="large"
              >
                <template #prefix>
                  <component :is="getAccountIcon" class="form-icon" />
                </template>
              </a-input>
            </a-form-item>

            <!-- 密码/验证码输入框 -->
            <template v-if="loginForm.loginType !== 'sms'">
              <a-form-item
                name="password"
                :rules="[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码不能少于6个字符' }
                ]"
              >
                <a-input-password
                  v-model:value="loginForm.password"
                  placeholder="请输入密码"
                  size="large"
                >
                  <template #prefix>
                    <LockOutlined class="form-icon" />
                  </template>
                </a-input-password>
              </a-form-item>
            </template>
            <template v-else>
              <a-form-item
                name="code"
                :rules="[
                  { required: true, message: '请输入验证码' },
                  { len: 6, message: '验证码为6位数字' }
                ]"
              >
                <a-input-group compact>
                  <a-input
                    v-model:value="loginForm.code"
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
            </template>

            <div class="form-options">
              <a-checkbox v-model:checked="loginForm.rememberMe">记住我</a-checkbox>
              <a href="#" @click.prevent="handleForgotPassword">忘记密码？</a>
            </div>
            <a-button type="primary" html-type="submit" :loading="loading" block size="large">
              登录
            </a-button>
          </a-form>
        </div>
      </div>

      <!-- 注册表单 -->
      <div class="form-container sign-up-container" v-if="activeForm === 'register'">
        <div class="form-content">
          <h1>注册</h1>
          <a-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            @finish="handleRegister"
          >
            <!-- 注册方式切换 -->
            <a-form-item>
              <a-radio-group v-model:value="registerForm.registerType" button-style="solid" @change="handleRegisterTypeChange">
                <a-radio-button value="phone">手机号注册</a-radio-button>
                <a-radio-button value="email">邮箱注册</a-radio-button>
              </a-radio-group>
            </a-form-item>

            <!-- 用户名 -->
            <a-form-item
              name="username"
              :rules="[
                { required: true, message: '请输入用户名' },
                { min: 2, message: '用户名至少2个字符' },
                { max: 20, message: '用户名最多20个字符' }
              ]"
            >
              <a-input
                v-model:value="registerForm.username"
                placeholder="请输入用户名"
                size="large"
              >
                <template #prefix>
                  <UserOutlined class="form-icon" />
                </template>
              </a-input>
            </a-form-item>

            <!-- 手机号/邮箱 -->
            <a-form-item
              name="account"
              :rules="registerAccountRules"
            >
              <a-input
                v-model:value="registerForm.account"
                :placeholder="registerAccountPlaceholder"
                size="large"
              >
                <template #prefix>
                  <component :is="registerAccountIcon" class="form-icon" />
                </template>
              </a-input>
            </a-form-item>

            <!-- 验证码 -->
            <a-form-item
              name="code"
              :rules="[
                { required: true, message: '请输入验证码' },
                { len: 6, message: '验证码为6位数字' }
              ]"
            >
              <a-input-group compact>
                <a-input
                  v-model:value="registerForm.code"
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
                  :disabled="!!registerCountdown || !isValidRegisterAccount"
                  :loading="sendingRegisterCode"
                  class="verify-code-btn"
                  size="large"
                  @click="handleSendRegisterCode"
                >
                  {{ registerCountdown ? `${registerCountdown}s后重试` : '获取验证码' }}
                </a-button>
              </a-input-group>
            </a-form-item>

            <!-- 密码 -->
            <a-form-item
              name="password"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码不能少于6个字符' },
                { max: 20, message: '密码不能超过20个字符' }
              ]"
            >
              <a-input-password
                v-model:value="registerForm.password"
                placeholder="请输入密码"
                size="large"
              >
                <template #prefix>
                  <LockOutlined class="form-icon" />
                </template>
              </a-input-password>
            </a-form-item>

            <!-- 确认密码 -->
            <a-form-item
              name="confirmPassword"
              :rules="[
                { required: true, message: '请确认密码' },
                { validator: validateConfirmPassword }
              ]"
            >
              <a-input-password
                v-model:value="registerForm.confirmPassword"
                placeholder="请确认密码"
                size="large"
              >
                <template #prefix>
                  <LockOutlined class="form-icon" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-button type="primary" html-type="submit" :loading="loading" block size="large">
              注册
            </a-button>
          </a-form>
        </div>
      </div>

      <!-- 忘记密码表单 -->
      <div class="form-container forgot-password-container" v-if="activeForm === 'forgot'">
        <ForgotPasswordForm @backToLogin="showLogin" />
      </div>

      <!-- 遮罩层 -->
      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel overlay-left">
            <h1>欢迎回来！</h1>
            <p>请使用您的账号登录系统</p>
            <a-button ghost size="large" @click="showLogin">
              去登录
            </a-button>
          </div>
          <div class="overlay-panel overlay-right">
            <h1>你好！</h1>
            <p>立即注册账号，开启您的购物之旅</p>
            <a-button ghost size="large" @click="showRegister">
              去注册
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  UserOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/store'
import type { LoginParams, LoginType, CodeType } from '@/api/auth'
import type { FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { sendCode, register } from '@/api/auth'
import { usePermissionStore } from '@/store'
import ForgotPasswordForm from '@/components/ForgotPasswordForm.vue'
import CryptoJS from 'crypto-js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 新增activeForm变量，替代isSignUpMode
const activeForm = ref<'login' | 'register' | 'forgot'>('login')

// 加载状态
const loading = ref(false)
const sendingCode = ref(false)

// 倒计时
const countdown = ref(0)
let timer: NodeJS.Timeout | null = null

// 表单引用
const formRef = ref<FormInstance>()

// 登录表单数据
const loginForm = reactive({
  account: '',
  password: '',
  code: '',
  loginType: 'phone' as LoginType,
  rememberMe: false
})

// 注册表单引用
const registerFormRef = ref<FormInstance>()

// 注册表单数据
const registerForm = reactive({
  username: '',
  account: '',
  password: '',
  confirmPassword: '',
  code: '',
  registerType: 'phone' as 'phone' | 'email'
})

// 注册倒计时
const registerCountdown = ref(0)
const sendingRegisterCode = ref(false)
let registerTimer: NodeJS.Timeout | null = null

// 获取账号输入框占位符
const getAccountPlaceholder = computed(() => {
  switch (loginForm.loginType) {
    case 'phone':
      return '请输入手机号'
    case 'email':
      return '请输入邮箱'
    case 'sms':
      return '请输入手机号'
    default:
      return '请输入手机号'
  }
})

// 获取账号输入框图标
const getAccountIcon = computed(() => {
  switch (loginForm.loginType) {
    case 'phone':
    case 'sms':
      return MobileOutlined
    case 'email':
      return MailOutlined
    default:
      return UserOutlined
  }
})

// 验证手机号是否有效
const isValidPhone = computed(() => {
  return (loginForm.loginType === 'phone' || loginForm.loginType === 'sms') && 
         /^1[3-9]\d{9}$/.test(loginForm.account)
})

// 注册账号占位符
const registerAccountPlaceholder = computed(() => {
  return registerForm.registerType === 'phone' ? '请输入手机号' : '请输入邮箱'
})

// 注册账号图标
const registerAccountIcon = computed(() => {
  return registerForm.registerType === 'phone' ? MobileOutlined : MailOutlined
})

// 验证注册账号是否有效
const isValidRegisterAccount = computed(() => {
  if (registerForm.registerType === 'phone') {
    return /^1[3-9]\d{9}$/.test(registerForm.account)
  } else {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(registerForm.account)
  }
})

// 表单验证规则
const rules = {
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码不能少于6个字符' }
  ]
}

// 验证确认密码
const validateConfirmPassword = async (_rule: Rule, value: string) => {
  if (!value) {
    return Promise.reject('请确认密码')
  }
  if (value !== registerForm.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 注册账号验证规则
const registerAccountRules = computed((): Rule[] => {
  if (registerForm.registerType === 'phone') {
    return [
      { required: true, message: '请输入手机号' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'change' }
    ]
  } else {
    return [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'change' }
    ]
  }
})

// 注册表单验证规则
const registerRules = computed(() => ({
  username: [
    { required: true, message: '请输入用户名' },
    { min: 2, message: '用户名至少2个字符' },
    { max: 20, message: '用户名最多20个字符' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码不能少于6个字符' },
    { max: 20, message: '密码不能超过20个字符' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    { validator: validateConfirmPassword }
  ],
  code: [
    { required: true, message: '请输入验证码' },
    { len: 6, message: '验证码为6位数字' }
  ],
  account: registerAccountRules.value
}))

// 处理登录方式切换
const handleLoginTypeChange = () => {
  // 清空账号输入
  loginForm.account = ''
  // 清空密码和验证码
  loginForm.password = ''
  loginForm.code = ''
  // 重置表单验证状态
  formRef.value?.resetFields()
}

// 账号验证规则
const accountRules = computed((): Rule[] => {
  switch (loginForm.loginType) {
    case 'phone':
    case 'sms':
      return [
        { required: true, message: '请输入手机号' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'change' }
      ]
    case 'email':
      return [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'change' }
      ]
    default:
      return [
        { required: true, message: '请输入手机号' }
      ]
  }
})

// 开始倒计时
const startCountdown = (seconds: number = 60) => {
  countdown.value = seconds
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      stopCountdown()
    }
  }, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  countdown.value = 0
}

// 处理发送验证码
const handleSendCode = async () => {
  try {
    sendingCode.value = true
    await sendCode({
      phone: loginForm.account,
      type: 'login' as CodeType
    })
    message.success('验证码已发送')
    startCountdown()
  } catch (error: any) {
    message.error(error.message || '发送验证码失败')
  } finally {
    sendingCode.value = false
  }
}

// 处理登录
const handleLogin = async () => {
  try {
    loading.value = true
    await formRef.value?.validate()
    
    // 构建登录参数
    const loginParams: LoginParams = {
      account: loginForm.account,
      loginType: loginForm.loginType
    }

    // 根据登录方式设置不同的参数
    if (loginForm.loginType === 'sms') {
      loginParams.code = loginForm.code
    } else {
      // 使用crypto-js进行MD5加密
      loginParams.password = CryptoJS.MD5(loginForm.password).toString()
    }

    // 调用登录接口
    await userStore.login(loginParams)

    // 记住账号
    if (loginForm.rememberMe) {
      localStorage.setItem('rememberMe', 'true')
      localStorage.setItem('account', loginForm.account)
      localStorage.setItem('loginType', loginForm.loginType)
    } else {
      localStorage.removeItem('rememberMe')
      localStorage.removeItem('account')
      localStorage.removeItem('loginType')
    }

    // 获取用户菜单并生成路由
    const permissionStore = usePermissionStore()
    await permissionStore.generateRoutes()

    message.success('登录成功')
    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch (error: any) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 登录/注册/忘记密码切换方法
const showLogin = () => { activeForm.value = 'login' }
const showRegister = () => { activeForm.value = 'register' }
const showForgot = () => { activeForm.value = 'forgot' }

// 修改handleForgotPassword
const handleForgotPassword = () => {
  activeForm.value = 'forgot'
}

// 处理注册方式切换
const handleRegisterTypeChange = () => {
  registerForm.account = ''
  registerForm.code = ''
  registerFormRef.value?.resetFields(['account', 'code'])
  stopRegisterCountdown()
}

// 开始注册倒计时
const startRegisterCountdown = (seconds: number = 60) => {
  registerCountdown.value = seconds
  registerTimer = setInterval(() => {
    if (registerCountdown.value > 0) {
      registerCountdown.value--
    } else {
      stopRegisterCountdown()
    }
  }, 1000)
}

// 停止注册倒计时
const stopRegisterCountdown = () => {
  if (registerTimer) {
    clearInterval(registerTimer)
    registerTimer = null
  }
  registerCountdown.value = 0
}

// 处理发送注册验证码
const handleSendRegisterCode = async () => {
  try {
    sendingRegisterCode.value = true
    await sendCode({
      ...(registerForm.registerType === 'phone' 
        ? { phone: registerForm.account }
        : { email: registerForm.account }),
      type: 'register' as CodeType
    })
    message.success('验证码已发送')
    startRegisterCountdown()
  } catch (error: any) {
    message.error(error.message || '发送验证码失败')
  } finally {
    sendingRegisterCode.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    loading.value = true
    await registerFormRef.value?.validate()
    
    // 构建注册参数
    const registerParams = {
      username: registerForm.username,
      password: CryptoJS.MD5(registerForm.password).toString(), // 使用crypto-js进行MD5加密
      code: registerForm.code,
      registerType: registerForm.registerType,
      ...(registerForm.registerType === 'phone' 
        ? { phone: registerForm.account }
        : { email: registerForm.account })
    }

    await register(registerParams)
    message.success('注册成功')
    activeForm.value = 'login'
  } catch (error: any) {
    message.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

// 初始化记住的账号
const initRememberMe = () => {
  const rememberMe = localStorage.getItem('rememberMe')
  if (rememberMe) {
    loginForm.rememberMe = true
    loginForm.account = localStorage.getItem('account') || ''
    loginForm.loginType = (localStorage.getItem('loginType') || 'phone') as LoginType
  }
}

// 页面加载时初始化
initRememberMe()

// 组件卸载时清理定时器
onUnmounted(() => {
  stopCountdown()
  stopRegisterCountdown()
})
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(45deg, #001529, #003a70);
  padding: 20px;
  
  .login-box {
    position: relative;
    width: 900px;
    min-height: 600px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;

    &.right-panel-active {
      .sign-in-container {
        transform: translateX(100%);
        opacity: 0;
        visibility: hidden;
        transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s ease-in-out, visibility 0.5s;
      }
      
      .sign-up-container {
        transform: translateX(100%);
        opacity: 1;
        visibility: visible;
        z-index: 5;
        transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s ease-in-out 0.2s, visibility 0s 0.2s;
      }
      
      .overlay-container {
        transform: translateX(-100%);
        transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      
      .overlay {
        transform: translateX(50%);
        transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      
      .overlay-left {
        transform: translateX(0);
        opacity: 1;
        transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s ease-in-out 0.2s;
      }
      
      .overlay-right {
        transform: translateX(20%);
        opacity: 0;
        transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s ease-in-out;
      }
    }
  }

  .form-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    visibility: visible;

    .form-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 50px;
      text-align: center;

      h1 {
        margin-bottom: 32px;
        font-size: 32px;
        font-weight: bold;
        color: #001529;
      }

      :deep(.ant-form) {
        width: 100%;
        max-width: 320px;

        .ant-form-item {
          margin-bottom: 24px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .ant-input-affix-wrapper {
          padding: 8px 16px;
          height: 48px;
          border-radius: 8px;
          border: 2px solid #e8e8e8;
          transition: all 0.3s ease;
          
          .form-icon {
            color: #bfbfbf;
            font-size: 18px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          &:hover {
            border-color: #001529;
            
            .form-icon {
              color: #001529;
            }
          }

          &-focused {
            border-color: #001529;
            box-shadow: 0 0 0 2px rgba(0, 21, 41, 0.1);
            
            .form-icon {
              color: #001529;
            }
          }
        }

        .ant-input {
          font-size: 16px;
        }

        .ant-btn {
          height: 48px;
          font-size: 16px;
          border-radius: 8px;
          margin-top: 8px;
          background-color: #001529;
          border-color: #001529;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          
          &:hover, &:focus {
            background-color: #003a70;
            border-color: #003a70;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
          }
        }

        .ant-checkbox-wrapper {
          color: #666;
          font-size: 14px;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #001529;
          border-color: #001529;
        }
      }

      .form-options {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin: 24px 0;
        
        a {
          color: #001529;
          font-size: 14px;
          transition: all 0.3s ease;
          
          &:hover {
            color: #003a70;
            text-decoration: underline;
          }
        }
      }
    }
  }

  .sign-in-container {
    z-index: 2;
  }

  .sign-up-container {
    opacity: 0;
    visibility: hidden;
    z-index: 1;
  }

  .overlay-container {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 100;
  }

  .overlay {
    position: relative;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(to right, #001529, #003a70);
    color: #fff;
    transform: translateX(0);
    transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    .overlay-panel {
      position: absolute;
      top: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 50%;
      height: 100%;
      padding: 0 60px;
      text-align: center;
      transform: translateX(0);
      transition: all 0.7s ease-in-out;

      h1 {
        margin-bottom: 32px;
        font-size: 36px;
        font-weight: bold;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      p {
        margin-bottom: 40px;
        font-size: 18px;
        line-height: 1.6;
        opacity: 0.9;
      }

      .ant-btn {
        height: 48px;
        padding: 0 32px;
        font-size: 16px;
        border: 2px solid #fff;
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .overlay-left {
      transform: translateX(-20%);
      opacity: 0;
    }

    .overlay-right {
      right: 0;
      transform: translateX(0);
      opacity: 1;
    }
  }

  .verify-code-btn {
    width: 120px !important;
    height: 48px !important;
    margin-top: 0 !important;
    background-color: #1890ff !important;
    border-color: #1890ff !important;
    color: #fff !important;
    
    &:hover:not(:disabled) {
      background-color: #40a9ff !important;
      border-color: #40a9ff !important;
    }
    
    &:disabled {
      background-color: #f5f5f5 !important;
      border-color: #d9d9d9 !important;
      color: rgba(0, 0, 0, 0.25) !important;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    padding: 16px;
    
    .login-box {
      width: 100%;
      min-height: 500px;
    }

    .form-content {
      padding: 30px;
    }

    .overlay-panel {
      padding: 0 30px;

      h1 {
        font-size: 28px;
      }

      p {
        font-size: 16px;
      }
    }
  }
}
</style>