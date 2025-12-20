<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft, ArrowRight, SuccessFilled } from '@element-plus/icons-vue';
import { showToast } from 'vant';

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:visible', 'close']);

const satisfactionEmojis = ['😠', '☹️', '😐', '😊', '😍'];
const selectedSatisfaction = ref(-1);

const isFollowed = ref(false);
const isDisliked = ref(false);

const handleBack = () => {
  emit('close');
};

const handleAction = (type: string) => {
  if (type === 'block') {
    isFollowed.value = !isFollowed.value;
    showToast(isFollowed.value ? '已拉黑作者' : '已取消拉黑');
  } else if (type === 'dislike') {
    isDisliked.value = !isDisliked.value;
    showToast(isDisliked.value ? '将减少此类内容推荐' : '已撤销');
  }
};

const selectSatisfaction = (index: number) => {
  selectedSatisfaction.value = index;
  showToast('感谢您的评价！');
};
</script>

<template>
  <transition name="slide-up">
    <div v-if="props.visible" class="report-success-page">
      <!-- 头部导航 -->
      <div class="report-header">
        <div class="header-left" @click="handleBack">
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
        </div>
        <div class="header-title">举报反馈</div>
        <div class="header-right"></div>
      </div>

      <div class="success-content-scroll">
        <!-- 1. 成功状态 -->
        <div class="status-section">
          <div class="success-icon-wrapper">
            <el-icon class="success-icon"><SuccessFilled /></el-icon>
          </div>
          <h2 class="status-title">举报提交成功，我们将尽快核实</h2>
          <p class="status-desc">处理结果我们将在第一时间通过消息通知你</p>
        </div>

        <!-- 2. 后续操作卡片 -->
        <div class="action-card card-style">
          <h3 class="card-title">同时你可以</h3>
          
          <!-- 拉黑作者 -->
          <div class="action-item">
            <div class="item-main">
              <div class="author-info">
                <img src="https://picsum.photos/100/100?random=1" alt="avatar" class="avatar" />
                <span class="name">阿木木</span>
              </div>
              <button 
                class="action-btn outline" 
                :class="{ 'is-active': isFollowed }"
                @click="handleAction('block')"
              >
                {{ isFollowed ? '已拉黑' : '拉黑作者' }}
              </button>
            </div>
            <p class="item-desc">拉黑后不再推荐该作者内容，且他无法再与你互动</p>
          </div>

          <div class="divider"></div>

          <!-- 减少推荐 -->
          <div class="action-item">
            <div class="item-main">
              <div class="post-info">
                <img src="https://picsum.photos/200/200?random=2" alt="cover" class="cover" />
              </div>
              <button 
                class="action-btn outline" 
                :class="{ 'is-active': isDisliked }"
                @click="handleAction('dislike')"
              >
                {{ isDisliked ? '已设置' : '减少推荐' }}
              </button>
            </div>
            <p class="item-desc">减少推荐后，平台将为您减少此类内容的推荐</p>
          </div>
        </div>

        <!-- 3. 满意度评价 -->
        <div class="satisfaction-card card-style">
          <h3 class="card-title center">你对本次举报的体验满意吗？</h3>
          <div class="emoji-group">
            <div 
              v-for="(emoji, index) in satisfactionEmojis" 
              :key="index"
              class="emoji-item"
              :class="{ 'is-active': selectedSatisfaction === index }"
              @click="selectSatisfaction(index)"
            >
              <span class="emoji">{{ emoji }}</span>
            </div>
          </div>
        </div>

        <!-- 4. 常见问题 -->
        <div class="faq-card card-style">
          <div class="faq-header">
            <span class="faq-title">常见问题</span>
            <div class="more">
              <span>更多</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          <div class="faq-list">
            <div class="faq-item">
              <span>什么是“已重点关注”？是举报失败吗？</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
            <div class="faq-item">
              <span>这条笔记侵犯了我的权益，希望平台删除</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
            <div class="faq-item">
              <span>我的财产受到损失，如何追回我的损失？</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.report-success-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f9f9f9;
  z-index: 3100;
  display: flex;
  flex-direction: column;
}

.report-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #fff;
  flex-shrink: 0;

  .header-left {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    cursor: pointer;
    .back-icon { font-size: 24px; color: #333; }
  }

  .header-title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }

  .header-right { width: 40px; }
}

.success-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 32px;
}

.status-section {
  padding: 40px 0 32px;
  text-align: center;

  .success-icon-wrapper {
    margin-bottom: 24px;
    .success-icon {
      font-size: 80px;
      color: #00b358; /* 小红书成功绿 */
    }
  }

  .status-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .status-desc {
    font-size: 14px;
    color: #999;
  }
}

.card-style {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  &.center { text-align: center; }
}

.action-item {
  .item-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .author-info {
    display: flex;
    align-items: center;
    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      margin-right: 12px;
    }
    .name {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }
  }

  .post-info {
    .cover {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
    }
  }

  .action-btn.outline {
    padding: 6px 16px;
    border: 1px solid #ff2442;
    background: transparent;
    color: #ff2442;
    border-radius: 18px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;

    &.is-active {
      background: #f5f5f5;
      border-color: #eee;
      color: #999;
    }
  }

  .item-desc {
    font-size: 13px;
    color: #999;
    line-height: 1.4;
  }
}

.divider {
  height: 0.5px;
  background: #f5f5f5;
  margin: 20px 0;
}

.emoji-group {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;

  .emoji-item {
    font-size: 32px;
    filter: grayscale(100%);
    opacity: 0.4;
    transition: all 0.2s;
    cursor: pointer;

    &.is-active {
      filter: grayscale(0);
      opacity: 1;
      transform: scale(1.2);
    }
  }
}

.faq-card {
  padding: 0;
  .faq-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 0.5px solid #f5f5f5;
    .faq-title { font-size: 16px; font-weight: 600; }
    .more {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: #ccc;
      i { margin-left: 2px; }
    }
  }

  .faq-list {
    .faq-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      font-size: 15px;
      color: #333;
      border-bottom: 0.5px solid #f5f5f5;
      &:last-child { border-bottom: none; }
      i { color: #ccc; font-size: 14px; }
    }
  }
}

/* 动画保持一致 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
