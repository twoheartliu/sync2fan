/**
 * 安全获取嵌套属性，避免null/undefined错误
 * @param {Object} obj - 源对象
 * @param {string} path - 属性路径，如 'user.profile.name'
 * @param {*} defaultValue - 默认值，当属性不存在时返回
 * @returns {*} 属性值或默认值
 */
export function safeGet(obj, path, defaultValue = null) {
  if (!obj) return defaultValue

  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }

  return result !== undefined ? result : defaultValue
}

/**
 * 检查对象是否有某个属性
 * @param {Object} obj - 源对象
 * @param {string} prop - 属性名
 * @returns {boolean} 是否存在该属性
 */
export function hasProperty(obj, prop) {
  return obj && Object.prototype.hasOwnProperty.call(obj, prop) && obj[prop] !== null
}

/**
 * 获取媒体附件
 * @param {Object} post - 帖子对象
 * @returns {Array} 媒体附件数组
 */
export function getMediaAttachments(post) {
  if (post.source === 'mastodon') {
    if (hasProperty(post, 'reblog') && hasProperty(post.reblog, 'media_attachments')) {
      return post.reblog.media_attachments
    }
    return hasProperty(post, 'media_attachments') ? post.media_attachments : []
  }
  return hasProperty(post, 'photo') ? [post.photo] : []
}