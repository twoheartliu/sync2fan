<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ComposeBox from '@/components/compose/ComposeBox.vue'
import TimelineFilter from '@/components/timeline/TimelineFilter.vue'
import UserProfile from '@/components/user/UserProfile.vue'
import PostCard from '@/components/timeline/PostCard.vue'
import LoadMore from '@/components/timeline/LoadMore.vue'
import loadingGif from '@/assets/ajax-indicator.gif'

// 导入组合式函数
import useAuth from '@/composables/useAuth.js'
import useTimeline from '@/composables/useTimeline.js'
import useCompose from '@/composables/useCompose.js'

// 导入样式
import '@/assets/styles/base.css'

// 使用组合式函数
const { ffStore, mastoStore, instanceURL, logoutff, logoutNofan } = useAuth()
const {
  timelineLoading,
  mergedTimeline,
  currentFilter,
  hasMorePosts,
  loadTimelines,
  loadMore,
  setFilter
} = useTimeline()
const { sendMessage } = useCompose()

// 控制发布框弹窗显示状态
const showComposeModal = ref(false)
// 控制悬浮按钮显示状态
const showFloatingButton = ref(false)
// 用于追踪滚动位置
const lastScrollPosition = ref(0)
// 发布框区域的引用
const composeBoxRef = ref(null)

// 初始化
onMounted(async () => {
  ffStore.getUserInfo()
  mastoStore.getUserInfo(instanceURL.value)

  // 加载时间线
  loadTimelines()

  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
})

// 处理滚动事件
function handleScroll() {
  if (composeBoxRef.value) {
    const composeBoxBottom = composeBoxRef.value.getBoundingClientRect().bottom
    // 当发布框底部不在可视区域内时显示悬浮按钮
    showFloatingButton.value = composeBoxBottom < 0
  }

  lastScrollPosition.value = window.scrollY
}

// 处理筛选器变更
function handleFilterChange(filter) {
  setFilter(filter)
}

// 处理发送消息后刷新时间线
async function handleSendMessage() {
  const success = await sendMessage()
  if (success) {
    loadTimelines()
    // 发送成功后关闭弹窗
    showComposeModal.value = false
  }
}

// 打开发布框弹窗
function openComposeModal() {
  showComposeModal.value = true
}

// 关闭发布框弹窗
function closeComposeModal() {
  showComposeModal.value = false
}

// 滚动到顶部
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <!-- 顶部导航栏 -->
  <AppHeader />

  <!-- 主内容区 -->
  <main class="container mx-auto px-4 py-4">
    <!-- 普通发布框 -->
    <div ref="composeBoxRef" class="mb-4">
      <ComposeBox @send-message="handleSendMessage" />

      <!-- 筛选器 -->
      <TimelineFilter :current-filter="currentFilter" @update:filter="handleFilterChange" class="mt-4" />
    </div>

    <!-- 提示信息 -->
    <div v-if="!ffStore.userInfo.id || !mastoStore.userInfo.id" class="mt-8 p-4 bg-opacity-10 bg-blue-500 rounded-lg">
      <h2 class="text-lg font-bold mb-2">欢迎使用 Sync2Fan</h2>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>请点击连接 NOFAN 实例账号和饭否账号</li>
        <li>消息将同步发送到长毛象 NOFAN 实例和饭否</li>
        <li>饭否先审后发，人工审核后才会在 TL 显示</li>
      </ul>
    </div>

    <!-- 账号信息展示 -->
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <UserProfile v-if="mastoStore.userInfo.id" :user-info="mastoStore.userInfo" type="mastodon"
        :on-logout="logoutNofan" />

      <UserProfile v-if="ffStore.userInfo.id" :user-info="ffStore.userInfo" type="fanfou" :on-logout="logoutff" />
    </div>

    <!-- 统一时间轴 -->
    <div class="mt-6 space-y-4">
      <!-- 加载中提示 -->
      <div v-if="timelineLoading && mergedTimeline.length === 0" class="text-center py-8">
        <img :src="loadingGif" alt="loading" class="inline h-6 mr-2">
        <span>加载中...</span>
      </div>

      <!-- 没有数据提示 -->
      <div v-else-if="mergedTimeline.length === 0" class="text-center py-8 text-gray-500">
        <i class="fas fa-inbox text-4xl mb-2"></i>
        <p>暂无数据，请先登录您的账号</p>
      </div>

      <!-- 帖子列表 -->
      <PostCard v-for="post in mergedTimeline" :key="post.id" :post="post" />

      <!-- 加载更多 -->
      <LoadMore v-if="mergedTimeline.length > 0" :loading="timelineLoading" :has-more="hasMorePosts"
        @load-more="loadMore" />
    </div>
  </main>

  <!-- 悬浮按钮组 - 仅在滚动时显示 -->
  <transition name="fade">
    <div v-if="showFloatingButton" class="fixed bottom-6 right-6 flex flex-col space-y-3">
      <!-- 回到顶部按钮 -->
      <button @click="scrollToTop"
        class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        title="回到顶部">
        <i class="fas fa-arrow-up text-gray-600 dark:text-gray-300"></i>
      </button>

      <!-- 发布按钮 -->
      <button @click="openComposeModal"
        class="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        title="发布新消息">
        <i class="fas fa-pen"></i>
      </button>
    </div>
  </transition>

  <!-- 发布框弹窗 -->
  <div v-if="showComposeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold dark:text-white">发布新消息</h2>
        <button @click="closeComposeModal"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <ComposeBox @send-message="handleSendMessage" />
    </div>
  </div>

  <!-- 页脚 -->
  <AppFooter />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>