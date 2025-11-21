<script setup>
import { ref, onMounted, computed } from 'vue'
import { safeGet, getMediaAttachments } from '@/utils/helpers'
import { formatTimeAgo } from '@/utils/formatters'
import MediaAttachment from './MediaAttachment.vue'
import { apis } from '@/utils/mastodon'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

// 定义事件，用于向父组件传递预览图片的请求
const emit = defineEmits(['preview-image', 'toggle-comments'])

// 控制内容警告的展开/收起
const showSpoilerContent = ref(false)

// 父级消息（如果是回复）
const parentPost = ref(null)
const loadingParent = ref(false)

// 检查当前帖子是否是回复
const isReply = computed(() => {
  const inReplyToId = safeGet(props.post, 'reblog.inReplyToId', safeGet(props.post, 'inReplyToId'))
  return !!inReplyToId
})

// 获取回复的消息ID
const replyToId = computed(() => {
  return safeGet(props.post, 'reblog.inReplyToId', safeGet(props.post, 'inReplyToId', ''))
})

// 处理图片预览
const handlePreviewImage = (imageUrl) => {
  emit('preview-image', imageUrl)
}

// 处理卡片图片点击
const handleCardImageClick = (event, imageUrl) => {
  event.preventDefault()
  emit('preview-image', imageUrl)
}

// 切换内容警告显示
const toggleSpoiler = () => {
  showSpoilerContent.value = !showSpoilerContent.value
}

// 获取父级消息
async function fetchParentPost() {
  if (!isReply.value || !replyToId.value) return

  loadingParent.value = true
  try {
    const parent = await apis.masto.v1.statuses.$select(replyToId.value).fetch()
    parentPost.value = parent
  } catch (error) {
    console.error('获取父级消息失败:', error)
    parentPost.value = null
  } finally {
    loadingParent.value = false
  }
}

// 组件挂载时获取父级消息
onMounted(() => {
  if (isReply.value) {
    fetchParentPost()
  }
})

</script>

<template>
  <div>
    <!-- 回复的原始消息 -->
    <div v-if="isReply && parentPost" class="mb-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg border-l-2 border-blue-500">
      <div class="flex items-center space-x-2 mb-2 text-xs text-gray-400">
        <i class="fas fa-reply"></i>
        <span>回复</span>
      </div>

      <div class="flex items-start space-x-2">
        <!-- 父消息头像 -->
        <img
          v-if="parentPost.account?.avatar"
          :src="parentPost.account.avatar"
          class="w-6 h-6 rounded-full flex-shrink-0"
          :alt="parentPost.account.displayName || parentPost.account.username"
        />

        <div class="flex-1 min-w-0">
          <!-- 父消息作者 -->
          <div class="flex items-center space-x-2 mb-1">
            <span class="font-medium text-sm truncate">
              {{ parentPost.account?.displayName || parentPost.account?.username || '未知用户' }}
            </span>
            <span class="text-xs text-gray-500 truncate">
              @{{ parentPost.account?.acct || '' }}
            </span>
            <span class="text-xs text-gray-500">·</span>
            <span class="text-xs text-gray-500 flex-shrink-0">
              {{ formatTimeAgo(parentPost.createdAt) }}
            </span>
          </div>

          <!-- 父消息内容（截断显示） -->
          <div class="text-sm text-gray-300 line-clamp-3" v-html="parentPost.content"></div>
        </div>
      </div>
    </div>

    <!-- 加载父消息中 -->
    <div v-else-if="isReply && loadingParent" class="mb-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg border-l-2 border-blue-500">
      <div class="flex items-center space-x-2 text-xs text-gray-400">
        <i class="fas fa-spinner fa-spin"></i>
        <span>加载回复的消息...</span>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="flex items-center space-x-2 flex-wrap">
      <span class="font-bold truncate">
        {{ safeGet(post, 'reblog.account.displayName',
          safeGet(post, 'reblog.account.username',
            safeGet(post, 'account.displayName',
              safeGet(post, 'account.username', '未知用户')))) }}
      </span>
      <span class="text-sm text-gray-500">
        @{{ safeGet(post, 'reblog.account.acct', safeGet(post, 'account.acct', '')) }}
      </span>
      <span class="text-sm text-gray-500">·</span>
      <span class="text-sm text-gray-500">
        {{ formatTimeAgo(post.createdAt) }}
      </span>

      <!-- 编辑标记 -->
      <span v-if="safeGet(post, 'reblog.editedAt', safeGet(post, 'editedAt'))" class="text-sm text-gray-500" title="已编辑">
        <i class="fas fa-pen text-xs"></i>
      </span>

      <!-- 可见性标记 -->
      <span v-if="safeGet(post, 'reblog.visibility', safeGet(post, 'visibility')) === 'unlisted'"
        class="text-sm text-gray-500" title="不公开列出">
        <i class="fas fa-lock-open text-xs"></i>
      </span>
      <span v-else-if="safeGet(post, 'reblog.visibility', safeGet(post, 'visibility')) === 'private'"
        class="text-sm text-gray-500" title="仅关注者">
        <i class="fas fa-lock text-xs"></i>
      </span>
      <span v-else-if="safeGet(post, 'reblog.visibility', safeGet(post, 'visibility')) === 'direct'"
        class="text-sm text-gray-500" title="私信">
        <i class="fas fa-envelope text-xs"></i>
      </span>

      <!-- 敏感内容标记 -->
      <span v-if="safeGet(post, 'reblog.sensitive', safeGet(post, 'sensitive', false))" class="text-sm text-orange-500"
        title="敏感内容">
        <i class="fas fa-eye-slash text-xs"></i>
      </span>

      <Icon name="mastodon" class="text-purple-500 ml-1" />

      <!-- 转发标记 -->
      <span v-if="post.reblog" class="ml-2 text-sm text-gray-500">
        <i class="fas fa-retweet mr-1"></i> 转发
      </span>
    </div>

    <!-- 发布应用信息 -->
    <div v-if="safeGet(post, 'reblog.application.name', safeGet(post, 'application.name'))"
      class="text-xs text-gray-500 mt-1">
      通过 {{ safeGet(post, 'reblog.application.name', safeGet(post, 'application.name', '')) }}
    </div>

    <!-- 转发者信息 -->
    <div v-if="post.reblog" class="mt-1 text-sm text-gray-500">
      <span class="font-medium">{{ safeGet(post, 'account.displayName', safeGet(post, 'account.username', ''))
      }}</span> 转发了
    </div>

    <!-- 内容警告 / Spoiler Text -->
    <div v-if="safeGet(post, 'reblog.spoilerText', safeGet(post, 'spoilerText'))" class="mt-2">
      <div class="p-3 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg">
        <div class="flex items-start space-x-2">
          <i class="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
          <div class="flex-1">
            <div class="font-medium text-sm mb-2">
              {{ safeGet(post, 'reblog.spoilerText', safeGet(post, 'spoilerText', '')) }}
            </div>
            <button @click="toggleSpoiler" class="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1">
              <span>{{ showSpoilerContent ? '隐藏内容' : '显示内容' }}</span>
              <i :class="showSpoilerContent ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息内容 -->
    <div class="mt-2 text-sm md:text-base"
      v-show="!safeGet(post, 'reblog.spoilerText', safeGet(post, 'spoilerText')) || showSpoilerContent">
      <!-- Mastodon 内容 - 需要处理HTML -->
      <div v-html="safeGet(post, 'reblog.content', safeGet(post, 'content', ''))"></div>

      <!-- 媒体附件 -->
      <MediaAttachment :media="getMediaAttachments(post)" @preview-image="handlePreviewImage" />

      <!-- 卡片 -->
      <div v-if="(safeGet(post, 'reblog.card') || safeGet(post, 'card'))"
        class="mt-3 border border-gray-700 rounded-lg overflow-hidden">
        <a :href="safeGet(post, 'reblog.card.url', safeGet(post, 'card.url', '#'))" target="_blank" class="block">
          <div v-if="safeGet(post, 'reblog.card.image', safeGet(post, 'card.image'))"
            class="aspect-video bg-gray-800 max-h-64 overflow-hidden">
            <img :src="safeGet(post, 'reblog.card.image', safeGet(post, 'card.image'))"
              class="w-full object-cover cursor-pointer"
              :alt="safeGet(post, 'reblog.card.title', safeGet(post, 'card.title', ''))"
              @click="(e) => handleCardImageClick(e, safeGet(post, 'reblog.card.image', safeGet(post, 'card.image')))">
          </div>
          <div class="p-3">
            <div class="font-bold text-sm">{{ safeGet(post, 'reblog.card.title', safeGet(post, 'card.title', '')) }}
            </div>
            <div class="text-xs text-gray-500 mt-1 line-clamp-2">
              {{ safeGet(post, 'reblog.card.description', safeGet(post, 'card.description', '')) }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ safeGet(post, 'reblog.card.providerName', safeGet(post, 'card.providerName', '')) }}
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
                width: `${option.votesCount / safeGet(post, 'reblog.poll.votesCount', safeGet(post, 'poll.votesCount', 1)) * 100}%`
              }"></div>
              <div class="absolute inset-0 flex items-center px-3">
                <span class="text-xs text-white">{{ option.title }}</span>
              </div>
            </div>
            <span class="text-xs whitespace-nowrap">
              {{ option.votesCount }} 票
            </span>
          </div>
        </div>
        <div class="text-xs text-gray-500 mt-2">
          总票数: {{ safeGet(post, 'reblog.poll.votesCount', safeGet(post, 'poll.votesCount', 0)) }}
          <span v-if="safeGet(post, 'reblog.poll.expired', safeGet(post, 'poll.expired', false))" class="ml-2">
            (已结束)
          </span>
          <span v-else class="ml-2">
            ({{ formatTimeAgo(safeGet(post, 'reblog.poll.expiresAt', safeGet(post, 'poll.expiresAt', '')))
            }}结束)
          </span>
        </div>
      </div>
    </div>

    <!-- 交互按钮 -->
    <div class="flex flex-wrap gap-4 mt-3 text-sm">
      <button @click="emit('toggle-comments')" class="flex items-center space-x-2 hover:text-blue-400">
        <i class="far fa-comment"></i>
        <span>{{ post.reblog ? post.reblog.repliesCount || 0 : post.repliesCount || 0 }}</span>
      </button>
      <button class="flex items-center space-x-2 hover:text-green-400">
        <i class="fas fa-retweet"></i>
        <span>{{ post.reblog ? post.reblog.reblogsCount || 0 : post.reblogsCount || 0 }}</span>
      </button>
      <button class="flex items-center space-x-2 hover:text-red-400">
        <i class="far fa-heart"></i>
        <span>{{ post.reblog ? post.reblog.favouritesCount || 0 : post.favouritesCount || 0 }}</span>
      </button>
      <button class="flex items-center space-x-2 hover:text-blue-400">
        <i class="far fa-bookmark"></i>
      </button>
    </div>
  </div>
</template>