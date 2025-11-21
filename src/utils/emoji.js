/**
 * 替换文本中的自定义 emoji 短代码为 <img> 标签
 * @param {string} text - 需要替换的文本（可能是 HTML）
 * @param {Array} emojis - emoji 对象数组，每个对象包含 shortcode 和 url
 * @returns {string} 替换后的文本
 */
export function replaceEmojis(text, emojis) {
  if (!text || !emojis || emojis.length === 0) {
    return text
  }

  let result = text

  // 遍历所有 emoji，将 :shortcode: 替换为 <img> 标签
  emojis.forEach(emoji => {
    const { shortcode, url, staticUrl } = emoji

    // 创建正则表达式匹配 :shortcode:
    const regex = new RegExp(`:${shortcode}:`, 'g')

    // 替换为 img 标签
    const imgTag = `<img src="${url}" alt=":${shortcode}:" class="custom-emoji" title=":${shortcode}:" />`

    result = result.replace(regex, imgTag)
  })

  return result
}

/**
 * 从全局 emoji 列表中替换文本中的 emoji
 * @param {string} text - 需要替换的文本
 * @param {Array} allEmojis - 全局 emoji 列表
 * @param {Array} postEmojis - 当前帖子使用的 emoji 列表（优先使用）
 * @returns {string} 替换后的文本
 */
export function replaceEmojisFromStore(text, allEmojis = [], postEmojis = []) {
  if (!text) {
    return text
  }

  // 优先使用帖子中的 emoji（因为数据更准确）
  if (postEmojis && postEmojis.length > 0) {
    return replaceEmojis(text, postEmojis)
  }

  // 如果没有帖子 emoji，从全局列表中查找
  if (allEmojis && allEmojis.length > 0) {
    // 提取文本中的所有 :shortcode:
    const shortcodeRegex = /:([a-zA-Z0-9_]+):/g
    const matches = text.match(shortcodeRegex)

    if (!matches) {
      return text
    }

    // 从全局列表中查找匹配的 emoji
    const shortcodes = matches.map(m => m.slice(1, -1)) // 去掉冒号
    const relevantEmojis = allEmojis.filter(emoji =>
      shortcodes.includes(emoji.shortcode)
    )

    return replaceEmojis(text, relevantEmojis)
  }

  return text
}
