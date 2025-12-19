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
import ReachedBottomTip from './ReachedBottomTip.vue';

// 1. 状态管理
const { isVisible: reportVisible, reportType, targetId: reportTargetId, openReport, onReportSubmit } = useReport();
const isLiked = ref(false);
const likeCount = ref(1258);
const isCollected = ref(false);
const collectCount = ref(856);
const commentCount = ref(128);
const isFollowed = ref(false);
const commentInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
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
  time: string;
  likeCount: number;
  isLiked: boolean;
}

const commentList = ref<Comment[]>([
  {
    id: 1,
    avatar: 'https://picsum.photos/100/100?random=20',
    name: '极简生活家',
    content: '这个配色真的太舒服了，收藏了！',
    time: '2小时前',
    likeCount: 45,
    isLiked: false
  },
  {
    id: 2,
    avatar: 'https://picsum.photos/100/100?random=21',
    name: '装修小白一枚',
    content: '请问那个木地板是什么型号的呀？',
    time: '5小时前',
    likeCount: 12,
    isLiked: true
  },
  {
    id: 3,
    avatar: 'https://picsum.photos/100/100?random=22',
    name: '大白鹅',
    content: '想知道沙发是什么牌子的，好种草。',
    time: '1天前',
    likeCount: 8,
    isLiked: false
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

const handleReport = (id?: string | number, type: 'post' | 'comment' = 'post') => {
  openReport(type, id || article.id);
};
</script>

<template>
  <div class="xhs-page" ref="xhsPageRef">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="nav-title">笔记</div>
      <div class="nav-right">
        <el-icon @click="handleShareClick"><Share /></el-icon>
        <el-dropdown trigger="click">
          <el-icon style="margin-left: 16px;"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleReport(article.id, 'post')">
                <el-icon><Warning /></el-icon>举报
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 滚动内容区域 -->
    <div class="main-content" ref="commentListRef">
      <!-- 作者信息栏 -->
      <div class="author-bar">
        <div class="author-info">
          <el-avatar :size="40" :src="article.author.avatar" />
          <div class="name-box">
            <span class="name">{{ article.author.name }}</span>
            <span class="time">{{ article.author.publishTime }}</span>
          </div>
        </div>
        <button 
          class="follow-btn" 
          :class="{ followed: isFollowed }"
          @click="handleFollow"
        >
          {{ isFollowed ? '已关注' : '关注' }}
        </button>
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
        <div class="comment-header">共 {{ commentCount }} 条评论</div>
        <div class="comment-list">
          <div v-for="cmt in commentList" :key="cmt.id" class="comment-item">
            <el-avatar :size="32" :src="cmt.avatar" class="cmt-avatar" />
            <div class="cmt-content-box">
              <div class="cmt-user-row">
                <span class="cmt-name">{{ cmt.name }}</span>
                <el-dropdown trigger="click">
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
              <div class="cmt-footer">
                <span class="cmt-time">{{ cmt.time }}</span>
                <div class="cmt-like" @click="handleCommentLike(cmt)">
                  <van-icon :name="cmt.isLiked ? 'like' : 'like-o'" :class="{ 'is-active': cmt.isLiked }" />
                  <span class="cmt-like-count">{{ cmt.likeCount }}</span>
                </div>
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
      <div class="bottom-actions-left">
        <div class="bottom-action-item" @click="handleLike">
          <van-icon :name="isLiked ? 'like' : 'like-o'" :color="isLiked ? '#ff2442' : '#333'" />
          <span class="action-count">{{ likeCount }}</span>
        </div>
        <div class="bottom-action-item" @click="handleCollect">
          <van-icon :name="isCollected ? 'star' : 'star-o'" :color="isCollected ? '#ffb800' : '#333'" />
          <span class="action-count">{{ collectCount }}</span>
        </div>
        <div class="bottom-action-item" @click="handleCommentClick">
          <van-icon name="comment-o" />
          <span class="action-count">{{ commentCount }}</span>
        </div>
      </div>
      
      <div class="comment-input-wrap">
        <van-icon name="edit" class="edit-icon" />
        <input 
          ref="inputRef"
          v-model="commentInput" 
          type="text" 
          placeholder="说点什么..." 
          class="comment-input"
        />
      </div>
      <button class="publish-btn" @click="handlePublishComment">发布</button>
    </div>

    <!-- 举报弹窗 -->
    <ReportDialog 
      v-model:visible="reportVisible" 
      :target-id="reportTargetId"
      :type="reportType"
      @submit="onReportSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.xhs-page {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Roboto, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft Yahei", sans-serif;
  color: #333;
  overflow: hidden;
}

/* 顶部导航栏 */
.nav-bar {
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  border-bottom: 0.5px solid #eee;
  flex-shrink: 0;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  font-size: 20px;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
}

/* 滚动内容区 */
.main-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: transparent;
}

/* 作者栏 */
.author-bar {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-info {
  display: flex;
  align-items: center;
}

.name-box {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
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
  color: #666;
  margin-bottom: 16px;
}

.comment-item {
  display: flex;
  margin-bottom: 20px;
}

.cmt-avatar {
  flex-shrink: 0;
}

.cmt-content-box {
  flex: 1;
  margin-left: 10px;
}

.cmt-user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cmt-name {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.cmt-more {
  font-size: 14px;
  color: #999;
  cursor: pointer;
}

.cmt-text {
  font-size: 14px;
  color: #333;
  margin: 6px 0;
  line-height: 1.5;
}

.cmt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cmt-time {
  font-size: 11px;
  color: #999;
}

.cmt-like {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 12px;
  
  .van-icon {
    font-size: 16px;
    margin-right: 4px;
    
    &.is-active {
      color: #ff2442;
    }
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

/* 底部操作栏 */
.bottom-bar {
  height: 54px;
  background: #fff;
  border-top: 0.5px solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 12px;
  padding-bottom: env(safe-area-inset-bottom);
  gap: 12px;
  z-index: 100;
  flex-shrink: 0;
}

.bottom-actions-left {
  display: flex;
  align-items: center;
  gap: 12px; /* 稍微减小间距以适应窄屏 */
  flex-shrink: 0; /* 禁止缩小 */
}

.bottom-action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  
  .van-icon {
    font-size: 22px;
    color: #333;
    display: flex;
    align-items: center;
  }
  
  .action-count {
    font-size: 13px;
    color: #333;
    font-weight: 500;
    line-height: 1;
    margin-top: 2px; /* 微调对齐 */
  }
  
  &:active {
    opacity: 0.6;
  }
}

.comment-input-wrap {
  flex: 1;
  height: 36px;
  background: #f5f5f5;
  border-radius: 18px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  min-width: 80px; /* 保证输入框最小宽度 */
}

.edit-icon {
  font-size: 16px;
  color: #999;
  margin-right: 6px;
}

.comment-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
  width: 100%;
  
  &::placeholder {
    color: #999;
  }
}

.publish-btn {
  border: none;
  background: transparent;
  color: #ff2442;
  font-size: 15px;
  font-weight: 600;
  padding: 0 4px;
  flex-shrink: 0; /* 禁止缩小 */
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:disabled {
    color: #ffb5be;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    opacity: 0.5;
  }
}
</style>
