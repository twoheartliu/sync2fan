import { ref, computed } from 'vue'
import useffStore from '@/store/fanfou'
import useMastStore from '@/store/mastodon'
import { ff } from '@/utils/fanfou'
import { apis } from '@/utils/mastodon'

export default function useTimeline() {
  const ffStore = useffStore()
  const mastoStore = useMastStore()

  // Timeline 相关
  const timelineLoading = ref(false)
  const fanfouTimeline = ref([])
  const mastodonTimeline = ref([])
  const currentFilter = ref('all') // 'all', 'mastodon', 'fanfou'
  const page = ref(1)
  const hasMorePosts = ref(true)

  // 计算合并后的时间线
  // 计算合并后的时间线
  const mergedTimeline = computed(() => {
    let timeline = []

    if (currentFilter.value === 'all' || currentFilter.value === 'fanfou') {
      timeline = [
        ...timeline,
        ...fanfouTimeline.value.map((post) => ({
          ...post,
          source: 'fanfou',
          created_at_date: new Date(post.created_at), // 添加一个标准化的日期对象
          id: 'ff_' + post.id,
        })),
      ]
    }

    if (currentFilter.value === 'all' || currentFilter.value === 'mastodon') {
      timeline = [
        ...timeline,
        ...mastodonTimeline.value.map((post) => ({
          ...post,
          source: 'mastodon',
          created_at_date: new Date(post.createdAt), // 添加一个标准化的日期对象
          id: 'mast_' + post.id,
        })),
      ]
    }

    // 按时间排序，最新的在前面，使用标准化的日期对象进行排序
    return timeline.sort((a, b) => b.created_at_date - a.created_at_date)
  })

  // 加载时间线
  async function loadTimelines() {
    if (timelineLoading.value || !hasMorePosts.value) return

    timelineLoading.value = true

    try {
      // 如果已登录，则加载时间线
      if (ffStore.userInfo.id) {
        await loadFanfouTimeline()
      }

      if (mastoStore.userInfo.id) {
        await loadMastodonTimeline()
      }
    } catch (error) {
      console.error('加载时间线失败:', error)
    } finally {
      timelineLoading.value = false
    }
  }

  // 加载饭否时间线
  async function loadFanfouTimeline() {
    try {
      const params = { count: 20 }
      if (
        fanfouTimeline.value.length > 0 &&
        currentFilter.value !== 'mastodon'
      ) {
        // 获取最早的一条饭否消息的ID作为max_id
        const oldestPost = [...fanfouTimeline.value].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        )[0]
        params.max_id = oldestPost.id
      }

      const timeline = await ff.get('/statuses/home_timeline', params)

      // 如果是第一页或者切换了筛选器，则替换时间线，否则追加
      if (page.value === 1 || currentFilter.value === 'mastodon') {
        fanfouTimeline.value = timeline
      } else {
        // 过滤掉已有的消息
        const newPosts = timeline.filter(
          (post) => !fanfouTimeline.value.some((p) => p.id === post.id)
        )
        fanfouTimeline.value = [...fanfouTimeline.value, ...newPosts]
      }

      // 如果返回的数据少于请求的数量，说明没有更多数据了
      if (timeline.length < params.count) {
        hasMorePosts.value = false
      }
    } catch (error) {
      console.error('加载饭否时间线失败:', error)
    }
  }

  // 加载Mastodon时间线
  async function loadMastodonTimeline() {
    try {
      let params = { limit: 20 }
      if (
        mastodonTimeline.value.length > 0 &&
        currentFilter.value !== 'fanfou'
      ) {
        // 获取最后一条Mastodon消息的ID
        const oldestPost = [...mastodonTimeline.value].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        )[0]
        params.max_id = oldestPost.id
      }

      const timeline = await apis.masto.v1.timelines.home.list(params)

      // 如果是第一页或者切换了筛选器，则替换时间线，否则追加
      if (page.value === 1 || currentFilter.value === 'fanfou') {
        mastodonTimeline.value = timeline
      } else {
        // 过滤掉已有的消息
        const newPosts = timeline.filter(
          (post) => !mastodonTimeline.value.some((p) => p.id === post.id)
        )
        mastodonTimeline.value = [...mastodonTimeline.value, ...newPosts]
      }

      // 如果返回的数据少于请求的数量，说明没有更多数据了
      if (timeline.length < params.limit) {
        hasMorePosts.value = false
      }
    } catch (error) {
      console.error('加载Mastodon时间线失败:', error)
    }
  }

  // 加载更多
  function loadMore() {
    page.value++
    loadTimelines()
  }

  // 设置过滤器
  function setFilter(filter) {
    if (currentFilter.value === filter) return

    currentFilter.value = filter
    page.value = 1
    hasMorePosts.value = true
    loadTimelines()
  }

  return {
    timelineLoading,
    fanfouTimeline,
    mastodonTimeline,
    currentFilter,
    page,
    hasMorePosts,
    mergedTimeline,
    loadTimelines,
    loadMore,
    setFilter,
  }
}
