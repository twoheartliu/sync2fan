import { ref } from "vue";
import { ff } from "@/utils/fanfou";
import { apis } from "@/utils/mastodon";

export default function useComments() {
  // 评论缓存，key 为 postId
  const commentsCache = ref({});
  // 加载状态
  const loadingComments = ref({});
  // 发送评论状态
  const sendingComment = ref(false);

  // 获取 Mastodon 帖子的评论
  async function fetchMastodonComments(postId) {
    // 去掉前缀 mast_
    const realId = postId.replace(/^mast_/, "");

    if (loadingComments.value[postId]) return;
    loadingComments.value[postId] = true;

    try {
      const context = await apis.masto.v1.statuses.$select(realId).context.fetch();

      // 合并 ancestors 和 descendants，按时间排序
      const allComments = [
        ...context.ancestors.map(c => ({
          ...c,
          source: "mastodon",
          isAncestor: true,
          created_at_date: new Date(c.createdAt)
        })),
        ...context.descendants.map(c => ({
          ...c,
          source: "mastodon",
          isAncestor: false,
          created_at_date: new Date(c.createdAt)
        }))
      ].sort((a, b) => a.created_at_date - b.created_at_date);

      commentsCache.value[postId] = allComments;
      return allComments;
    } catch (error) {
      console.error("获取 Mastodon 评论失败:", error);
      commentsCache.value[postId] = [];
      return [];
    } finally {
      loadingComments.value[postId] = false;
    }
  }

  // 获取饭否帖子的评论
  async function fetchFanfouComments(postId) {
    // 去掉前缀 ff_
    const realId = postId.replace(/^ff_/, "");

    if (loadingComments.value[postId]) return;
    loadingComments.value[postId] = true;

    try {
      const contextTimeline = await ff.get("/statuses/context_timeline", {
        id: realId,
        format: "html"
      });

      // 饭否返回的是按时间排序的数组
      const allComments = contextTimeline
        .filter(status => status.id !== realId) // 排除原帖
        .map(status => ({
          ...status,
          source: "fanfou",
          created_at_date: new Date(status.created_at)
        }));

      commentsCache.value[postId] = allComments;
      return allComments;
    } catch (error) {
      console.error("获取饭否评论失败:", error);
      commentsCache.value[postId] = [];
      return [];
    } finally {
      loadingComments.value[postId] = false;
    }
  }

  // 获取评论（根据来源自动选择）
  async function fetchComments(postId, source) {
    if (source === "mastodon") {
      return await fetchMastodonComments(postId);
    } else if (source === "fanfou") {
      return await fetchFanfouComments(postId);
    }
    return [];
  }

  // 发送 Mastodon 评论
  async function sendMastodonComment(postId, content) {
    const realId = postId.replace(/^mast_/, "");

    try {
      sendingComment.value = true;
      const newStatus = await apis.masto.v1.statuses.create({
        status: content,
        inReplyToId: realId
      });

      // 刷新评论列表
      await fetchMastodonComments(postId);

      return { success: true, status: newStatus };
    } catch (error) {
      console.error("发送 Mastodon 评论失败:", error);
      return { success: false, error };
    } finally {
      sendingComment.value = false;
    }
  }

  // 发送饭否评论
  async function sendFanfouComment(postId, content, replyToUserId) {
    const realId = postId.replace(/^ff_/, "");

    try {
      sendingComment.value = true;
      const newStatus = await ff.post("/statuses/update", {
        status: content,
        in_reply_to_status_id: realId,
        in_reply_to_user_id: replyToUserId
      });

      // 刷新评论列表
      await fetchFanfouComments(postId);

      return { success: true, status: newStatus };
    } catch (error) {
      console.error("发送饭否评论失败:", error);
      return { success: false, error };
    } finally {
      sendingComment.value = false;
    }
  }

  // 发送评论（根据来源自动选择）
  async function sendComment(postId, content, source, replyToUserId = null) {
    if (source === "mastodon") {
      return await sendMastodonComment(postId, content);
    } else if (source === "fanfou") {
      return await sendFanfouComment(postId, content, replyToUserId);
    }
    return { success: false, error: "未知来源" };
  }

  // 获取缓存的评论
  function getCachedComments(postId) {
    return commentsCache.value[postId] || [];
  }

  // 检查是否正在加载
  function isLoading(postId) {
    return loadingComments.value[postId] || false;
  }

  // 清除缓存
  function clearCache(postId = null) {
    if (postId) {
      delete commentsCache.value[postId];
    } else {
      commentsCache.value = {};
    }
  }

  return {
    commentsCache,
    loadingComments,
    sendingComment,
    fetchComments,
    sendComment,
    getCachedComments,
    isLoading,
    clearCache
  };
}
