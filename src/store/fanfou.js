import { defineStore } from 'pinia'
import queryString from 'query-string'
import { ff } from '@/utils/fanfou.js'

const useffStore = defineStore('ff', {
  persist: true,
  state: () => {
    return {
      userInfo: {},
      oauthTokenSecret: '',
      oauthToken: '',
      isLoged: false,
    }
  },
  getters: {},
  actions: {
    async getToken() {
      try {
        const result = await ff.getRequestToken()
        this.oauthTokenSecret = result.oauthTokenSecret

        // 在成功获取令牌后，执行页面重定向
        window.location.replace(
          `https://fanfou.com/oauth/authorize?oauth_token=${result.oauthToken}&oauth_callback=${window.location.href}`
        )
      } catch (error) {
        console.error(error)
        alert('获取令牌时发生错误')
        return error
      }
    },
    async getUserInfo() {
      const { location } = window
      const parsed = queryString.parse(location.search)

      if (parsed.oauth_token) {
        this.isLoged = true
        const { oauth_token: oauthToken } = parsed
        if (this.oauthTokenSecret) {
          const result = await ff.getAccessToken({
            oauthToken,
            oauthTokenSecret: this.oauthTokenSecret,
          })
          this.oauthToken = result.oauthToken
          this.oauthTokenSecret = result.oauthTokenSecret
          window.location.replace(
            window.location.origin + window.location.pathname
          )
        }
      } else {
        if (this.oauthToken && this.oauthTokenSecret) {
          this.isLoged = true
          ff.oauthToken = this.oauthToken
          ff.oauthTokenSecret = this.oauthTokenSecret
          const user = await ff.get('/users/show')
          this.userInfo = user
        }
      }
    },
  },
})

export default useffStore
