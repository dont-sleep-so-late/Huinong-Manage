import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'

/**
 * 权限控制工具类
 * 用于在组件中控制元素的显示/隐藏
 */
export class PermissionChecker {
  /**
   * 检查是否有指定权限
   * @param permission 权限标识
   * @returns 是否有权限
   */
  static hasPermission(permission: string): boolean {
    const userStore = useUserStore()
    return userStore.hasPermission(permission)
  }

  /**
   * 检查是否有指定角色
   * @param role 角色标识
   * @returns 是否有角色
   */
  static hasRole(role: string): boolean {
    const userStore = useUserStore()
    return userStore.hasRole(role)
  }

  /**
   * 检查是否有任意一个指定权限
   * @param permissions 权限标识数组
   * @returns 是否有权限
   */
  static hasAnyPermission(permissions: string[]): boolean {
    const userStore = useUserStore()
    return userStore.hasAnyPermission(permissions)
  }

  /**
   * 检查是否有任意一个指定角色
   * @param roles 角色标识数组
   * @returns 是否有角色
   */
  static hasAnyRole(roles: string[]): boolean {
    const userStore = useUserStore()
    return userStore.hasAnyRole(roles)
  }

  /**
   * 检查是否有所有指定角色
   * @param roles 角色标识数组
   * @returns 是否有所有角色
   */
  static hasAllRoles(roles: string[]): boolean {
    const userStore = useUserStore()
    return userStore.hasAllRoles(roles)
  }

  /**
   * 检查是否有指定按钮权限
   * @param permission 按钮权限标识
   * @returns 是否有按钮权限
   */
  static hasButtonPermission(permission: string): boolean {
    const permissionStore = usePermissionStore()
    return permissionStore.hasButtonPermission(permission)
  }

  /**
   * 检查复杂权限条件
   * @param condition 权限条件对象
   * @returns 是否满足条件
   */
  static checkPermission(condition: {
    permission?: string | string[]
    role?: string | string[]
    allRoles?: string[]
    button?: string
  }): boolean {
    const { permission, role, allRoles, button } = condition
    
    // 检查各种权限条件
    const permissionResult = permission
      ? Array.isArray(permission)
        ? this.hasAnyPermission(permission)
        : this.hasPermission(permission)
      : true

    const roleResult = role
      ? Array.isArray(role)
        ? this.hasAnyRole(role)
        : this.hasRole(role)
      : true

    const allRolesResult = allRoles 
      ? this.hasAllRoles(allRoles)
      : true

    const buttonResult = button
      ? this.hasButtonPermission(button)
      : true

    // 所有条件都必须满足
    return permissionResult && roleResult && allRolesResult && buttonResult
  }
}

/**
 * 权限验证装饰器 - 用于装饰组合式函数
 * @param condition 权限条件
 * @param fallback 无权限时的返回值
 * @returns 装饰后的函数
 */
export function withPermission<T extends (...args: any[]) => any>(
  fn: T,
  condition: string | string[] | { permission?: string | string[], role?: string | string[] },
  fallback?: ReturnType<T>
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    let hasPermission = false
    
    if (typeof condition === 'string') {
      hasPermission = PermissionChecker.hasPermission(condition)
    } else if (Array.isArray(condition)) {
      hasPermission = PermissionChecker.hasAnyPermission(condition)
    } else {
      hasPermission = PermissionChecker.checkPermission(condition)
    }
    
    if (hasPermission) {
      return fn(...args)
    }
    
    return fallback
  }
}

// 导出默认对象，方便在模板中使用
export default PermissionChecker 