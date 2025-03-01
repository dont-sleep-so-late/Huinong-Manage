import type { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'

/**
 * 权限指令，用于控制按钮、链接等元素的显示/隐藏
 * v-permission="'user:add'"  // 检查单个权限
 * v-permission="['user:add', 'user:edit']"  // 检查多个权限（任一满足）
 * v-permission="{role: 'admin'}"  // 检查角色
 * v-permission="{role: ['admin', 'manager']}"  // 检查多个角色（任一满足）
 * v-permission="{permission: 'user:add', role: 'admin'}"  // 同时检查权限和角色（都满足）
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    
    // 如果没有传值，直接返回
    if (!value) return
    
    let hasPermission = false
    
    // 根据不同类型的值进行权限判断
    if (typeof value === 'string') {
      // 单个权限
      hasPermission = userStore.hasPermission(value)
    } else if (Array.isArray(value)) {
      // 多个权限（任一满足）
      hasPermission = userStore.hasAnyPermission(value)
    } else if (typeof value === 'object') {
      // 对象形式
      const { permission, role } = value
      
      // 检查权限
      const hasRequiredPermission = permission
        ? Array.isArray(permission)
          ? userStore.hasAnyPermission(permission)
          : userStore.hasPermission(permission)
        : true
        
      // 检查角色
      const hasRequiredRole = role
        ? Array.isArray(role)
          ? userStore.hasAnyRole(role)
          : userStore.hasRole(role)
        : true
        
      // 同时满足权限和角色
      hasPermission = hasRequiredPermission && hasRequiredRole
    }
    
    // 如果没有权限，则隐藏元素
    if (!hasPermission) {
      // 从DOM中移除元素
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 按钮权限指令，用于控制按钮的显示/隐藏
 * v-has-button="'user:add'"
 */
export const hasButton: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const permissionStore = usePermissionStore()
    
    // 如果没有传值，直接返回
    if (!value) return
    
    // 检查是否有按钮权限
    const hasButtonPermission = permissionStore.hasButtonPermission(value)
    
    // 如果没有权限，则隐藏元素
    if (!hasButtonPermission) {
      // 从DOM中移除元素
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 角色权限指令，用于根据角色控制元素的显示/隐藏
 * v-has-role="'admin'"  // 检查单个角色
 * v-has-role="['admin', 'manager']"  // 检查多个角色（任一满足）
 */
export const hasRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    
    // 如果没有传值，直接返回
    if (!value) return
    
    // 根据不同类型的值进行角色判断
    const hasRequiredRole = Array.isArray(value)
      ? userStore.hasAnyRole(value)
      : userStore.hasRole(value)
    
    // 如果没有所需角色，则隐藏元素
    if (!hasRequiredRole) {
      // 从DOM中移除元素
      el.parentNode?.removeChild(el)
    }
  }
}

// 批量注册权限指令
export default {
  install(app: App) {
    app.directive('permission', permission)
    app.directive('has-button', hasButton)
    app.directive('has-role', hasRole)
  }
} 