<script setup>
import MastodonPostContent from './MastodonPostContent.vue'
import FanfouPostContent from './FanfouPostContent.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article :class="[
    'post-card relative rounded-lg border border-gray-700 p-4',
    post.source === 'mastodon' ? 'source-mastodon' : 'source-fanfou'
  ]">
    <div class="source-indicator"></div>
    <div class="flex items-start space-x-3">
      <!-- 头像 -->
      <img v-if="post.source === 'mastodon'" :src="post.reblog?.account?.avatar || post.account?.avatar || ''"
        class="w-10 h-10 rounded-full" alt="avatar">
      <img v-else :src="post.user?.profile_image_url || ''" class="w-10 h-10 rounded-full" alt="avatar">

      <div class="flex-1 min-w-0">
        <!-- 根据来源显示不同的内容组件 -->
        <MastodonPostContent v-if="post.source === 'mastodon'" :post="post" />
        <FanfouPostContent v-else :post="post" />
      </div>
    </div>
  </article>
</template>