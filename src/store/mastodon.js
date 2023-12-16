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
      const code = decodeURIComponent(
        (window.location.search.match(/code=([^&]+)/) || [, ''])[1]
      )

      if (code) {
        console.log({ code })
        // Clear the code from the URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname || '/'
        )
        ;(async () => {
          //  setUIState('loading')
          const { access_token } = await getAccessToken({
            instanceURL,
            client_id: this.client_id,
            client_secret: this.client_secret,
            code,
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
          this.client = client
          // Object.assign(this.client, client)
          // console.log('client', client)
        })()
      } else {
        const client = await initClient({
          instance: instanceURL,
          accessToken: this.access_token,
        })
        this.client = client
      }
    },
  },
})

export default useffStore
