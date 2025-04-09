import { ref } from 'vue'
import useffStore from '@/store/fanfou'
import useMastStore from '@/store/mastodon'

export default function useAuth() {
  const ffStore = useffStore()
  const mastoStore = useMastStore()
  const instanceURL = ref('nofan.xyz')

  // 获取饭否认证
  async function getffAuth() {
    await ffStore.getToken()
  }

  // 获取Mastodon认证
  async function getMastodonAuth() {
    await mastoStore.getToken(instanceURL.value)
  }

  // 登出饭否
  const logoutff = () => {
    ffStore.$reset()
    location.href = location.href
  }

  // 登出Mastodon
  const logoutNofan = () => {
    mastoStore.$reset()
    location.href = location.href
  }

  return {
    instanceURL,
    ffStore,
    mastoStore,
    getffAuth,
    getMastodonAuth,
    logoutff,
    logoutNofan
  }
}