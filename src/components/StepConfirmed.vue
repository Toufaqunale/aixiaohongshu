<script setup lang="ts">
import { CircleCheckFilled } from '@element-plus/icons-vue';

interface Props {
  theme?: 'light' | 'dark';
}

const props = defineProps<Props>();
const emit = defineEmits(['finish']);
</script>

<template>
  <div class="step-confirmed" :class="props.theme === 'dark' ? 'theme-dark' : 'theme-light'">
    <div class="success-content">
      <div class="icon-wrap">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
      </div>
      <h2 class="confirmed-title">投诉已正式受理</h2>
      <div class="confirmed-desc">
        <p>我们已收到你提交的权益侵犯投诉。</p>
        <p>平台法务团队将在3-5个工作日内审核你的材料，并通过你留下的联系方式与你取得联系，请保持通讯畅通。</p>
        <p>感谢你帮助我们一起维护社区环境。</p>
      </div>
    </div>

    <div class="footer-btn-wrap">
      <button class="finish-btn" @click="emit('finish')">完成</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.step-confirmed {
  padding: 40px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.success-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon-wrap {
  margin-bottom: 24px;
  
  .success-icon {
    font-size: 72px;
    color: #ff2442;
  }
}

.confirmed-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.confirmed-desc {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
  
  p {
    margin-bottom: 12px;
    &:last-child { margin-bottom: 0; }
  }
}

.footer-btn-wrap {
  width: 100%;
  padding: 20px 0;
}

.finish-btn {
  width: 100%;
  height: 48px;
  background: #ff2442;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

/* 黑暗模式适配 */
.theme-dark {
  .confirmed-title { color: #eee; }
  .confirmed-desc { color: #aaa; }
}
</style>
