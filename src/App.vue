<script setup>
import { ref, onMounted } from 'vue'
import useffStore from '@/store/fanfou'
import useMastStore from '@/store/mastodon'
import { ff } from '@/utils/fanfou'
import { errorHandler } from '@/utils'
import { apis } from '@/utils/mastodon'
import loadingGif from '@/assets/ajax-indicator.gif'



const inputValue = ref(null)
const instanceURL = ref('nofan.xyz')
const ffStore = useffStore()
const mastoStore = useMastStore()
const countdown = ref(140)
const status = ref('')
const isLoading = ref(false)

onMounted(async () => {
  ffStore.getUserInfo()
  mastoStore.getUserInfo(instanceURL.value)
})

async function getffAuth () {
  ffStore.getToken()
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

const updateChars = () => {
  countdown.value = 140 - inputValue.value.length
}

async function sendMessage () {
  if (!inputValue.value || isLoading.value) return

  isLoading.value = true

  try {
    if (ffStore.userInfo.id && mastoStore.userInfo.id) {
      await sendFanfouMessage()
      await sendMastoMessage()
      handleSuccess()
    } else {
      alert('请确保同时登录了 nofan 和饭否！')
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

async function sendFanfouMessage () {
  try {
    await ff.post('/statuses/update', { status: inputValue.value })
  } catch (error) {
    const errorMessage = await errorHandler(error)
    status.value = `饭否：${errorMessage}`
    throw error
  }
}

async function sendMastoMessage () {
  try {
    await apis.masto.v1.statuses.create({
      status: inputValue.value.trim(),
      visibility: 'public',
    })
  } catch (error) {
    const errorMessage = await errorHandler(error)
    status.value = `nofan: ${errorMessage}`
    throw error
  }
}

function handleSuccess () {
  inputValue.value = ''
  status.value = '发送成功'
  setTimeout(() => {
    status.value = ''
  }, 2000)
}

function handleError (error) {
  status.value = `发送消息时发生错误, 请联系 @twoheart: ${error.message}`
}

</script>

<template>
  <h1>欢迎使用 sync2fan </h1>
  <div class="tips">
    <h3>0. 请点击登录 nofan 实例账号和饭否账号</h3>
    <h3>1. 消息将同步发送到长毛象 nofan 实例和饭否</h3>
    <h3>2. 饭否先审后发，人工审核后才会在 TL 显示</h3>
  </div>
  <div class="card">
    <div class="logins">
      <p v-if="mastoStore.userInfo.id">
        <img class="avatar" alt="avatar" :src="mastoStore.userInfo.avatar" />
        {{ mastoStore.userInfo.displayName || mastoStore.userInfo.username }}。
        <button @click="logoutNofan">登出 NOFAN</button>
      </p>
      <p v-else>
        <button @click="getMastodonAuth">登录到 NOFAN</button>
      </p>
      <p v-if="ffStore.userInfo.id">
        <img class="avatar" alt="avatar" :src="ffStore.userInfo.profile_image_url" />
        {{ ffStore.userInfo.name }}。
        <button @click="logoutff">登出饭否</button>
      </p>
      <p v-else>
        <button @click="getffAuth">登录到饭否</button>
      </p>
    </div>
    <div class="loading">
      <img :src="loadingGif" alt="loading" v-if="isLoading">
    </div>
    <div class="textarea">
      <textarea v-model="inputValue" @keyup.enter.ctrl="sendMessage" @input="updateChars"></textarea>
    </div>
    <div class="actions">
      <div class="left">
        <span>{{ status }}</span>
      </div>
      <div class="right">
        <span :class="countdown < 0 ? 'count red' : 'count'">
          {{ countdown }}
        </span>
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
h3 {
  text-align: left;
}

.tips {
  padding: 0 1em;
}


.loading {
  display: block;
  height: 20px;
  margin-bottom: 4px;
  margin-right: 10px;
}

.card {
  // border: 1px solid red;
  text-align: right;

  .logins {
    font-size: 12px;
    text-align: left;

    .avatar {
      width: 20px;
      height: 20px;
    }
  }

  .textarea {
    display: flex;
    margin-bottom: 1em;

    textarea {
      border-radius: 8px;
      border: 1px solid #1a1a1a;
      width: 100%;
      height: 4em;
      padding: 0.6em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      transition: border-color 0.25s;
    }
  }

  .count {
    margin-right: 10px;
  }

  .red {
    color: red;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left {
      font-size: 12px;
    }
  }

}
</style>
