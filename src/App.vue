<script setup>
import { ref, onMounted } from 'vue'
import useffStore from '@/store/fanfou'
import useMastStore from '@/store/mastodon'
import { ff } from '@/utils/fanfou'
import { apis } from '@/utils/mastodon'


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

async function sendMessage () {
  if (!inputValue.value) return

  if (ffStore.userInfo.id && mastoStore.userInfo.id) {
    // 并行化请求
    const [ffResponse, mastoResponse] = await Promise.all([
      ff.post('/statuses/update', { status: inputValue.value }),
      apis.masto.v1.statuses.create({
        status: inputValue.value.trim(),
        visibility: "public",
      }),
    ])

    // 根据需要处理响应
    // ffResponse 和 mastoResponse 包含相应请求的结果
    console.log('ffResponse', ffResponse)
    console.log('mastoResponse', mastoResponse)

    inputValue.value = ''
  } else {
    alert('请确保同时登录了 nofan 和饭否！')
  }
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
  <h1>欢迎使用 NO2FAN </h1>
  <div class="tips">
    <h3>0. 请点击登录 nofan 实例账号和饭否账号</h3>
    <h3>1. 消息将同步发送到长毛象 nofan 实例和饭否</h3>
    <h3>2. 饭否是先审后发机制，在发送消息前请确保消息符合墙内规则</h3>
  </div>
  <div class="card">
    <div class="logins">
      <p v-if="mastoStore.userInfo.id">
        <img class="avatar" alt="avatar" :src="mastoStore.userInfo.avatar" />
        {{ mastoStore.userInfo.displayName }}。
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
    <div class="textarea">
      <textarea v-model="inputValue" @keyup.enter.ctrl="sendMessage"></textarea>
    </div>
    <button @click="sendMessage">发送</button>
  </div>
</template>

<style scoped lang="scss">
h3 {
  text-align: left;
}

.tips {
  padding: 0 1em;
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
}
</style>
