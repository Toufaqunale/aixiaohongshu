<script setup lang="ts">
import { ref, computed } from 'vue'
import RedBookPost from './components/RedBookPost.vue'
import DouyinVideo from './components/DouyinVideo.vue'
import PlatformSwitcher from './components/PlatformSwitcher.vue'

const currentPlatform = ref<'redbook' | 'douyin'>('redbook')

// 动态组件映射
const currentComponent = computed(() => {
  return currentPlatform.value === 'redbook' ? RedBookPost : DouyinVideo
})
</script>

<template>
  <div class="app-container" :class="currentPlatform">
    <PlatformSwitcher v-model="currentPlatform" />
    
    <div class="content-wrapper">
      <transition name="platform-slide" mode="out-in">
        <keep-alive>
          <component :is="currentComponent" :key="currentPlatform" />
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* 防止两个平台切换时产生滚动条抖动 */
}

.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.5s;
}

.app-container.redbook {
  background-color: #fff;
}

.app-container.douyin {
  background-color: #000;
}

/* 抖音模式下 switcher 背景色调整 */
.app-container.douyin :deep(.platform-switcher-wrap) {
  background-color: #000;
  border-bottom-color: #1a1a1a;
}

.app-container.douyin :deep(.switcher-container) {
  background-color: #1a1a1a;
}

.app-container.douyin :deep(.indicator) {
  background-color: #333;
}

.app-container.douyin :deep(.platform-name) {
  color: #999;
}

.content-wrapper {
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* 平台切换动画：横向平移 + 缩放 */
.platform-slide-enter-active,
.platform-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.platform-slide-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.98);
}

.platform-slide-leave-to {
  opacity: 0;
  transform: translateX(-50px) scale(1.02);
}

#app {
  max-width: 100%;
  margin: 0;
  padding: 0;
  text-align: left;
}
</style>
