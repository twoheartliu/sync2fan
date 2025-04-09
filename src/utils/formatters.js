import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn' // 导入中文语言包

// 加载相对时间插件
dayjs.extend(relativeTime)
// 设置语言为中文
dayjs.locale('zh-cn')

/**
 * 将日期格式化为"多久前"的形式
 * 处理两种不同的时间格式:
 * - 饭否格式: "Wed Apr 09 06:25:52 +0000 2025"
 * - Mastodon格式: "2025-04-09T03:41:49.631Z"
 *
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的字符串
 */
export function formatTimeAgo(dateString) {
  // 确保我们有一个有效的日期
  if (!dateString) return ''

  try {
    // 使用 dayjs 解析日期并获取相对时间
    return dayjs(dateString).fromNow()
  } catch (error) {
    console.error('日期格式化错误:', error, dateString)
    return dateString // 返回原始字符串，避免显示错误
  }
}
