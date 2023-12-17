import { defineStore } from 'pinia'
import queryString from 'query-string'
import {
  registerApplication,
  getAuthorizationURL,
  getAccessToken,
  initClient,
  initAccount,
} from '@/utils/mastodon'

const useffStore = defineStore('mastodon', {
  persist: true,
  state: () => {
    return {
      userInfo: {},
      client_id: '',
      client_secret: '',
      vapid_key: '',
      isLoged: false,
      access_token: '',
    }
  },
  getters: {},
  actions: {
    async getToken(instanceURL) {
      const { client_id, client_secret, vapid_key } = await registerApplication(
        {
          instanceURL,
        }
      )

      this.client_id = client_id
      this.client_secret = client_secret
      this.vapid_key = vapid_key

      if (this.client_id && this.client_secret) {
        location.href = await getAuthorizationURL({
          instanceURL,
          client_id,
        })
      }
    },
    async getUserInfo(instanceURL) {
      const { location } = window
      const parsed = queryString.parse(location.search)

      if (parsed.code) {
        // Clear the code from the URL
        // window.history.replaceState(
        //   {},
        //   document.title,
        //   window.location.pathname || '/'
        // )
        //  setUIState('loading')
        const { access_token } = await getAccessToken({
          instanceURL,
          client_id: this.client_id,
          client_secret: this.client_secret,
          code: parsed.code,
        })
        this.access_token = access_token

        const client = await initClient({
          instance: instanceURL,
          accessToken: this.access_token,
        })
        const userInfo = await initAccount(
          client,
          instanceURL,
          this.access_token,
          this.vapidKey
        )

        this.userInfo = userInfo
        this.isLoged = true

        // window.location.replace(
        //   window.location.origin + window.location.pathname
        // )
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname || '/'
        )
      } else {
        await initClient({
          instance: instanceURL,
          accessToken: this.access_token,
        })
      }
    },
  },
})

export default useffStore
