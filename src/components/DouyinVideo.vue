<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'

// 定义组件名称，以便 KeepAlive 正确缓存
defineOptions({
  name: 'DouyinVideo'
});
import { ElMessage } from 'element-plus'
import { useReport } from '../composables/useReport'
import DouyinReportDialog from './DouyinReportDialog.vue'
import DouyinCommentPanel from './DouyinCommentPanel.vue'
import DouyinSharePanel from './DouyinSharePanel.vue'

// 1. 基础状态
const { isVisible: showReport, onReportSubmit: handleReportSubmit } = useReport()
const showComments = ref(false)
const autoFocusComment = ref(false)
const commentPanelRef = ref<any>(null)

const openComments = (autoFocus = false) => {
  autoFocusComment.value = autoFocus
  showComments.value = true
}
const showShare = ref(false)
const isLiked = ref(false)
const likeCount = ref(50)
const commentCount = ref(2)
const collectCount = ref(2)
const shareCount = ref(28)
const isFollowed = ref(false)
const isCollected = ref(false)

// 快速评论逻辑
const showQuickEmojis = ref(false)
const quickEmojis = ['👏', '🤣', '🤠']
const longPressTimer = ref<any>(null)

const handleTouchStart = () => {
  longPressTimer.value = setTimeout(() => {
    showQuickEmojis.value = true
    // 震动反馈 (如果支持)
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50)
    }
  }, 500)
}

const handleTouchEnd = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const sendQuickComment = (emoji: string) => {
  if (commentPanelRef.value) {
    commentPanelRef.value.addExternalComment(emoji)
    ElMessage({
      message: '已评论',
      type: 'success',
      duration: 1500,
      offset: 100
    })
  }
  showQuickEmojis.value = false
}

// 点击外部关闭快速评论
const handleClickOutside = (e: MouseEvent) => {
  if (showQuickEmojis.value) {
    const target = e.target as HTMLElement
    if (!target.closest('.quick-emoji-bar') && !target.closest('.comment-sidebar-item')) {
      showQuickEmojis.value = false
    }
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

// 2. 视频信息
const authorName = ref('极客创意工作室')
const description = ref('这就是未来！用Vue3实现高仿抖音全屏视频交互。包含了双击点赞、侧边栏互动、底部信息展开等功能。大家觉得怎么样？欢迎在评论区讨论！#Vue3 #前端开发 #抖音UI #高仿')
const isExpanded = ref(false)
const musicName = ref('极客原创音乐 - 创意编程之路')

// 3. 交互逻辑
const lastTapTime = ref(0)
const showLikeHeart = ref(false)
const heartPosition = ref({ x: 0, y: 0 })

const douyinContainerRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  await nextTick();
  const height = douyinContainerRef.value?.offsetHeight || 0;
  console.log('[DouyinVideo] Natural Height:', height);
  
  // @ts-ignore
  window.__douyin_height = height;
  // @ts-ignore
  if (window.__redbook_height) {
    // @ts-ignore
    console.log('[DouyinVideo] Height Difference:', Math.abs(height - window.__redbook_height));
  }
});

// 双击点赞
const handleVideoClick = (e: MouseEvent) => {
  const now = Date.now()
  if (now - lastTapTime.value < 300) {
    // 双击逻辑
    if (!isLiked.value) {
      isLiked.value = true
      likeCount.value++
    }
    // 显示红心动画
    heartPosition.value = { x: e.clientX, y: e.clientY }
    showLikeHeart.value = true
    setTimeout(() => {
      showLikeHeart.value = false
    }, 800)
  }
  lastTapTime.value = now
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1
}

const toggleFollow = () => {
  isFollowed.value = !isFollowed.value
  if (isFollowed.value) {
    ElMessage.success('已关注')
  } else {
    ElMessage.info('已取消关注')
  }
}

const toggleCollect = () => {
  isCollected.value = !isCollected.value
  collectCount.value += isCollected.value ? 1 : -1
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num
}
const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  const seed = Math.floor(Math.random() * 1000)
  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}
</script>

<template>
  <div class="douyin-container" ref="douyinContainerRef" @click="handleVideoClick">
    <!-- 1. 模拟视频播放背景 -->
    <div class="video-placeholder">
      <img src="https://picsum.photos/1080/1920?random=1" alt="video-bg" class="bg-img" />
      <div class="play-icon-overlay">
        <van-icon name="play" />
      </div>
    </div>

    <!-- 2. 右侧操作栏 -->
    <div class="right-sidebar">
      <!-- 头像 & 关注 -->
      <div class="sidebar-item avatar-wrap">
        <div class="avatar">
          <img src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" alt="avatar" @error="handleAvatarError" />
        </div>
        <div 
          class="follow-btn" 
          :class="{ followed: isFollowed }" 
          @click.stop="toggleFollow"
        >
          <van-icon :name="isFollowed ? 'success' : 'plus'" />
        </div>
      </div>

      <!-- 点赞 -->
      <div class="sidebar-item" @click.stop="toggleLike">
        <div class="icon-box" :class="{ 'is-liked': isLiked }">
          <van-icon name="like" :color="isLiked ? '#ff2c55' : '#fff'" />
        </div>
        <span class="count">{{ formatNumber(likeCount) }}</span>
      </div>

      <!-- 评论 -->
      <div 
        class="sidebar-item comment-sidebar-item" 
        @click.stop="openComments(false)"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @mousedown="handleTouchStart"
        @mouseup="handleTouchEnd"
        @mouseleave="handleTouchEnd"
      >
        <div class="icon-box">
          <van-icon name="comment" color="#fff" />
        </div>
        <span class="count">{{ formatNumber(commentCount) }}</span>

        <!-- 快速评论表情栏 -->
        <transition name="emoji-slide">
          <div v-if="showQuickEmojis" class="quick-emoji-bar" @click.stop>
            <div 
              v-for="emoji in quickEmojis" 
              :key="emoji" 
              class="emoji-item"
              @click.stop="sendQuickComment(emoji)"
            >
              {{ emoji }}
            </div>
          </div>
        </transition>
      </div>

      <!-- 收藏 -->
      <div class="sidebar-item" @click.stop="toggleCollect">
        <div class="icon-box" :class="{ 'is-collected': isCollected }">
          <van-icon name="star" :color="isCollected ? '#face15' : '#fff'" />
        </div>
        <span class="count">{{ formatNumber(collectCount) }}</span>
      </div>

      <!-- 转发 -->
      <div class="sidebar-item" @click.stop="showShare = true">
        <div class="icon-box">
          <van-icon name="share" color="#fff" style="transform: scaleX(-1);" />
        </div>
        <span class="count">{{ formatNumber(shareCount) }}</span>
      </div>

      <!-- 唱片机 -->
      <div class="sidebar-item music-disc-wrap">
        <div class="music-notes">
          <div class="note note-1">♪</div>
          <div class="note note-2">♫</div>
          <div class="note note-3">♩</div>
        </div>
        <div class="music-disc">
          <div class="disc-inner">
            <img src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" alt="music" />
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 底部信息栏 -->
    <div class="bottom-info">
      <div class="author-row">
        <span class="author-name">@{{ authorName }}</span>
        <span 
          class="follow-tag" 
          v-if="!isFollowed"
          @click.stop="toggleFollow"
        > · 关注</span>
      </div>
      
      <div class="description-wrap" :class="{ expanded: isExpanded }">
        <p class="desc-text">
          {{ description }}
        </p>
        <span 
          v-if="description.length > 40" 
          class="expand-btn" 
          @click.stop="isExpanded = !isExpanded"
        >
          {{ isExpanded ? '收起' : '展开' }}
        </span>
      </div>

      <div class="music-row">
        <van-icon name="music-o" class="music-icon" />
        <div class="music-name-marquee">
          <span>{{ musicName }}</span>
        </div>
      </div>

      <!-- 底部发评论触发器 -->
      <div class="video-input-trigger" @click.stop="openComments(true)">
        <div class="fake-input">发条评论，说说你的感受...</div>
        <div class="input-right">
          <span class="at-icon">@</span>
          <van-icon name="smile-o" />
        </div>
      </div>
    </div>

    <!-- 4. 双击红心动画 -->
    <transition name="heart-pop">
      <div 
        v-if="showLikeHeart" 
        class="like-heart-animation"
        :style="{ left: heartPosition.x + 'px', top: heartPosition.y + 'px' }"
      >
        <van-icon name="like" color="#fe2c55" />
      </div>
    </transition>

    <!-- 5. 举报弹窗 (抖音定制风格) -->
    <DouyinReportDialog 
      v-if="showReport"
      v-model:visible="showReport" 
      type="post" 
      @submit="handleReportSubmit"
    />

    <!-- 6. 评论弹窗 (抖音 1:1 风格) -->
    <DouyinCommentPanel 
      ref="commentPanelRef"
      v-model:visible="showComments"
      v-model:autoFocusInput="autoFocusComment"
      v-model:commentCount="commentCount"
    />

    <!-- 7. 分享弹窗 (抖音 1:1 风格) -->
    <DouyinSharePanel 
      v-model:visible="showShare"
      v-model:shareCount="shareCount"
    />
  </div>
</template>

<style scoped lang="scss">
.douyin-container {
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
  overflow: hidden;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  /* 移除 contain: layout style paint; 以防止某些浏览器下 fixed 元素失效或被裁切 */
}

/* 视频背景 */
.video-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  
  .bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.8;
  }
  
  .play-icon-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 60px;
    color: rgba(255, 255, 255, 0.3);
    pointer-events: none;
  }
}

/* 右侧侧边栏 */
.right-sidebar {
  position: absolute;
  right: 12px;
  bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 10;
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
  
  .icon-box {
    font-size: 38px;
    margin-bottom: 0px;
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    
    &:active {
      transform: scale(0.8);
    }
    
    &.is-liked {
      animation: like-scale 0.4s ease;
    }

    .van-icon {
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }
  }
  
  .count {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  /* 快速评论表情栏 */
  .quick-emoji-bar {
    position: absolute;
    right: 50px;
    top: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 100;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    border: 0.5px solid rgba(255, 255, 255, 0.1);
    
    .emoji-item {
      font-size: 24px;
      padding: 4px;
      transition: transform 0.1s;
      
      &:active {
        transform: scale(1.3);
      }
    }
  }
}

.emoji-slide-enter-active,
.emoji-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.emoji-slide-enter-from,
.emoji-slide-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.8);
}

.avatar-wrap {
  position: relative;
  margin-bottom: 20px;
  
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid #fff;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  /* 关注按钮 */
  .follow-btn {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background: #ff2c55;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    .van-icon {
      font-size: 12px;
      color: #fff;
    }
    
    &.followed {
      background: #fff;
      .van-icon {
        color: #ff2c55;
      }
    }
  }
}

.music-disc-wrap {
  margin-top: 12px;
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-disc {
  width: 44px;
  height: 44px;
  background: repeating-radial-gradient(
    circle at center,
    #111 0,
    #111 2px,
    #222 2px,
    #222 4px
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: disc-rotate 4s linear infinite;
  border: 9px solid #111;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%);
    pointer-events: none;
  }
  
  .disc-inner {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.music-notes {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .note {
    position: absolute;
    color: #fff;
    font-size: 14px;
    opacity: 0;
    filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
  }
  
  .note-1 { animation: note-float-1 3s linear infinite; }
  .note-2 { animation: note-float-2 3s linear infinite 1s; }
  .note-3 { animation: note-float-3 3s linear infinite 2s; }
}

@keyframes note-float-1 {
  0% { transform: translate(0, 0) rotate(0) scale(0.5); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translate(-30px, -60px) rotate(-45deg) scale(1.2); opacity: 0; }
}

@keyframes note-float-2 {
  0% { transform: translate(0, 0) rotate(0) scale(0.5); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translate(-50px, -40px) rotate(45deg) scale(1.2); opacity: 0; }
}

@keyframes note-float-3 {
  0% { transform: translate(0, 0) rotate(0) scale(0.5); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translate(-40px, -70px) rotate(-20deg) scale(1.2); opacity: 0; }
}

/* 底部信息 */
.bottom-info {
  position: absolute;
  left: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  right: 80px;
  z-index: 10;
  pointer-events: auto;
  box-sizing: border-box;
}

.video-input-trigger {
  margin-top: 16px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  backdrop-filter: blur(5px);
  box-sizing: border-box;

  .fake-input {
    flex: 1;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
  }

  .input-right {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 18px;

    .at-icon {
      font-weight: 500;
    }
  }
}

.author-row {
  margin-bottom: 10px;
  .author-name {
    font-size: 17px;
    font-weight: 600;
  }
  .follow-tag {
    font-size: 15px;
    font-weight: 600;
  }
}

.description-wrap {
  position: relative;
  margin-bottom: 12px;
  
  .desc-text {
    font-size: 14px;
    line-height: 1.5;
    color: #fff;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }
  
  &.expanded {
    .desc-text {
      -webkit-line-clamp: unset;
      overflow: visible;
    }
  }
  
  .expand-btn {
    font-weight: 600;
    margin-left: 4px;
    font-size: 14px;
  }
}

.music-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  
  .music-icon {
    font-size: 16px;
  }
  
  .music-name-marquee {
    overflow: hidden;
    white-space: nowrap;
    width: 150px;
    
    span {
      display: inline-block;
      animation: marquee 8s linear infinite;
    }
  }
}

/* 动画 */
@keyframes disc-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes like-scale {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* 红心动画 */
.like-heart-animation {
  position: fixed;
  z-index: 999;
  font-size: 80px;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.heart-pop-enter-active {
  animation: heart-pop-in 0.8s ease-out forwards;
}

@keyframes heart-pop-in {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(-15deg);
    opacity: 0;
  }
  15% {
    transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
    opacity: 0.9;
  }
  30% {
    transform: translate(-50%, -50%) scale(1) rotate(-5deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -150%) scale(1.5) rotate(5deg);
    opacity: 0;
  }
}
</style>
