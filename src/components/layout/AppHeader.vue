<script setup>
import useAuth from '@/composables/useAuth'
import useTheme from '@/composables/useTheme'

const { ffStore, mastoStore, getffAuth, getMastodonAuth } = useAuth()
const { isDarkMode, toggleTheme } = useTheme()
</script>

<template>
  <nav class="sticky top-0 border-b border-gray-700 bg-opacity-80 backdrop-blur-md z-10">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-14">
        <div class="flex items-center space-x-2">
          <h1 class="text-xl font-bold">拌饭 MixFan</h1>
          <!-- 使用flex而不是flex-wrap确保横向排列 -->
          <div class="flex space-x-1">
            <button v-if="mastoStore.userInfo.id"
              class="px-2 py-1 rounded-full text-xs sm:text-sm bg-opacity-20 bg-blue-600 text-blue-400">
              <Icon name="mastodon" class="mr-1" /> <span class="hidden xs:inline">已连接</span>
            </button>
            <button v-else @click="getMastodonAuth"
              class="px-2 py-1 rounded-full text-xs sm:text-sm bg-opacity-20 bg-gray-600 text-gray-400">
              <Icon name="mastodon" class="mr-1" /> <span class="hidden xs:inline">连接</span> NOFAN
            </button>

            <button v-if="ffStore.userInfo.id"
              class="px-2 py-1 rounded-full text-xs sm:text-sm bg-opacity-20 bg-blue-400 text-blue-300">
              <Icon name="fanfou" class="mr-1" /> <span class="hidden xs:inline">已连接</span>
            </button>
            <button v-else @click="getffAuth"
              class="px-2 py-1 rounded-full text-xs sm:text-sm bg-opacity-20 bg-gray-600 text-gray-400">
              <Icon name="fanfou" class="mr-1" /> <span class="hidden xs:inline">连接</span>饭否
            </button>
          </div>
        </div>
        <div class="flex items-center">
          <button @click="toggleTheme" class="theme-toggle p-2 rounded-full hover:bg-gray-700">
            <i :class="isDarkMode ? 'fas fa-moon' : 'fas fa-sun'"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>