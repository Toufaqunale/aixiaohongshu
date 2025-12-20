<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, onUpdated, nextTick } from 'vue';

// 定义组件名称，以便 KeepAlive 正确缓存
defineOptions({
  name: 'RedBookPost'
});
import { 
  ArrowLeft, 
  MoreFilled, 
  Share, 
  Warning
} from '@element-plus/icons-vue';
import { showToast } from 'vant';
import { useReport } from '../composables/useReport';
import ReportDialog from './ReportDialog.vue';
import RedBookReport from './RedBookReport.vue';
import RedBookRightsReport from './RedBookRightsReport.vue';
import ShareSheet from './ShareSheet.vue';
import ReachedBottomTip from './ReachedBottomTip.vue';

// 1. 状态管理
const { isVisible: reportVisible, reportType, targetId: reportTargetId, openReport, onReportSubmit } = useReport();
const newReportVisible = ref(false);
const rightsReportVisible = ref(false);
const shareVisible = ref(false);
const isLiked = ref(false);
const likeCount = ref(88);
const isCollected = ref(false);
const collectCount = ref(66);
const commentCount = ref(32);

// 格式化数字，参考小红书
const formatCount = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
};
const isFollowed = ref(false);
const commentInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const xhsPageRef = ref<HTMLElement | null>(null);
const commentSectionRef = ref<HTMLElement | null>(null);
const commentListRef = ref<HTMLElement | null>(null);
const isReachedBottom = ref(false);

// 节流函数实现 (支持末尾调用，确保捕获最后一次滚动)
const throttle = (fn: Function, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastTime = 0;
  
  return function(this: any, ...args: any[]) {
    const now = Date.now();
    const remaining = delay - (now - lastTime);
    
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn.apply(this, args);
      lastTime = now;
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
};

// 检查是否滚动到底部
const checkIfReachedBottom = (el: HTMLElement | null): boolean => {
  if (!el) return false;
  
  // 使用 Math.ceil 处理亚像素精度问题
  const scrollTop = Math.ceil(el.scrollTop);
  const clientHeight = el.clientHeight;
  const scrollHeight = el.scrollHeight;
  
  const threshold = 10; // 缓冲像素
  // 核心判断公式
  return scrollHeight - scrollTop - threshold <= clientHeight;
};

const handleScroll = throttle(() => {
  if (commentListRef.value) {
    const newState = checkIfReachedBottom(commentListRef.value);
    if (isReachedBottom.value !== newState) {
      isReachedBottom.value = newState;
    }
  }
}, 150); // 确保节流时间不是太短

onMounted(async () => {
  await nextTick();
  
  // 添加滚动监听（同时监听 scroll 和 touchmove 以支持移动端）
  commentListRef.value?.addEventListener('scroll', handleScroll);
  commentListRef.value?.addEventListener('touchmove', handleScroll);
  
  // 初始检查一次
  if (commentListRef.value) {
    isReachedBottom.value = checkIfReachedBottom(commentListRef.value);
  }
  
  const height = xhsPageRef.value?.offsetHeight || 0;
  console.log('[RedBookPost] Natural Height:', height);
  
  // @ts-ignore
  window.__redbook_height = height;
  // @ts-ignore
  if (window.__douyin_height) {
    // @ts-ignore
    console.log('[RedBookPost] Height Difference:', Math.abs(height - window.__douyin_height));
  }
});

onUpdated(() => {
  if (commentListRef.value) {
    // 在每次组件更新后都检查一次，确保状态与真实DOM位置同步
    const newState = checkIfReachedBottom(commentListRef.value);
    if (isReachedBottom.value !== newState) {
      isReachedBottom.value = newState;
    }
  }
});

onUnmounted(() => {
  commentListRef.value?.removeEventListener('scroll', handleScroll);
  commentListRef.value?.removeEventListener('touchmove', handleScroll);
});

// 示例文章数据
const article = reactive({
  id: '1',
  author: {
    avatar: 'https://picsum.photos/100/100?random=10',
    name: '设计美学社',
    publishTime: '12-19',
  },
  content: {
    title: '今日份治愈系空间设计分享 🌿',
    text: `今天给大家分享一套极简原木风的空间设计，整体色调以暖白和浅原木色为主，营造出一种自然、舒适、宁静的居家氛围。\n\n设计亮点：\n1. 大面积留白，增加空间通透感。\n2. 选用天然木材质，触感温润。\n3. 绿植点缀，为空间注入活力。\n\n如果你也喜欢这种风格，记得点赞收藏哦！✨\n\n#家居设计 #原木风 #极简主义 #室内设计 #我的装修日志`,
  },
  images: [
    'https://picsum.photos/800/1000?random=1',
    'https://picsum.photos/800/1000?random=2',
    'https://picsum.photos/800/1000?random=3',
  ]
});

// 评论列表数据
interface Comment {
  id: number;
  avatar: string;
  name: string;
  content: string;
  image?: string; // 评论图片
  sticker?: string; // 评论表情包
  time: string;
  location: string;
  likeCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  isAuthor?: boolean;
  isFirst?: boolean;
  showReplies?: boolean;
  replies?: Comment[];
}

const commentList = ref<Comment[]>([
  {
    id: 1,
    avatar: 'https://picsum.photos/100/100?random=20',
    name: '莫小池中水',
    content: '据说是因为哥斯拉从 兴隆湖 º 复活了，但是成都超人已经去镇压了，不用担心',
    time: '2小时前',
    location: '四川',
    likeCount: 96,
    isLiked: false,
    isDisliked: false,
    replies: [
      {
        id: 11,
        avatar: 'https://picsum.photos/100/100?random=25',
        name: '自觉无趣',
        content: '听说哥斯拉已经被 成都超人 º 变成成都之心了',
        time: '2小时前',
        location: '四川',
        likeCount: 11,
        isLiked: false,
        isDisliked: false,
        replies: []
      }
    ],
    showReplies: false
  },
  {
    id: 2,
    avatar: 'https://picsum.photos/100/100?random=21',
    name: '如鱼得水',
    content: '在成都也能有个撒，况且还在新隆湖，难不成哥斯拉从湖里复活啦。一天天大惊小怪',
    time: '2小时前',
    location: '四川',
    likeCount: 27,
    isLiked: true,
    isDisliked: false,
    replies: []
  },
  {
    id: 3,
    avatar: 'https://picsum.photos/100/100?random=22',
    name: '我不是地球人我是什么',
    content: '咋没听到这个广播😂',
    time: '6小时前',
    location: '四川',
    likeCount: 6,
    isLiked: false,
    isDisliked: false,
    isAuthor: false,
    isFirst: true
  },
  {
    id: 4,
    avatar: 'https://picsum.photos/100/100?random=1',
    name: '阿木木',
    content: '我也听到了，就在刚才！',
    time: '1小时前',
    location: '四川',
    likeCount: 3,
    isLiked: false,
    isDisliked: false,
    isAuthor: true
  }
]);

// 2. 互动函数
const handleLike = () => {
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    likeCount.value++;
    showToast('点赞成功');
  } else {
    likeCount.value--;
  }
};

const handleCollect = () => {
  isCollected.value = !isCollected.value;
  if (isCollected.value) {
    collectCount.value++;
    showToast('收藏成功');
  } else {
    collectCount.value--;
  }
};

const handleFollow = () => {
  isFollowed.value = !isFollowed.value;
  showToast(isFollowed.value ? '已关注' : '已取消关注');
};

// 评论弹窗相关
const showCommentPopup = ref(false);
const popupCommentInput = ref('');
const replyTargetName = ref('');
const replyParentId = ref<number | null>(null);
const commentPopupRef = ref<any>(null);

// 表情包和图片逻辑
const selectedImage = ref<string | null>(null);
const selectedSticker = ref<string | null>(null);
const showStickerPanel = ref(false);

const stickers = [
  'https://img.js.design/assets/illustration/646db870e28e830e25181788/v1/image.png',
  'https://img.js.design/assets/illustration/646db870e28e830e25181788/v2/image.png',
  'https://img.js.design/assets/illustration/646db870e28e830e25181788/v3/image.png',
  'https://img.js.design/assets/illustration/646db870e28e830e25181788/v4/image.png',
  'https://img.js.design/assets/illustration/646db870e28e830e25181788/v5/image.png',
  'https://img.js.design/assets/illustration/646db870e28e830e25181788/v6/image.png',
];

const toggleStickerPanel = () => {
  showStickerPanel.value = !showStickerPanel.value;
};

const selectSticker = (sticker: string) => {
  selectedSticker.value = sticker;
  showStickerPanel.value = false;
};

const removeSelectedImage = () => {
  selectedImage.value = null;
};

const removeSelectedSticker = () => {
  selectedSticker.value = null;
};

const openCommentPopup = (targetName?: string, parentId?: number) => {
  if (targetName) {
    replyTargetName.value = targetName;
    replyParentId.value = parentId || null;
  } else {
    replyTargetName.value = '';
    replyParentId.value = null;
  }
  selectedImage.value = null;
  selectedSticker.value = null;
  showStickerPanel.value = false;
  showCommentPopup.value = true;
  // 延迟聚焦确保 DOM 已渲染
  nextTick(() => {
    commentPopupRef.value?.focus();
  });
};

const handleSendComment = () => {
  if (!popupCommentInput.value.trim() && !selectedImage.value && !selectedSticker.value) return;
  
  const newComment: Comment = {
    id: Date.now(),
    avatar: 'https://picsum.photos/100/100?random=50',
    name: '我',
    content: popupCommentInput.value,
    image: selectedImage.value || undefined,
    sticker: selectedSticker.value || undefined,
    time: '刚刚',
    location: '四川',
    likeCount: 0,
    isLiked: false,
    isDisliked: false,
    replies: []
  };

  if (replyParentId.value) {
    // 寻找父评论并添加回复
    const parentComment = commentList.value.find(c => c.id === replyParentId.value);
    if (parentComment) {
      if (!parentComment.replies) parentComment.replies = [];
      // 如果是回复某人，内容加上回复前缀（可选，小红书通常在UI显示“回复 @xxx”）
      parentComment.replies.push(newComment);
      parentComment.showReplies = true; // 自动展开回复
    }
  } else {
    // 一级评论，添加到列表最前面
    commentList.value.unshift(newComment);
  }

  commentCount.value++;
  showToast('发布成功');
  
  popupCommentInput.value = '';
  showCommentPopup.value = false;
};

// 自动聚焦指令
const vFocus = {
  mounted: (el: HTMLTextAreaElement) => el.focus()
};

const handleBack = () => {
  // 模拟返回逻辑
  console.log('Back button clicked');
  window.history.back();
};

const handleCommentClick = () => {
  // 1. 滚动到评论区
  const el = commentSectionRef.value;
  if (el) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
  
  // 2. 聚焦输入框
  inputRef.value?.focus();
};

const handleShareClick = () => {
  showToast('点击了分享');
};

const handlePublishComment = () => {
  if (!commentInput.value.trim()) {
    showToast('请输入内容');
    return;
  }
  commentCount.value++;
  showToast('发布成功');
  commentInput.value = '';
};

const handleCommentLike = (comment: Comment) => {
  comment.isLiked = !comment.isLiked;
  if (comment.isLiked) {
    comment.likeCount++;
  } else {
    comment.likeCount--;
  }
};

const handleCommentDislike = (comment: Comment) => {
  comment.isDisliked = !comment.isDisliked;
  if (comment.isDisliked) {
    showToast('将减少此类内容推荐');
    // 如果点赞了，则取消点赞
    if (comment.isLiked) {
      comment.isLiked = false;
      comment.likeCount--;
    }
  } else {
    showToast('已取消不喜欢');
  }
};

const toggleReplies = (comment: Comment) => {
  comment.showReplies = !comment.showReplies;
};

const handleInputToolClick = (type: 'at' | 'emoji' | 'photo') => {
  switch (type) {
    case 'at':
      commentInput.value += '@';
      showToast('选择要@的用户');
      break;
    case 'emoji':
      showToast('打开表情面板');
      break;
    case 'photo':
      fileInputRef.value?.click();
      break;
  }
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImage.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
};

const handleReport = (id?: string | number, type: 'post' | 'comment' = 'post') => {
  // 放弃旧的 ReportDialog，改用新的 1:1 高保真 RedBookReport 界面
  newReportVisible.value = true;
};

const handleNewReportSelect = (reason: any) => {
  // 处理举报原因选择
  console.log('Selected report reason:', reason);
  if (reason.value === 'rights_violation') {
    // 如果是权益侵犯，关闭一级选择框，打开多步侵权投诉流程
    newReportVisible.value = false;
    rightsReportVisible.value = true;
  } else {
    showToast(`已收到举报：${reason.title}`);
    newReportVisible.value = false;
  }
};
</script>

<template>
  <div class="xhs-page" ref="xhsPageRef">
    <!-- 隐藏的文件输入框 -->
    <input 
      type="file" 
      ref="fileInputRef" 
      style="display: none" 
      accept="image/*"
      @change="handleFileChange"
    />
    <!-- 滚动内容区域 -->
    <div class="main-content" ref="commentListRef">
      <!-- 作者信息栏 (包含返回和操作) -->
      <div class="author-bar">
        <div class="author-left">
          <div class="back-btn" @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
          </div>
          <div class="author-info">
            <el-avatar :size="36" :src="article.author.avatar" />
            <div class="name-box">
              <span class="name">{{ article.author.name }}</span>
              <span class="time">{{ article.author.publishTime }}</span>
            </div>
          </div>
        </div>
        <div class="author-actions">
          <button 
            class="follow-btn" 
            :class="{ followed: isFollowed }"
            @click="handleFollow"
          >
            {{ isFollowed ? '已关注' : '关注' }}
          </button>
          
          <div class="share-btn-wrap" @click="shareVisible = true">
            <van-icon name="share-o" class="xhs-share-icon" />
          </div>
        </div>
      </div>

      <!-- 图文内容区域 -->
      <div class="content-area">
        <!-- 图片滑动 -->
        <van-swipe class="my-swipe" :loop="false" indicator-color="white">
          <van-swipe-item v-for="(img, index) in article.images" :key="index">
            <img :src="img" class="swipe-img" />
          </van-swipe-item>
        </van-swipe>

        <!-- 笔记正文 -->
        <div class="article-body">
          <h1 class="article-title">{{ article.content.title }}</h1>
          <div class="article-text">
            {{ article.content.text }}
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comment-section" ref="commentSectionRef">
        <div class="comment-header">
          <span>共 {{ commentCount }} 条评论</span>
          <van-icon name="descending" class="sort-icon" />
        </div>
        
        <!-- 用户发表评论框 (小红书 1:1 复刻) -->
        <div class="user-comment-input-area" @click="openCommentPopup()">
          <el-avatar :size="32" src="https://picsum.photos/100/100?random=50" class="user-avatar" />
          <div class="input-container">
            <van-icon name="at-sign" class="input-at-icon" />
            <div class="main-comment-placeholder">爱评论的人运气都不差</div>
            <div class="input-tools">
              <van-icon name="smile-o" class="tool-icon" />
              <van-icon name="photo-o" class="tool-icon" />
            </div>
          </div>
        </div>

        <div class="comment-list">
          <div v-for="cmt in commentList" :key="cmt.id" class="comment-item-wrap">
            <div class="comment-item">
              <el-avatar :size="32" :src="cmt.avatar" class="cmt-avatar" />
              <div class="cmt-content-box" @click="openCommentPopup(cmt.name, cmt.id)">
                <div class="cmt-user-row">
                  <div class="cmt-user-info">
                    <span class="cmt-name">{{ cmt.name }}</span>
                    <span v-if="cmt.isAuthor" class="author-tag">作者</span>
                  </div>
                  <el-dropdown trigger="click" @click.stop>
                      <el-icon class="cmt-more"><MoreFilled /></el-icon>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="handleReport(cmt.id, 'comment')">
                            <el-icon><Warning /></el-icon>举报
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                  <p class="cmt-text">{{ cmt.content }}</p>
                  <div v-if="cmt.image" class="cmt-image-box">
                    <img :src="cmt.image" class="cmt-image" @click.stop />
                  </div>
                  <div v-if="cmt.sticker" class="cmt-sticker-box">
                    <img :src="cmt.sticker" class="cmt-sticker" @click.stop />
                  </div>
                  <div v-if="cmt.isFirst" class="first-tag">首评</div>
                  <div class="cmt-footer">
                    <div class="cmt-footer-left">
                      <span class="cmt-time">{{ cmt.time }}</span>
                      <span class="cmt-location">{{ cmt.location }}</span>
                      <span class="cmt-reply-btn" @click.stop="openCommentPopup(cmt.name, cmt.id)">回复</span>
                    </div>
                    <div class="cmt-actions">
                      <div class="cmt-like" @click.stop="handleCommentLike(cmt)">
                        <van-icon :name="cmt.isLiked ? 'like' : 'like-o'" :class="{ 'is-active': cmt.isLiked }" />
                        <span class="cmt-count" v-if="cmt.likeCount > 0">{{ cmt.likeCount }}</span>
                      </div>
                      <div class="cmt-dislike" :class="{ 'is-active': cmt.isDisliked }" @click.stop="handleCommentDislike(cmt)">
                        <van-icon name="closed-eye" />
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            <!-- 二级评论 (回复) -->
            <div v-if="cmt.replies && cmt.replies.length > 0" class="reply-list">
              <template v-if="cmt.showReplies">
                <div v-for="reply in cmt.replies" :key="reply.id" class="reply-item">
                  <el-avatar :size="24" :src="reply.avatar" class="reply-avatar" />
                  <div class="cmt-content-box" @click="openCommentPopup(reply.name, cmt.id)">
                    <div class="cmt-user-row">
                      <div class="cmt-user-info">
                        <span class="cmt-name">{{ reply.name }}</span>
                        <span v-if="reply.isAuthor" class="author-tag">作者</span>
                      </div>
                    </div>
                    <p class="cmt-text">{{ reply.content }}</p>
                    <div v-if="reply.image" class="cmt-image-box">
                      <img :src="reply.image" class="cmt-image" @click.stop />
                    </div>
                    <div v-if="reply.sticker" class="cmt-sticker-box">
                      <img :src="reply.sticker" class="cmt-sticker" @click.stop />
                    </div>
                    <div class="cmt-footer">
                      <div class="cmt-footer-left">
                        <span class="cmt-time">{{ reply.time }}</span>
                        <span class="cmt-location">{{ reply.location }}</span>
                        <span class="cmt-reply-btn" @click.stop="openCommentPopup(reply.name, cmt.id)">回复</span>
                      </div>
                      <div class="cmt-actions">
                        <div class="cmt-like" @click.stop="handleCommentLike(reply)">
                          <van-icon :name="reply.isLiked ? 'like' : 'like-o'" :class="{ 'is-active': reply.isLiked }" />
                          <span class="cmt-count" v-if="reply.likeCount > 0">{{ reply.likeCount }}</span>
                        </div>
                        <div class="cmt-dislike" :class="{ 'is-active': reply.isDisliked }" @click.stop="handleCommentDislike(reply)">
                          <van-icon name="closed-eye" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              
              <!-- 展开/收起回复 -->
              <div class="expand-replies" @click="toggleReplies(cmt)">
                <span class="expand-line"></span>
                <span class="expand-text">{{ cmt.showReplies ? '收起' : `展开 ${cmt.replies.length} 条回复` }}</span>
                <van-icon :name="cmt.showReplies ? 'arrow-up' : 'arrow-down'" class="expand-arrow" />
              </div>
            </div>
          </div>
        </div>
        <!-- 到底提示容器 -->
        <div class="bottom-tip-container">
          <ReachedBottomTip v-if="isReachedBottom" />
        </div>
      </div>

      <!-- 底部占位 -->
      <div class="bottom-placeholder"></div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <div class="comment-input-wrap" @click="openCommentPopup()">
        <van-icon name="edit" class="edit-icon" />
        <div class="bottom-input-placeholder">说点什么...</div>
      </div>

      <div class="bottom-actions-right">
        <div class="bottom-action-item" @click="handleLike">
          <van-icon :name="isLiked ? 'like' : 'like-o'" :class="{ 'is-active': isLiked }" />
          <span class="action-count">{{ formatCount(likeCount) }}</span>
        </div>
        <div class="bottom-action-item" @click="handleCollect">
          <van-icon :name="isCollected ? 'star' : 'star-o'" :class="{ 'is-active': isCollected }" />
          <span class="action-count">{{ formatCount(collectCount) }}</span>
        </div>
        <div class="bottom-action-item" @click="handleCommentClick">
          <van-icon name="comment-o" />
          <span class="action-count">{{ formatCount(commentCount) }}</span>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <ShareSheet 
      v-model:visible="shareVisible"
      :cover-image="article.images[0]"
      @report="handleReport(article.id, 'post')"
      @share="handleShareClick"
      @dislike="showToast('将减少此类内容推荐')"
    />

    <!-- 举报弹窗 -->
    <ReportDialog 
      v-model:visible="reportVisible" 
      :target-id="reportTargetId"
      :type="reportType"
      @submit="onReportSubmit"
    />

    <!-- 新的高保真举报界面 -->
    <RedBookReport 
      v-model:visible="newReportVisible"
      @select="handleNewReportSelect"
    />

    <!-- 侵权投诉流程界面 -->
    <RedBookRightsReport
      v-model:visible="rightsReportVisible"
    />

    <!-- 1:1 复刻评论回复弹窗 -->
    <van-popup
      v-model:show="showCommentPopup"
      position="bottom"
      round
      class="comment-popup"
      :overlay-style="{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }"
    >
      <div class="comment-popup-content">
        <!-- 预览已选择的内容 -->
        <div v-if="selectedImage || selectedSticker" class="popup-preview-area">
          <div v-if="selectedImage" class="preview-item">
            <img :src="selectedImage" class="preview-img" />
            <van-icon name="clear" class="remove-icon" @click="removeSelectedImage" />
          </div>
          <div v-if="selectedSticker" class="preview-item sticker-preview">
            <img :src="selectedSticker" class="preview-sticker" />
            <van-icon name="clear" class="remove-icon" @click="removeSelectedSticker" />
          </div>
        </div>

        <textarea
          v-model="popupCommentInput"
          class="popup-textarea"
          :placeholder="replyTargetName ? `回复 ${replyTargetName}` : '爱评论的人运气都不差'"
          ref="commentPopupRef"
          v-focus
        ></textarea>
        
        <div class="popup-toolbar">
          <div class="toolbar-left">
            <van-icon name="at-sign" class="toolbar-icon" />
            <van-icon name="smile-o" class="toolbar-icon" @click="toggleStickerPanel" :class="{ 'is-active': showStickerPanel }" />
            <van-icon name="photo-o" class="toolbar-icon" @click="fileInputRef?.click()" />
            <van-icon name="audio" class="toolbar-icon" />
            <van-icon name="plus" class="toolbar-icon" />
          </div>
          <button 
            class="send-btn" 
            :disabled="!popupCommentInput.trim() && !selectedImage && !selectedSticker"
            @click="handleSendComment"
          >
            发送
          </button>
        </div>

        <!-- 表情包面板 -->
        <div v-if="showStickerPanel" class="sticker-panel">
          <div class="sticker-list">
            <div 
              v-for="(src, idx) in stickers" 
              :key="idx" 
              class="sticker-item"
              @click="selectSticker(src)"
            >
              <img :src="src" />
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.xhs-page {
  * {
    box-sizing: border-box;
  }
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Roboto, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft Yahei", sans-serif;
  color: #333;
  overflow: hidden;
  overflow-x: hidden;
}

/* 顶部导航栏 */
.nav-bar {
  display: none; /* 已经移入作者栏 */
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  font-size: 20px;
}

.share-btn-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.6;
  }
}

.xhs-share-icon {
  font-size: 24px;
  color: #333;
  font-weight: bold;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
}

/* 滚动内容区 */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: transparent;
}

/* 作者栏 */
.author-bar {
  background: #fff;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 0.5px solid #f5f5f5;
}

.author-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.back-btn {
  font-size: 20px;
  color: #333;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:active {
    opacity: 0.6;
  }
}

.author-actions {
  display: flex;
  align-items: center;
  gap: 12px; /* 关注按钮与转发按钮的间距 */
}

.author-info {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.name-box {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.follow-btn {
  border: 1px solid #ff2442;
  background: transparent;
  color: #ff2442;
  border-radius: 20px;
  padding: 4px 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  
  &:active {
    opacity: 0.7;
    transform: scale(0.95);
  }
  
  &.followed {
    border-color: #eee;
    color: #999;
  }
}

/* 内容区域 */
.content-area {
  background: #fff;
}

.my-swipe {
  width: 100%;
  height: 500px;
  border-bottom: 0.5px solid #f5f5f5;
}

.swipe-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s;
  
  &:active {
    opacity: 0.9;
  }
}

.article-body {
  padding: 16px;
  border-bottom: 0.5px solid #f5f5f5;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
}

.article-text {
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: #333;
}

/* 评论区样式 */
.comment-section {
  background: #fff;
  padding: 16px;
  margin-top: 0;
}

.comment-header {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-icon {
  font-size: 16px;
  color: #666;
}

/* 用户评论输入框 (1:1 复刻小红书) */
.user-comment-input-area {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  padding: 0; /* 移除内边距，确保与下方列表完全对齐 */
}

.user-avatar {
  flex-shrink: 0;
  border: 0.5px solid #f0f0f0;
}

.input-container {
  flex: 1;
  height: 36px;
  background: #f5f5f5;
  border-radius: 18px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  position: relative;
  min-width: 0;
}

.input-at-icon {
  font-size: 18px;
  color: #666;
  margin-right: 8px;
  cursor: pointer;
}

.main-comment-placeholder {
  flex: 1;
  font-size: 14px;
  color: #999;
  cursor: text;
}

.input-tools {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tool-icon {
  font-size: 18px;
  color: #666;
  cursor: pointer;
}

.tool-icon:active {
  opacity: 0.6;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item-wrap {
  margin-bottom: 8px;
}

.comment-item {
  display: flex;
}

.cmt-avatar {
  flex-shrink: 0;
  border: 0.5px solid #f0f0f0;
}

.cmt-content-box {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  padding: 2px 4px;
  margin-right: -4px;
  
  &:active {
    background-color: #f9f9f9;
  }
}

.cmt-user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.cmt-user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.cmt-name {
  font-size: 12px;
  color: #999;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.author-tag {
  font-size: 10px;
  background: #ff2442;
  color: #fff;
  padding: 0 4px;
  border-radius: 2px;
  line-height: 1.4;
}

.first-tag {
  display: inline-block;
  font-size: 10px;
  color: #999;
  background: #f5f5f5;
  padding: 0 4px;
  border-radius: 2px;
  margin-bottom: 8px;
}

.cmt-more {
  font-size: 14px;
  color: #ccc;
  cursor: pointer;
}

.cmt-text {
  font-size: 14px;
  color: #333;
  margin: 4px 0 8px;
  line-height: 1.6;
  word-break: break-word;
}

.cmt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cmt-footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.cmt-time, .cmt-location {
  color: #999;
}

.cmt-reply-btn {
  font-weight: 500;
  color: #666;
  cursor: pointer;
}

.cmt-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cmt-like, .cmt-dislike {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #999;
}

.cmt-like .van-icon {
  font-size: 18px;
}

.cmt-dislike .van-icon {
  font-size: 18px;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cmt-count {
  font-size: 12px;
  color: #999;
}

.cmt-like .van-icon.is-active {
  color: #ff2442;
}

.cmt-dislike.is-active {
  color: #ff2442;
}

/* 二级评论样式 */
.reply-list {
  margin-left: 44px; /* 32px avatar + 12px margin */
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-item {
  display: flex;
}

.reply-avatar {
  flex-shrink: 0;
  border: 0.5px solid #f0f0f0;
}

/* 展开更多回复 */
.expand-replies {
  display: flex;
  align-items: center;
  margin-top: 12px;
  cursor: pointer;
  
  &:active {
    opacity: 0.6;
  }
}

.expand-line {
  width: 20px;
  height: 0.5px;
  background: #eee;
  margin-right: 8px;
}

.expand-text {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  margin-right: 4px;
}

.expand-arrow {
  font-size: 12px;
  color: #999;
}

/* 评论弹窗样式 */
.comment-popup {
  background: #fff;
}

.comment-popup-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.popup-textarea {
  width: 100%;
  height: 100px;
  border: none;
  background: #f8f8f8;
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
  color: #333;
  resize: none;
  outline: none;
  margin-bottom: 12px;
  
  &::placeholder {
    color: #ccc;
  }
}

.popup-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-icon {
  font-size: 22px;
  color: #333;
  cursor: pointer;
  
  &:active {
    opacity: 0.6;
  }
}

.send-btn {
  padding: 6px 20px;
  background: #ffcbd2; /* 浅粉色背景 */
  color: #fff;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  
  &:not(:disabled) {
    background: #ff2442;
  }
  
  &:active:not(:disabled) {
    opacity: 0.8;
  }
}

.emoji-bar {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  padding: 0 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
}

.emoji-item {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  
  &:active {
    transform: scale(0.9);
  }
}

.bottom-tip-container {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bottom-placeholder {
  height: 80px;
  background: transparent;
}

/* 评论中的图片和表情包 */
.cmt-image-box {
  margin-top: 8px;
  max-width: 150px;
  border-radius: 8px;
  overflow: hidden;
}

.cmt-image {
  width: 100%;
  display: block;
}

.cmt-sticker-box {
  margin-top: 8px;
  width: 100px;
}

.cmt-sticker {
  width: 100%;
  display: block;
}

/* 弹窗预览区 */
.popup-preview-area {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
}

.preview-item {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  border: 0.5px solid #eee;
  
  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .remove-icon {
    position: absolute;
    top: -6px;
    right: -6px;
    font-size: 16px;
    color: #666;
    background: #fff;
    border-radius: 50%;
  }
}

.sticker-preview {
  border: none;
  .preview-sticker {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

/* 表情包面板 */
.sticker-panel {
  margin-top: 12px;
  border-top: 0.5px solid #f5f5f5;
  padding-top: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.sticker-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.sticker-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  &:active {
    background: #f5f5f5;
    border-radius: 8px;
  }
}

.toolbar-icon.is-active {
  color: #ff2442;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52px;
  background: #fff;
  border-top: 0.5px solid #f5f5f5;
  display: flex;
  align-items: center;
  padding: 0 8px; /* 减小两侧边距 */
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.comment-input-wrap {
  flex: 1;
  height: 34px;
  background: #f5f5f5;
  border-radius: 17px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  margin-right: 8px; /* 减小输入框与右侧图标的间距 */
  min-width: 0; /* 允许 flex 项目缩小 */
}

.edit-icon {
  font-size: 14px;
  color: #666;
  margin-right: 4px;
  flex-shrink: 0;
}

.bottom-input-placeholder {
  flex: 1;
  font-size: 13px;
  color: #999;
}

.bottom-actions-right {
  display: flex;
  align-items: center;
  gap: 10px; /* 减小图标之间的间距，原为 16px */
  flex-shrink: 0; /* 确保右侧图标不被压缩 */
}

.bottom-action-item {
  display: flex;
  align-items: center;
  gap: 2px; /* 减小图标与数字的间距 */
  color: #333;
  cursor: pointer;
}

.bottom-action-item .van-icon {
  font-size: 20px; /* 稍微减小图标大小，原为 22px */
  font-weight: 500;
}

.bottom-action-item .van-icon.is-active {
  color: #ff2442;
}

.bottom-action-item .van-icon-star.is-active {
  color: #ffb800;
}

.action-count {
  font-size: 12px; /* 稍微减小数字字体，原为 13px */
  font-weight: 500;
  color: #333;
  white-space: nowrap; /* 确保数字不换行 */
}

.publish-btn {
  margin-left: 12px;
  padding: 6px 16px;
  background: #ff2442;
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.publish-btn:active {
  opacity: 0.8;
}
</style>
