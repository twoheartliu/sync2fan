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
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-bold">Sync2Fan</h1>
          <div class="hidden md:flex space-x-2">
            <button v-if="mastoStore.userInfo.id"
              class="px-3 py-1 rounded-full text-sm bg-opacity-20 bg-blue-600 text-blue-400">
              <i class="fab fa-mastodon mr-1"></i> 已连接
            </button>
            <button v-else @click="getMastodonAuth"
              class="px-3 py-1 rounded-full text-sm bg-opacity-20 bg-gray-600 text-gray-400">
              <i class="fab fa-mastodon mr-1"></i> 连接 NOFAN
            </button>

            <button v-if="ffStore.userInfo.id"
              class="px-3 py-1 rounded-full text-sm bg-opacity-20 bg-blue-400 text-blue-300">
              <i class="fas fa-coffee mr-1"></i> 已连接
            </button>
            <button v-else @click="getffAuth"
              class="px-3 py-1 rounded-full text-sm bg-opacity-20 bg-gray-600 text-gray-400">
              <i class="fas fa-coffee mr-1"></i> 连接饭否
            </button>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="toggleTheme" class="theme-toggle p-2 rounded-full hover:bg-gray-700">
            <i :class="isDarkMode ? 'fas fa-moon' : 'fas fa-sun'"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>