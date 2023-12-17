const { VITE_CLIENT_NAME: CLIENT_NAME, VITE_WEBSITE: WEBSITE } = import.meta.env
import { createRestAPIClient } from 'masto'
import axios from 'axios'

const SCOPES = 'read write follow push'

export async function registerApplication({ instanceURL }) {
  const registrationParams = new URLSearchParams({
    client_name: CLIENT_NAME,
    redirect_uris: location.origin + location.pathname,
    scopes: SCOPES,
    website: WEBSITE,
  })
  const registrationResponse = await axios.post(
    `https://${instanceURL}/api/v1/apps`,
    registrationParams,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )
  return registrationResponse.data
}

export async function getAuthorizationURL({ instanceURL, client_id }) {
  const authorizationParams = new URLSearchParams({
    client_id,
    scope: SCOPES,
    redirect_uri: location.origin + location.pathname,
    // redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    response_type: 'code',
  })
  const authorizationURL = `https://${instanceURL}/oauth/authorize?${authorizationParams.toString()}`
  return authorizationURL
}

export async function getAccessToken({
  instanceURL,
  client_id,
  client_secret,
  code,
}) {
  const params = new URLSearchParams({
    client_id,
    client_secret,
    redirect_uri: location.origin + location.pathname,
    grant_type: 'authorization_code',
    code,
    scope: SCOPES,
  })

  const tokenResponse = await axios.post(
    `https://${instanceURL}/oauth/token`,
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  const tokenJSON = tokenResponse.data
  return tokenJSON
}

export let apis = {}
export function initClient({ instance, accessToken }) {
  if (/^https?:\/\//.test(instance)) {
    instance = instance
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .toLowerCase()
  }
  const DEFAULT_INSTANCE = 'nofan.xyz'
  const url = instance ? `https://${instance}` : `https://${DEFAULT_INSTANCE}`

  const masto = createRestAPIClient({
    url,
    accessToken, // Can be null
    timeout: 30_000, // Unfortunatly this is global instead of per-request
  })

  apis.masto = masto

  const client = {
    masto,
    instance,
    accessToken,
  }

  return client
}

export async function initAccount(client, instance, accessToken, vapidKey) {
  const { masto } = client
  const mastoAccount = await masto.v1.accounts.verifyCredentials()
  return mastoAccount
}
