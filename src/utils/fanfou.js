import Fanfou from 'fanfou-sdk-browser'

export const consumerKey = '1f60596e07661aac4d081f5509b46d8e'
export const consumerSecret = '9657405ada614cfcd2b13a5ae7a086fe'

export const ff = new Fanfou({
  consumerKey,
  consumerSecret,
  apiDomain: 'api.fanfou.com',
  oauthDomain: 'fanfou.com',
  protocol: 'https:',
  hooks: {
    baseString: (string) => string.replace('https', 'http'),
  },
})
