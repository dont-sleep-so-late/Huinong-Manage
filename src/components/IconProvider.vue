<template>
  <component :is="iconComponent" v-if="iconComponent" v-bind="$attrs" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import * as Icons from '@ant-design/icons-vue'
import { getIconComponentName } from '@/utils/icons'

export default defineComponent({
  name: 'IconProvider',
  props: {
    name: {
      type: String,
      required: false,
      default: ''
    }
  },
  setup(props) {
    // 计算图标组件
    const iconComponent = computed(() => {
      if (!props.name) return null
      
      // 获取图标组件名称
      const iconName = getIconComponentName(props.name)
      
      // 返回对应的图标组件
      return (Icons as any)[iconName] || null
    })

    return {
      iconComponent
    }
  }
})
</script> 