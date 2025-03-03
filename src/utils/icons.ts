/**
 * 图标工具类
 * 集中管理所有图标名称，提高复用率
 */

// 常用图标名称
export const ICON_NAMES = {
  // 导航和菜单
  DASHBOARD: 'dashboard',
  HOME: 'home',
  MENU: 'menu',
  BARS: 'bars',
  
  // 布局控制
  MENU_FOLD: 'menu-fold',
  MENU_UNFOLD: 'menu-unfold',
  FULLSCREEN: 'fullscreen',
  FULLSCREEN_EXIT: 'fullscreen-exit',
  
  // 用户和权限
  USER: 'user',
  TEAM: 'team',
  KEY: 'key',
  LOCK: 'lock',
  UNLOCK: 'unlock',
  
  // 商品和订单
  SHOPPING: 'shopping',
  SHOPPING_CART: 'shopping-cart',
  APPSTORE: 'appstore',
  GIFT: 'gift',
  ORDERED_LIST: 'ordered-list',
  
  // 文件和表单
  FILE_TEXT: 'file-text',
  FORM: 'form',
  TABLE: 'table',
  PROFILE: 'profile',
  
  // 操作图标
  PLUS: 'plus',
  MINUS: 'minus',
  EDIT: 'edit',
  DELETE: 'delete',
  SEARCH: 'search',
  EYE: 'eye',
  SETTING: 'setting',
  TOOL: 'tool',
  
  // 状态图标
  CHECK: 'check',
  CLOSE: 'close',
  INFO: 'info',
  QUESTION: 'question',
  EXCLAMATION: 'exclamation',
  
  // 其他
  CALENDAR: 'calendar',
  CUSTOMER_SERVICE: 'customer-service',
  BELL: 'bell',
  UNORDERED_LIST: 'unordered-list',
  LOGOUT: 'logout'
}

// 图标列表（用于选择器等场景）
export const ICON_LIST = Object.values(ICON_NAMES)

/**
 * 获取图标组件名称
 * @param name 图标名称
 * @returns 图标组件名称
 */
export const getIconComponentName = (name: string): string => {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('') + 'Outlined'
} 