<script setup>
import loadingGif from '@/assets/ajax-indicator.gif'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['load-more'])

function loadMore () {
  if (!props.loading && props.hasMore) {
    emit('load-more')
  }
}
</script>

<template>
  <div class="text-center py-4">
    <button @click="loadMore" class="px-6 py-2 rounded-full border border-gray-700 hover:bg-gray-700"
      :disabled="loading || !hasMore">
      <span v-if="loading">
        <img :src="loadingGif" alt="loading" class="inline h-4 mr-2">
        加载中...
      </span>
      <span v-else-if="!hasMore">没有更多了</span>
      <span v-else>加载更多</span>
    </button>
  </div>
</template>