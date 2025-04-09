<script setup>
import { onMounted } from 'vue'
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

// 初始化
onMounted(async () => {
  ffStore.getUserInfo()
  mastoStore.getUserInfo(instanceURL.value)
  
  // 加载时间线
  loadTimelines()
})

// 处理筛选器变更
function handleFilterChange(filter) {
  setFilter(filter)
}

// 处理发送消息后刷新时间线
async function handleSendMessage() {
  const success = await sendMessage()
  if (success) {
    loadTimelines()
  }
}
</script>

<template>
  <!-- 顶部导航栏 -->
  <AppHeader />

  <!-- 主内容区 -->
  <main class="container mx-auto px-4 py-4">
    <!-- 发布框 -->
    <div class="sticky top-16 z-10 bg-opacity-80 backdrop-blur-md pb-4">
      <ComposeBox @send-message="handleSendMessage" />

      <!-- 筛选器 -->
      <TimelineFilter :current-filter="currentFilter" @update:filter="handleFilterChange" />
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
      <UserProfile 
        v-if="mastoStore.userInfo.id" 
        :user-info="mastoStore.userInfo" 
        type="mastodon"
        :on-logout="logoutNofan" 
      />

      <UserProfile 
        v-if="ffStore.userInfo.id" 
        :user-info="ffStore.userInfo" 
        type="fanfou"
        :on-logout="logoutff" 
      />
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
      <LoadMore 
        v-if="mergedTimeline.length > 0" 
        :loading="timelineLoading" 
        :has-more="hasMorePosts"
        @load-more="loadMore" 
      />
    </div>
  </main>

  <!-- 页脚 -->
  <AppFooter />
</template>