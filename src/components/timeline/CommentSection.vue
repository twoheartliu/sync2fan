<script setup>
import { ref, onMounted, computed } from 'vue'
import { safeGet } from '@/utils/helpers'
import { formatTimeAgo } from '@/utils/formatters'
import useComments from '@/composables/useComments.js'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const props = defineProps({
  postId: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true // 'mastodon' or 'fanfou'
  },
  // 饭否需要原帖作者的用户ID
  replyToUserId: {
    type: String,
    default: ''
  },
  // 原帖作者的用户名，用于 @ 提及
  replyToUsername: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['comment-sent'])

const { fetchComments, sendComment, getCachedComments, isLoading, sendingComment } = useComments()

// 评论内容
const commentContent = ref('')
// 评论列表
const comments = ref([])

// 加载评论
async function loadComments() {
  comments.value = await fetchComments(props.postId, props.source)
}

// 发送评论
async function handleSendComment() {
  if (!commentContent.value.trim()) return

  let content = commentContent.value.trim()

  // 如果是饭否，需要在内容前加上 @ 提及
  if (props.source === 'fanfou' && props.replyToUsername) {
    if (!content.startsWith('@' + props.replyToUsername)) {
      content = `@${props.replyToUsername} ${content}`
    }
  }

  const result = await sendComment(
    props.postId,
    content,
    props.source,
    props.replyToUserId
  )

  if (result.success) {
    commentContent.value = ''
    // 重新加载评论列表
    await loadComments()
    emit('comment-sent')
  } else {
    alert('发送评论失败，请重试')
  }
}

// 计算是否正在加载
const loading = computed(() => isLoading(props.postId))

// 组件挂载时加载评论
onMounted(() => {
  loadComments()
})

// 获取评论作者信息
function getCommentAuthor(comment) {
  if (props.source === 'mastodon') {
    return {
      name: safeGet(comment, 'account.displayName', safeGet(comment, 'account.username', '未知用户')),
      username: safeGet(comment, 'account.acct', ''),
      avatar: safeGet(comment, 'account.avatar', '')
    }
  } else {
    return {
      name: safeGet(comment, 'user.name', '未知用户'),
      username: safeGet(comment, 'user.screen_name', ''),
      avatar: safeGet(comment, 'user.profile_image_url', '')
    }
  }
}

// 获取评论内容
function getCommentContent(comment) {
  if (props.source === 'mastodon') {
    return safeGet(comment, 'content', '')
  } else {
    return safeGet(comment, 'text', '')
  }
}

// 获取评论时间
function getCommentTime(comment) {
  if (props.source === 'mastodon') {
    return formatTimeAgo(comment.createdAt)
  } else {
    return formatTimeAgo(comment.created_at)
  }
}
</script>

<template>
  <div class="mt-4 border-t border-gray-700 pt-4">
    <!-- 评论输入框 -->
    <div class="mb-4">
      <div class="flex space-x-2">
        <textarea
          v-model="commentContent"
          class="flex-1 bg-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          :placeholder="replyToUsername ? `回复 @${replyToUsername}...` : '写下你的评论...'"
          rows="2"
          :disabled="sendingComment"
        ></textarea>
        <button
          @click="handleSendComment"
          :disabled="!commentContent.trim() || sendingComment"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors self-end"
        >
          <span v-if="sendingComment">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
          <span v-else>发送</span>
        </button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-4">
      <LoadingSpinner size="sm" text="加载评论中..." center />
    </div>

    <!-- 无评论 -->
    <div v-else-if="comments.length === 0" class="text-center py-4 text-gray-500 text-sm">
      暂无评论
    </div>

    <!-- 评论列表 -->
    <div v-else class="space-y-3">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="p-3 bg-gray-800 rounded-lg"
        :class="{ 'border-l-2 border-blue-500 ml-2': comment.isAncestor }"
      >
        <!-- 评论头部 -->
        <div class="mb-2">
          <div class="flex items-center space-x-2">
            <!-- 头像 -->
            <img
              v-if="getCommentAuthor(comment).avatar"
              :src="getCommentAuthor(comment).avatar"
              class="w-6 h-6 rounded-full flex-shrink-0"
              :alt="getCommentAuthor(comment).name"
            />
            <div class="w-6 h-6 rounded-full bg-gray-600 flex-shrink-0" v-else></div>

            <!-- 用户名和标记 -->
            <div class="flex-1 min-w-0 flex items-center space-x-2">
              <span class="font-medium text-sm truncate">{{ getCommentAuthor(comment).name }}</span>

              <!-- 上文标记 -->
              <span v-if="comment.isAncestor" class="text-xs text-blue-400 flex-shrink-0">
                <i class="fas fa-arrow-up mr-1"></i>上文
              </span>
            </div>
          </div>

          <!-- 第二行：用户ID和时间 -->
          <div class="flex items-center space-x-2 ml-8 mt-0.5">
            <span class="text-xs text-gray-500 truncate">@{{ getCommentAuthor(comment).username }}</span>
            <span class="text-xs text-gray-500">·</span>
            <span class="text-xs text-gray-500 flex-shrink-0">{{ getCommentTime(comment) }}</span>
          </div>
        </div>

        <!-- 评论内容 -->
        <div class="text-sm">
          <div v-if="source === 'mastodon'" v-html="getCommentContent(comment)"></div>
          <p v-else>{{ getCommentContent(comment) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
