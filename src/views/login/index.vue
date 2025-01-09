<template>
  <div class="login-container">
    <div class="login-box" :class="{ 'right-panel-active': isSignUpMode }">
      <!-- 登录表单 -->
      <div class="form-container sign-in-container">
        <div class="form-content">
          <h1>登录</h1>
          <div class="social-container">
            <a href="#" class="social">
              <WechatOutlined class="social-icon" />
            </a>
            <a href="#" class="social">
              <QqOutlined class="social-icon" />
            </a>
            <a href="#" class="social">
              <WeiboOutlined class="social-icon" />
            </a>
          </div>
          <span>或使用您的账号</span>
          <a-form
            :model="loginForm"
            @finish="handleLogin"
          >
            <a-form-item
              name="username"
              :rules="[{ required: true, message: '请输入用户名' }]"
            >
              <a-input
                v-model:value="loginForm.username"
                placeholder="用户名"
                size="large"
              >
                <template #prefix>
                  <UserOutlined class="form-icon" />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item
              name="password"
              :rules="[{ required: true, message: '请输入密码' }]"
            >
              <a-input-password
                v-model:value="loginForm.password"
                placeholder="密码"
                size="large"
              >
                <template #prefix>
                  <LockOutlined class="form-icon" />
                </template>
              </a-input-password>
            </a-form-item>
            <div class="form-options">
              <a-checkbox v-model:checked="loginForm.rememberMe">记住我</a-checkbox>
              <a href="#">忘记密码？</a>
            </div>
            <a-button type="primary" html-type="submit" :loading="loading" block size="large">
              登录
            </a-button>
          </a-form>
        </div>
      </div>

      <!-- 注册表单 -->
      <div class="form-container sign-up-container">
        <div class="form-content">
          <h1>注册</h1>
          <a-form
            :model="registerForm"
            @finish="handleRegister"
          >
            <a-form-item
              name="username"
              :rules="[{ required: true, message: '请输入用户名' }]"
            >
              <a-input
                v-model:value="registerForm.username"
                placeholder="用户名"
                size="large"
              >
                <template #prefix>
                  <UserOutlined class="form-icon" />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item
              name="email"
              :rules="[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入正确的邮箱格式' }
              ]"
            >
              <a-input
                v-model:value="registerForm.email"
                placeholder="邮箱"
                size="large"
              >
                <template #prefix>
                  <MailOutlined class="form-icon" />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item
              name="password"
              :rules="[{ required: true, message: '请输入密码' }]"
            >
              <a-input-password
                v-model:value="registerForm.password"
                placeholder="密码"
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

      <!-- 遮罩层 -->
      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel overlay-left">
            <h1>欢迎回来！</h1>
            <p>请使用您的账号登录系统</p>
            <a-button ghost size="large" @click="isSignUpMode = false">
              去登录
            </a-button>
          </div>
          <div class="overlay-panel overlay-right">
            <h1>你好！</h1>
            <p>立即注册账号，开启您的购物之旅</p>
            <a-button ghost size="large" @click="isSignUpMode = true">
              去注册
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  WechatOutlined,
  QqOutlined,
  WeiboOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/store'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 是否为注册模式
const isSignUpMode = ref(false)

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: ''
})

// 处理登录
const handleLogin = async () => {
  try {
    loading.value = true
    await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })
    message.success('登录成功')
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    loading.value = true
    // TODO: 调用注册接口
    message.success('注册成功')
    isSignUpMode.value = false
  } catch (error: any) {
    message.error(error.message || '注册失败')
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

      .social-container {
        margin: 24px 0 32px;
        
        .social {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 48px;
          height: 48px;
          margin: 0 12px;
          border: 2px solid #e8e8e8;
          border-radius: 50%;
          color: #001529;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          
          .social-icon {
            font-size: 20px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          &:hover {
            color: #fff;
            background-color: #001529;
            border-color: #001529;
            transform: translateY(-3px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
          }
        }
      }

      &>span {
        margin-bottom: 32px;
        color: #666;
        font-size: 16px;
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