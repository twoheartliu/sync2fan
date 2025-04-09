<script setup>
const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['mastodon', 'fanfou'].includes(value)
  },
  onLogout: {
    type: Function,
    required: true
  }
})

// 根据类型获取显示名称
const displayName = props.type === 'mastodon'
  ? props.userInfo.displayName || props.userInfo.username
  : props.userInfo.name

// 根据类型获取头像URL
const avatarUrl = props.type === 'mastodon'
  ? props.userInfo.avatar
  : props.userInfo.profile_image_url

// 根据类型获取服务名称
const serviceName = props.type === 'mastodon' ? 'NOFAN' : '饭否'
</script>

<template>
  <div class="p-4 border border-gray-700 rounded-lg">
    <div class="flex items-center">
      <img class="w-10 h-10 rounded-full mr-3" :src="avatarUrl" alt="avatar" />
      <div>
        <div class="font-bold">{{ displayName }}</div>
        <div class="text-sm text-gray-400">{{ serviceName }}已连接</div>
      </div>
      <button @click="onLogout" class="ml-auto text-sm text-red-400 hover:text-red-300">
        登出
      </button>
    </div>
  </div>
</template>