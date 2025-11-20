<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 尺寸：'xs' | 'sm' | 'md' | 'lg'
  size: {
    type: String,
    default: 'md'
  },
  // 文字
  text: {
    type: String,
    default: ''
  },
  // 是否居中显示
  center: {
    type: Boolean,
    default: false
  }
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  }
  return sizes[props.size] || sizes.md
})

const containerClasses = computed(() => {
  return props.center ? 'flex justify-center items-center' : 'inline-flex items-center'
})
</script>

<template>
  <div :class="containerClasses">
    <div
      :class="sizeClasses"
      class="spinner border-blue-500 border-t-transparent rounded-full animate-spin"
      role="status"
      aria-label="加载中"
    ></div>
    <span v-if="text" class="ml-2 text-sm text-gray-600 dark:text-gray-400">{{ text }}</span>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
