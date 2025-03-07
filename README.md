# 惠农商城后台管理系统

基于 Vue3 + TypeScript + Vite + Ant Design Vue + Pinia 开发的现代化后台管理系统

## 技术栈

- 核心框架：Vue 3
- 开发语言：TypeScript
- 构建工具：Vite 5
- UI 框架：Ant Design Vue 4.x
- 状态管理：Pinia
- 路由管理：Vue Router 4
- HTTP 请求：Axios
- 代码规范：ESLint + Prettier
- Git 提交规范：Commitlint
- 样式预处理：Less
- 权限管理：RBAC (基于角色的访问控制)

## 项目功能

### 1. 系统管理
- 用户管理
  - 管理员列表
  - 角色分配
  - 权限设置
- 角色管理
  - 角色列表
  - 权限分配
  - 角色创建/编辑
- 权限管理
  - 菜单权限
  - 按钮权限
  - 数据权限

$$- 系统设置
  - 基础配置
  - 系统日志
  - 操作日志

### 2. 商品管理
- 商品分类
  - 分类列表
  - 分类层级管理
  - 分类属性设置
- 商品管理
  - 商品列表
  - 商品上下架
  - 商品审核
  - 商品编辑
- 规格管理
  - 规格模板
  - 规格属性

$$- 规格值
- 库存管理
  - 库存监控
  - 库存预警
  - 库存日志

### 3. 订单管理
- 订单列表
  - 订单查询
  - 订单详情
  - 订单状态管理
- 订单处理
  - 发货管理
  - 退款处理
  - 订单备注
- 售后服务
  - 退货管理
  - 换货管理
  - 维修管理


### 5. 商户管理
- 商户列表
  - 商户信息
  - 商户审核
  - 商户评级
- 结算管理
  - 结算周期
  - 结算记录
  - 结算规则

### 6. 营销管理
- 活动管理
  - 秒杀活动
  - 拼团活动
  - 砍价活动
- 优惠管理
  - 优惠券
  - 满减活动
  - 折扣活动
- 推广管理
  - 广告位
  - 轮播图
  - 推荐位

### 7. 数据统计
- 销售统计
  - 销售额统计
  - 订单量统计
  - 商品销量
- 用户统计
  - 用户增长
  - 用户活跃度
  - 用户分布
- 商户统计
  - 商户销量
  - 商户评分
  - 商户活跃度

## 项目结构

```
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── composables/      # 组合式函数
├── config/           # 配置文件
├── directives/       # 自定义指令
├── hooks/            # 钩子函数
├── layouts/          # 布局组件
├── router/           # 路由配置
├── store/            # 状态管理
├── styles/           # 全局样式
├── types/            # 类型定义
├── utils/            # 工具函数
└── views/            # 页面文件
```

## 开发规范

1. 组件开发规范
   - 使用 Vue3 组合式 API (setup)
   - 统一使用 TypeScript
   - 组件名称使用 PascalCase
   - 属性名称使用 camelCase

2. 代码风格规范
   - 使用 ESLint + Prettier 进行代码格式化
   - 遵循 TypeScript 严格模式
   - 使用 Vue3 标准代码风格

3. Git 提交规范
   - feat: 新功能
   - fix: 修复
   - docs: 文档
   - style: 格式
   - refactor: 重构
   - test: 测试
   - chore: 构建过程或辅助工具的变动

## 安装和运行

```bash
# 安装依赖
pnpm install

# 开发环境运行
pnpm dev

# 生产环境打包
pnpm build

# 代码格式化
pnpm lint

# 类型检查
pnpm type-check
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 13
- Edge >= 88

## 开发计划

1. 第一阶段：基础框架搭建
   - 项目初始化
   - 路由配置
   - 权限系统
   - 基础布局

2. 第二阶段：核心功能开发
   - 系统管理
   - 商品管理
   - 订单管理
   - 会员管理

3. 第三阶段：扩展功能开发
   - 商户管理
   - 营销管理
   - 数据统计
   - 系统设置

4. 第四阶段：系统优化
   - 性能优化
   - 体验优化
   - 安全加固
   - 自动化测试

## 系统完善记录

### 2024-xx-xx 权限系统增强

1. **HTTP请求增强**
   - 添加请求取消功能，避免重复请求
   - 实现请求重试机制，提高系统稳定性
   - 优化响应拦截器，更好地处理错误情况

2. **权限管理系统完善**
   - 基于RBAC模型重构权限系统
   - 支持基于角色的动态路由生成
   - 实现前端按钮级别权限控制
   - 支持从后端获取权限数据

3. **权限指令实现**
   - `v-permission` 通用权限控制指令
   - `v-has-button` 按钮权限控制指令
   - `v-has-role` 角色权限控制指令

4. **权限工具类**
   - 创建 `PermissionChecker` 工具类
   - 实现权限验证装饰器 `withPermission`
   - 支持复杂的权限判断逻辑

5. **用户认证优化**
   - 重构用户认证流程
   - 支持多角色和多权限
   - 优化登录和登出逻辑
   - 增加刷新Token和修改密码功能

### 后续计划

1. **组件优化**
   - 封装通用业务组件
   - 实现更多自定义指令

2. **性能优化**
   - 路由懒加载
   - 组件异步加载
   - 图片懒加载
   - 虚拟滚动列表

3. **用户体验提升**
   - 添加页面加载进度条
   - 优化表单交互
   - 实现数据缓存

4. **安全性增强**
   - XSS防御
   - CSRF防御
   - 请求加密

## 图标组件使用说明

项目中使用了统一的图标组件 `IconProvider` 来管理所有图标，提高了代码复用率和可维护性。

### 基本使用

```vue
<template>
  <IconProvider name="home" />
</template>

<script setup>
import IconProvider from '@/components/IconProvider.vue'
</script>
```

### 图标名称

所有图标名称都在 `src/utils/icons.ts` 文件中定义，可以通过 `ICON_NAMES` 常量获取：

```vue
<template>
  <IconProvider :name="ICON_NAMES.HOME" />
</template>

<script setup>
import IconProvider from '@/components/IconProvider.vue'
import { ICON_NAMES } from '@/utils/icons'
</script>
```

### 可用图标列表

项目中可用的图标列表可以通过 `ICON_LIST` 常量获取，常用于图标选择器等场景：

```vue
<template>
  <div v-for="icon in ICON_LIST" :key="icon">
    <IconProvider :name="icon" />
    {{ icon }}
  </div>
</template>

<script setup>
import IconProvider from '@/components/IconProvider.vue'
import { ICON_LIST } from '@/utils/icons'
</script>
```

### 图标分类

图标按照以下分类进行组织：

1. 导航和菜单：dashboard, home, menu, bars 等
2. 布局控制：menu-fold, menu-unfold, fullscreen 等
3. 用户和权限：user, team, key, lock 等
4. 商品和订单：shopping, shopping-cart, appstore 等
5. 文件和表单：file-text, form, table, profile 等
6. 操作图标：plus, minus, edit, delete, search 等
7. 状态图标：check, close, info, question, exclamation 等
8. 其他：calendar, customer-service, bell 等
