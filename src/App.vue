<script setup>
import { ref, onMounted } from 'vue'
import useffStore from '@/store/fanfou.js'
import useMastStore from '@/store/mastodon.js'
import { ff } from '@/utils/fanfou.js'
import { apis } from '@/utils/mastodon.js'


const inputValue = ref(null)
const instanceURL = ref('nofan.xyz')
const ffStore = useffStore()
const mastoStore = useMastStore()

onMounted(async () => {
  ffStore.getUserInfo()
  mastoStore.getUserInfo(instanceURL.value)
})

async function getffAuth () {
  ffStore.getToken()
}

// console.log('client', client)
console.log('apis', apis)
async function handleToSend () {
  // 并行化请求
  const [ffResponse, mastoResponse] = await Promise.all([
    ff.post('/statuses/update', { status: inputValue.value }),
    apis.masto.v1.statuses.create({
      status: inputValue.value,
      visibility: "public",
    }),
  ])

  // 根据需要处理响应
  // ffResponse 和 mastoResponse 包含相应请求的结果
  console.log('ffResponse', ffResponse)
  console.log('mastoResponse', mastoResponse)

  inputValue.value = ''
  console.log('发送成功')
}


async function getMastodonAuth () {
  mastoStore.getToken(instanceURL.value)
}

const logoutff = () => {
  ffStore.$reset()
  location.href = location.href
}

const logoutNofan = () => {
  mastoStore.$reset()
  location.href = location.href
}

</script>

<template>
  <h1>欢迎使用 NO2FAN 服务</h1>
  <div class="card">
    <p v-if="mastoStore.userInfo.id">
      NOFAN 已登录：<img className="nes-avatar is-small" alt="avatar" :src="mastoStore.userInfo.avatar"
        style="width: 48px; height: 48px;" />
      {{ mastoStore.userInfo.displayName }}。
      <button @click="logoutNofan">登出 NOFAN</button>
    </p>
    <p v-else>
      <button @click="getMastodonAuth">登录到 NOFAN</button>
    </p>
    <p v-if="ffStore.userInfo.id">
      饭否已登录：<img className="nes-avatar is-small" alt="avatar" :src="ffStore.userInfo.profile_image_url" />
      {{ ffStore.userInfo.name }}。
      <button @click="logoutff">登出饭否</button>
    </p>
    <p v-else>
      <button @click="getffAuth">登录到饭否</button>
    </p>
    <textarea v-model="inputValue"></textarea>
    <button @click="handleToSend">发送</button>
  </div>
</template>

<style scoped></style>
