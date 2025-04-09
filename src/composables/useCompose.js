import { ref, computed } from 'vue'
import useffStore from '@/store/fanfou'
import useMastStore from '@/store/mastodon'
import { ff } from '@/utils/fanfou'
import { errorHandler } from '@/utils'
import { apis } from '@/utils/mastodon'

export default function useCompose() {
  const inputValue = ref('')
  const countdown = ref(140)
  const status = ref('')
  const isLoading = ref(false)
  const fileList = ref([])
  
  const ffStore = useffStore()
  const mastoStore = useMastStore()

  // 计算剩余字符数
  const updateChars = () => {
    countdown.value = 140 - inputValue.value?.length
  }

  // 发送消息
  async function sendMessage() {
    if (!inputValue.value || isLoading.value || countdown.value < 0) return

    isLoading.value = true

    try {
      if (ffStore.userInfo.id && mastoStore.userInfo.id) {
        await sendFanfouMessage()
        await sendMastoMessage()
        handleSuccess()
        return true
      } else {
        alert('请确保同时登录了 nofan 和饭否！')
      }
    } catch (error) {
      handleError(error)
    } finally {
      isLoading.value = false
    }
    
    return false
  }

  // 发送饭否消息
  async function sendFanfouMessage() {
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

  // 发送Mastodon消息
  async function sendMastoMessage() {
    try {
      if (fileList.value.length) {
        // Create media from a local file
        const attachment1 = await apis.masto.v2.media.create({
          file: new Blob(fileList.value),
          description: "",
        })

        // Publish!
        await apis.masto.v1.statuses.create({
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

  // 处理发送成功
  function handleSuccess() {
    inputValue.value = ''
    status.value = '发送成功'
    fileList.value = []
    setTimeout(() => {
      status.value = ''
    }, 2000)
  }

  // 处理发送错误
  function handleError(error) {
    status.value = `发送消息时发生错误, 请联系 @twoheart: ${error.message}`
  }

  // 处理文件上传
  function handleFileUpload(event) {
    const { files } = event.target
    if (files) {
      fileList.value = files
    }
  }

  // 移除图片
  function handleRemoveImg() {
    fileList.value = []
  }

  // 处理键盘事件
  function handleKeyDown(event) {
    const isMacOS = navigator.userAgent.indexOf('Mac OS X') !== -1

    if ((isMacOS && event.metaKey || !isMacOS && event.ctrlKey) && event.key === 'Enter') {
      sendMessage()
    }
  }

  return {
    inputValue,
    countdown,
    status,
    isLoading,
    fileList,
    updateChars,
    sendMessage,
    handleFileUpload,
    handleRemoveImg,
    handleKeyDown
  }
}