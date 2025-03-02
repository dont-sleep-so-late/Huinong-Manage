<template>
  <div class="not-found">
    <a-result
      status="404"
      title="404"
      sub-title="抱歉，您访问的页面不存在。"
    >
      <template #extra>
        <a-button type="primary" @click="$router.push('/')">
          返回首页
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script lang="ts" setup>
// 空组件，仅作为后备方案
</script>

<style lang="less" scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style> 