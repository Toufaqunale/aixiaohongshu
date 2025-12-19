<script setup lang="ts">
import { computed } from 'vue';

type Platform = 'redbook' | 'douyin';

const props = defineProps<{
  modelValue: Platform
}>();

const emit = defineEmits(['update:modelValue']);

const platforms = [
  { id: 'redbook', name: '小红书', icon: '📕', color: '#ff2442' },
  { id: 'douyin', name: '抖音', icon: '🎵', color: '#fe2c55' }
];

const selectPlatform = (id: Platform) => {
  emit('update:modelValue', id);
};

const activeIndex = computed(() => {
  return platforms.findIndex(p => p.id === props.modelValue);
});
</script>

<template>
  <div class="platform-switcher-wrap">
    <div class="switcher-container">
      <div 
        v-for="p in platforms" 
        :key="p.id"
        class="platform-item"
        :class="[p.id, { active: modelValue === p.id }]"
        @click="selectPlatform(p.id as Platform)"
      >
        <span class="platform-icon">{{ p.icon }}</span>
        <span class="platform-name">{{ p.name }}</span>
      </div>
      <!-- 滑块指示器 -->
      <div 
        class="indicator" 
        :style="{ transform: `translateX(${activeIndex * 100}%)` }"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.platform-switcher-wrap {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  padding: 4px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 0.5px solid rgba(255, 255, 255, 0.3);
  width: auto;
  max-width: 90vw;
}

.switcher-container {
  display: flex;
  position: relative;
  width: 180px;
  height: 32px;
}

@media screen and (max-width: 375px) {
  .switcher-container {
    width: 150px;
    height: 28px;
  }
  .platform-name {
    display: none;
  }
  .platform-icon {
    font-size: 16px !important;
  }
}

.platform-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s;
  
  .platform-icon {
    font-size: 14px;
    opacity: 0.7;
    transition: all 0.3s;
  }
  
  .platform-name {
    font-size: 13px;
    font-weight: 500;
    color: #666;
    transition: all 0.3s;
  }
  
  &.active {
    .platform-icon {
      opacity: 1;
      transform: scale(1.1);
    }
    
    .platform-name {
      color: #333;
      font-weight: 600;
    }
    
    &.redbook .platform-name {
      color: #ff2442;
    }
    
    &.douyin .platform-name {
      color: #fe2c55;
      text-shadow: 1px 1px 0 rgba(37, 244, 238, 0.5), -1px -1px 0 rgba(254, 44, 85, 0.5);
    }
  }
}

.indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 平台专属激活样式 */
.platform-item:nth-child(1).active ~ .indicator {
  /* 小红书风格不需要额外颜色，保持白色背景 */
}

/* 模拟抖音风格的微调，可以在此处添加更多细节 */
</style>
