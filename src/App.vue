<script setup>
import queryString from 'query-string'
import { ref, onMounted } from 'vue'
import { ff } from '@/utils/ff.js'

const isffLoged = ref(false)
const ffUserInfo = ref({})

onMounted(async () => {
  const { location } = window
  if (location && location.search) {
    // this.setState({ loged: true })
    isffLoged.value = true
    const parsed = queryString.parse(location.search)
    const { oauth_token: oauthToken } = parsed
    const oauthTokenSecret = localStorage.getItem('requestTokenSecret')
    if (oauthTokenSecret) {
      const result = await ff.getAccessToken({ oauthToken, oauthTokenSecret })
      localStorage.setItem('oauthToken', result.oauthToken)
      localStorage.setItem('oauthTokenSecret', result.oauthTokenSecret)
      localStorage.removeItem('requestTokenSecret')
      window.location.replace(
        window.location.origin + window.location.pathname,
      )
    }
  } else {
    const oauthToken = localStorage.getItem('oauthToken')
    const oauthTokenSecret = localStorage.getItem('oauthTokenSecret')

    if (oauthToken && oauthTokenSecret) {
      isffLoged.value = true
      ff.oauthToken = oauthToken
      ff.oauthTokenSecret = oauthTokenSecret
      const user = await ff.get('/users/show')
      console.log('user', user)
      ffUserInfo.value = user
    }
  }
})



async function goffAuth () {
  const result = await ff.getRequestToken()
  localStorage.setItem('requestTokenSecret', result.oauthTokenSecret)
  window.location.replace(
    `https://fanfou.com/oauth/authorize?oauth_token=${result.oauthToken}&oauth_callback=${window.location.href}`,
  )
}

async function goMastodonAuth () {

}


</script>

<template>
  <h1>欢迎使用 NO2FAN 服务</h1>

  <div class="card">
    <p>
      <button @click="goMastodonAuth">登录到 NOFAN</button>
    </p>
    <p v-if="user">
      <button @click="goffAuth">登录到饭否</button>
    </p>
    <p v-else>
      饭否已登录：<img className="nes-avatar is-small" alt="avatar" :src="ffUserInfo.profile_image_url" />
      {{ ffUserInfo.name }}。
    </p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
