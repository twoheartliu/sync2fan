<script setup>
import { safeGet } from '@/utils/helpers'
import { formatTimeAgo } from '@/utils/formatters'
import MediaAttachment from './MediaAttachment.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

// 定义事件，用于向父组件传递预览图片的请求
const emit = defineEmits(['preview-image'])

// 获取媒体附件
function getMediaAttachments(post) {
  return post.photo ? [post.photo] : []
}

// 处理图片预览
const handlePreviewImage = (imageUrl) => {
  emit('preview-image', imageUrl)
}
</script>

<template>
  <div>
    <!-- 用户信息 -->
    <div class="flex items-center space-x-2 flex-wrap">
      <span class="font-bold truncate">
        {{ safeGet(post, 'user.name', '未知用户') }}
      </span>
      <span class="text-sm text-gray-500">
        @{{ safeGet(post, 'user.screen_name', '') }}
      </span>
      <span class="text-sm text-gray-500">·</span>
      <span class="text-sm text-gray-500">
        {{ formatTimeAgo(post.created_at) }}
      </span>

      <!-- 受保护账号标记 -->
      <span v-if="safeGet(post, 'user.protected', false)" class="text-sm text-gray-500" title="受保护的账号">
        <i class="fas fa-lock text-xs"></i>
      </span>

      <Icon name="fanfou" class="text-blue-400 ml-1" />

      <!-- 转发标记 -->
      <span v-if="post.repost_status_id" class="ml-2 text-sm text-gray-500">
        <i class="fas fa-retweet mr-1"></i> 转发
      </span>
    </div>

    <!-- 发布应用信息 -->
    <div class="text-xs text-gray-500 mt-1">
      通过 <span v-html="post.application || '网页'"></span>
    </div>

    <!-- 转发者信息 -->
    <div v-if="post.repost_status_id && post.repost_screen_name" class="mt-1 text-sm text-gray-500">
      转自 <span class="font-medium">@{{ post.repost_screen_name }}</span>
    </div>

    <!-- 消息内容 -->
    <p class="mt-2 text-sm md:text-base">
      {{ post.text }}
    </p>

    <!-- 媒体附件 -->
    <MediaAttachment :media="getMediaAttachments(post)" @preview-image="handlePreviewImage" />

    <!-- 交互按钮 -->
    <div class="flex flex-wrap gap-4 mt-3 text-sm">
      <button class="flex items-center space-x-2 hover:text-blue-400">
        <i class="far fa-comment"></i>
      </button>
      <button class="flex items-center space-x-2 hover:text-green-400">
        <i class="fas fa-retweet"></i>
      </button>
      <button class="flex items-center space-x-2 hover:text-red-400">
        <i class="far fa-heart"></i>
      </button>
    </div>
  </div>
</template>