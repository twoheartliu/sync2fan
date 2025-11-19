<script setup>
import { safeGet, getMediaAttachments } from '@/utils/helpers'
import { formatTimeAgo } from '@/utils/formatters'
import MediaAttachment from './MediaAttachment.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

</script>

<template>
  <div>
    <!-- 用户信息 -->
    <div class="flex items-center space-x-2 flex-wrap">
      <span class="font-bold truncate">
        {{ safeGet(post, 'reblog.account.display_name',
          safeGet(post, 'reblog.account.username',
            safeGet(post, 'account.display_name',
              safeGet(post, 'account.username', '未知用户')))) }}
      </span>
      <span class="text-sm text-gray-500">
        @{{ safeGet(post, 'reblog.account.acct', safeGet(post, 'account.acct', '')) }}
      </span>
      <span class="text-sm text-gray-500">·</span>
      <span class="text-sm text-gray-500">
        {{ formatTimeAgo(post.createdAt) }}
      </span>
      <i class="fab fa-mastodon text-purple-500 ml-1"></i>

      <!-- 转发标记 -->
      <span v-if="post.reblog" class="ml-2 text-sm text-gray-500">
        <i class="fas fa-retweet mr-1"></i> 转发
      </span>
    </div>

    <!-- 转发者信息 -->
    <div v-if="post.reblog" class="mt-1 text-sm text-gray-500">
      <span class="font-medium">{{ safeGet(post, 'account.display_name', safeGet(post, 'account.username', ''))
      }}</span> 转发了
    </div>

    <!-- 消息内容 -->
    <div class="mt-2 text-sm md:text-base">
      <!-- Mastodon 内容 - 需要处理HTML -->
      <div v-html="safeGet(post, 'reblog.content', safeGet(post, 'content', ''))"></div>

      <!-- 媒体附件 -->
      <MediaAttachment :media="getMediaAttachments(post)" />

      <!-- 卡片 -->
      <div v-if="(safeGet(post, 'reblog.card') || safeGet(post, 'card'))"
        class="mt-3 border border-gray-700 rounded-lg overflow-hidden">
        <a :href="safeGet(post, 'reblog.card.url', safeGet(post, 'card.url', '#'))" target="_blank" class="block">
          <div v-if="safeGet(post, 'reblog.card.image', safeGet(post, 'card.image'))" class="aspect-video bg-gray-800">
            <img :src="safeGet(post, 'reblog.card.image', safeGet(post, 'card.image'))" class="w-full h-full object-cover"
              :alt="safeGet(post, 'reblog.card.title', safeGet(post, 'card.title', ''))">
          </div>
          <div class="p-3">
            <div class="font-bold text-sm">{{ safeGet(post, 'reblog.card.title', safeGet(post, 'card.title', '')) }}
            </div>
            <div class="text-xs text-gray-500 mt-1 line-clamp-2">
              {{ safeGet(post, 'reblog.card.description', safeGet(post, 'card.description', '')) }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ safeGet(post, 'reblog.card.provider_name', safeGet(post, 'card.provider_name', '')) }}
            </div>
          </div>
        </a>
      </div>

      <!-- 投票 -->
      <div v-if="safeGet(post, 'reblog.poll') || safeGet(post, 'poll')"
        class="mt-3 p-3 border border-gray-700 rounded-lg">
        <div v-for="(option, index) in safeGet(post, 'reblog.poll.options', safeGet(post, 'poll.options', []))"
          :key="index" class="mb-2 last:mb-0">
          <div class="flex items-center">
            <div class="w-full bg-gray-700 rounded-full h-6 mr-2 relative overflow-hidden">
              <div class="bg-blue-600 h-full rounded-full" :style="{
                width: `${option.votes_count / safeGet(post, 'reblog.poll.votes_count', safeGet(post, 'poll.votes_count', 1)) * 100}%`
              }"></div>
              <div class="absolute inset-0 flex items-center px-3">
                <span class="text-xs text-white">{{ option.title }}</span>
              </div>
            </div>
            <span class="text-xs whitespace-nowrap">
              {{ option.votes_count }} 票
            </span>
          </div>
        </div>
        <div class="text-xs text-gray-500 mt-2">
          总票数: {{ safeGet(post, 'reblog.poll.votes_count', safeGet(post, 'poll.votes_count', 0)) }}
          <span v-if="safeGet(post, 'reblog.poll.expired', safeGet(post, 'poll.expired', false))" class="ml-2">
            (已结束)
          </span>
          <span v-else class="ml-2">
            ({{ formatTimeAgo(safeGet(post, 'reblog.poll.expires_at', safeGet(post, 'poll.expires_at', '')))
            }}结束)
          </span>
        </div>
      </div>
    </div>

    <!-- 交互按钮 -->
    <div class="flex flex-wrap gap-4 mt-3 text-sm">
      <button class="flex items-center space-x-2 hover:text-blue-400">
        <i class="far fa-comment"></i>
        <span>{{ safeGet(post, 'reblog.replies_count', safeGet(post, 'replies_count', 0)) }}</span>
      </button>
      <button class="flex items-center space-x-2 hover:text-green-400">
        <i class="fas fa-retweet"></i>
        <span>{{ safeGet(post, 'reblog.reblogs_count', safeGet(post, 'reblogs_count', 0)) }}</span>
      </button>
      <button class="flex items-center space-x-2 hover:text-red-400">
        <i class="far fa-heart"></i>
        <span>{{ safeGet(post, 'reblog.favourites_count', safeGet(post, 'favourites_count', 0)) }}</span>
      </button>
      <button class="flex items-center space-x-2 hover:text-blue-400">
        <i class="far fa-bookmark"></i>
      </button>
    </div>
  </div>
</template>