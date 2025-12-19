<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

// 定义组件名称，以便 KeepAlive 正确缓存
defineOptions({
  name: 'DouyinVideo'
});
import { ElMessage } from 'element-plus'
import { useReport } from '../composables/useReport'
import DouyinReportDialog from './DouyinReportDialog.vue'

// 1. 基础状态
const { isVisible: showReport, openReport, onReportSubmit: handleReportSubmit } = useReport()
const isLiked = ref(false)
const likeCount = ref(128400)
const commentCount = ref(5621)
const collectCount = ref(32000)
const shareCount = ref(8900)
const isFollowed = ref(false)
const isCollected = ref(false)

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
          <img src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" alt="avatar" />
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
          <van-icon :name="isLiked ? 'like' : 'like'" :color="isLiked ? '#fe2c55' : '#fff'" />
        </div>
        <span class="count">{{ formatNumber(likeCount) }}</span>
      </div>

      <!-- 评论 -->
      <div class="sidebar-item">
        <div class="icon-box">
          <van-icon name="comment" color="#fff" />
        </div>
        <span class="count">{{ formatNumber(commentCount) }}</span>
      </div>

      <!-- 收藏 -->
      <div class="sidebar-item" @click.stop="toggleCollect">
        <div class="icon-box" :class="{ 'is-collected': isCollected }">
          <van-icon :name="isCollected ? 'star' : 'star'" :color="isCollected ? '#face15' : '#fff'" />
        </div>
        <span class="count">{{ formatNumber(collectCount) }}</span>
      </div>

      <!-- 转发 -->
      <div class="sidebar-item">
        <div class="icon-box">
          <van-icon name="share" color="#fff" />
        </div>
        <span class="count">{{ formatNumber(shareCount) }}</span>
      </div>

      <!-- 更多/举报 -->
      <div class="sidebar-item" @click.stop="openReport('post')">
        <div class="icon-box">
          <van-icon name="ellipsis" color="#fff" />
        </div>
        <span class="count">更多</span>
      </div>

      <!-- 唱片机 -->
      <div class="sidebar-item music-disc">
        <div class="disc-inner">
          <img src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" alt="music" />
        </div>
      </div>
    </div>

    <!-- 3. 底部信息栏 -->
    <div class="bottom-info">
      <div class="author-row">
        <span class="author-name">@{{ authorName }}</span>
        <span class="follow-tag" v-if="!isFollowed"> · 关注</span>
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
  right: 8px;
  bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 10;
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  .icon-box {
    font-size: 32px;
    margin-bottom: 4px;
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    
    &:active {
      transform: scale(0.8);
    }
    
    &.is-liked {
      animation: like-scale 0.4s ease;
    }
  }
  
  .count {
    font-size: 12px;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
}

.avatar-wrap {
  position: relative;
  margin-bottom: 10px;
  
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1.5px solid #fff;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .follow-btn {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background: #fe2c55;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    
    &.followed {
      background: #face15;
    }
  }
}

.music-disc {
  margin-top: 10px;
  width: 44px;
  height: 44px;
  background: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: disc-rotate 5s linear infinite;
  
  .disc-inner {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

/* 底部信息 */
.bottom-info {
  position: absolute;
  left: 12px;
  bottom: 25px;
  right: 80px;
  z-index: 10;
  pointer-events: auto;
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
