<script setup>
import fs from "node:fs"
import { ref, onMounted } from 'vue'
import useffStore from '@/store/fanfou'
import useMastStore from '@/store/mastodon'
import { ff } from '@/utils/fanfou'
import { errorHandler } from '@/utils'
import { apis } from '@/utils/mastodon'
import loadingGif from '@/assets/ajax-indicator.gif'



const inputValue = ref('')
const instanceURL = ref('nofan.xyz')
const ffStore = useffStore()
const mastoStore = useMastStore()
const countdown = ref(140)
const status = ref('')
const isLoading = ref(false)
const fileList = ref([])

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
  countdown.value = 140 - inputValue.value?.length
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
    if (fileList.value.length) {
      await ff.upload('/photos/upload', { photo: new Blob(fileList.value), status: inputValue.value })
    } else {
      await ff.post('/statuses/update', { status: inputValue.value })
    }
  } catch (error) {
    const errorMessage = await errorHandler(error)
    status.value = `饭否：${errorMessage}`
    throw error
  }
}

async function sendMastoMessage () {
  try {
    if (fileList.value.length) {
      // Create media from a local file
      const attachment1 = await apis.masto.v2.media.create({
        file: new Blob(fileList.value),
        description: "",
      })

      // Publish!
      const status = await apis.masto.v1.statuses.create({
        status: inputValue.value.trim(),
        visibility: "public",
        mediaIds: [attachment1.id],
      })
    } else {
      await apis.masto.v1.statuses.create({
        status: inputValue.value.trim(),
        visibility: 'public',
      })
    }
  } catch (error) {
    const errorMessage = await errorHandler(error)
    status.value = `nofan: ${errorMessage}`
    throw error
  }
}

function handleSuccess () {
  inputValue.value = ''
  status.value = '发送成功'
  fileList.value = []
  setTimeout(() => {
    status.value = ''
  }, 2000)
}

function handleError (error) {
  status.value = `发送消息时发生错误, 请联系 @twoheart: ${error.message}`
}

function handleFileUpload ($Event) {
  const { files } = $Event.target
  if (files) {
    fileList.value = files
  }
}

function handleRemoveImg () {
  fileList.value = []
}

function handleKeyDown (event) {
  const isMacOS = navigator.userAgent.indexOf('Mac OS X') !== -1

  if ((isMacOS && event.metaKey || !isMacOS && event.ctrlKey) && event.key === 'Enter') {
    // 在这里执行你的操作
    sendMessage()
  }
}

</script>

<template>
  <h1>欢迎使用 sync2fan </h1>
  <ul class="tips">
    <li>0. 请点击登录 nofan 实例账号和饭否账号</li>
    <li>1. 消息将同步发送到长毛象 nofan 实例和饭否</li>
    <li>2. 饭否先审后发，人工审核后才会在 TL 显示</li>
  </ul>
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
    <div class="status">
      <div class="text">{{ status }}</div>
      <img :src="loadingGif" alt="loading" v-if="isLoading">
    </div>
    <div class="textarea">
      <textarea v-model="inputValue" @keydown="handleKeyDown" @input="updateChars"></textarea>
    </div>

    <div class="actions">
      <div class="left">
        <div class="act" style="display: block;">
          <div id="upload-wrapper" class="web-upload-photo-file-name"><input type="hidden" name="photo_base64"
              id="upload-base64">
            <div class="upload-button-wrapper">
              <div class="sl-file">
                <div :class="fileList.length ? 'pngfix sf-image-attached' : 'pngfix'" id="upload-button" title="上传图片"
                  style="background-position: -40px 0px;"></div><input @change="handleFileUpload" title="上传图片，最大2MB"
                  class="sl-input-file" type="file" name="picture" id="upload-file"
                  accept="image/jpeg,image/png,image/gif">
              </div>
              <span v-if="fileList.length" class="ul-filename" id="upload-filename">{{ fileList[0].name
              }}</span>
              <span v-if="fileList.length" @click="handleRemoveImg" class="upload-close-handle" title="取消上传" id="ul_close"
                style="display: inline;">×</span>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <span :class="countdown < 0 ? 'count red' : 'count'">
          {{ countdown }}
        </span>
        <button @click="sendMessage">发送</button>
      </div>
    </div>
    <footer>
      <a href="https://github.com/twoheartliu/sync2fan" target="_blank">Built</a> by <a href="https://nofan.xyz/@twoheart"
        target="_blank">@twoheart</a>. <a href="https://github.com/twoheartliu/sync2fan/blob/main/PRIVACY.MD"
        target="_blank">Privacy Policy</a>.
    </footer>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/fanfou.scss";

h3 {
  text-align: left;
}

.tips {
  text-align: left;
  line-height: 1.6;
  font-size: 14px;
  font-weight: bold;
  padding: 0 1em;
}


.status {
  display: flex;
  margin-bottom: 4px;
  margin-right: 10px;
  max-width: 100%;
  text-align: left;
  min-height: 16px;

  .text {
    float: right;
    display: block;
    font-size: 12px;
    width: 100%;
  }
}

.card {
  text-align: right;
  max-width: 320px;

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

      .sl-file {
        position: relative;
      }

      .sl-file .sl-input-file {
        position: absolute;
        right: 0;
        top: 0;
        height: 20px;
        opacity: 0;
        filter: alpha(opacity=0);
        -ms-filter: "alpha(opacity=0)";
        cursor: pointer;
      }

      .upload-close-handle {
        cursor: pointer;
        display: none;
        padding: 4px;
        font-weight: 800;
        line-height: 23px;
        color: #a6a6a6;
        font-size: 12px;
      }

      .ul-filename {
        display: inline-block;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    padding: 10px;
  }

  footer a {
    text-decoration: none;
    color: #1a1a1a;
  }

}


@media only screen and (max-width: 767px) {}
</style>
