<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { 
  ArrowLeft, 
  ArrowRight, 
  CircleCheckFilled,
  WarningFilled
} from '@element-plus/icons-vue';
import StepIdentity from './StepIdentity.vue';
import StepEvidence from './StepEvidence.vue';
import StepConfirmed from './StepConfirmed.vue';

interface Props {
  visible: boolean;
  targetId?: string | number;
  type?: 'post' | 'comment';
}

const props = defineProps<Props & { theme?: 'light' | 'dark' }>();
const emit = defineEmits(['update:visible', 'submit']);

const themeClass = computed(() => props.theme === 'dark' ? 'theme-dark' : 'theme-light');

// 1. 状态管理
const currentStep = ref(1);
const activeTab = ref(0);
const selectedReason = ref('');
const description = ref('');
const identityType = ref(''); // 'personal' | 'organization'
const rightsStep = ref(1); // 权益流程子步骤
const fileList = ref<any[]>([]);

const wrapperHeight = ref('450px'); // 默认高度

const measureHeights = async () => {
  await nextTick();
  // 根据步骤设定不同的高度
  if (currentStep.value === 4) {
    wrapperHeight.value = '550px'; // 权益流程内容较多，设定更高
  } else {
    wrapperHeight.value = '460px';
  }
};

watch(currentStep, () => {
  measureHeights();
});

onMounted(() => {
  measureHeights();
});

const reportCategories = [
  {
    title: '违法违规',
    desc: '包含政治敏感、违禁品交易、诈骗欺诈等严重违法行为',
    reasons: [
      { label: '政治敏感', value: 'politics' },
      { label: '违禁品交易', value: 'illegal_goods' },
      { label: '欺诈诈骗', value: 'fraud' },
      { label: '赌博', value: 'gambling' },
      { label: '暴力恐怖', value: 'violence' }
    ]
  },
  {
    title: '侵权',
    desc: '举报未经授权搬运、抄袭或冒用他人身份及知识产权行为',
    reasons: [
      { label: '著作权侵权', value: 'copyright' },
      { label: '名誉权侵权', value: 'reputation' },
      { label: '冒充他人', value: 'impersonation' },
      { label: '个人信息被泄露', value: 'privacy' }
    ]
  },
  {
    title: '虚假不实',
    desc: '如发现使用AI工具生成并冒充真实的虚假内容或散布谣言',
    reasons: [
      { label: 'AI造假/合成', value: 'ai_fake' },
      { label: '内容不实', value: 'untrue' },
      { label: '散布谣言', value: 'rumor' },
      { label: '标题党/夸大其词', value: 'clickbait' }
    ]
  },
  {
    title: '低俗色情',
    desc: '包含淫秽色情、暗示性低俗内容及相关招嫖信息',
    reasons: [
      { label: '淫秽色情', value: 'porn' },
      { label: '低俗内容', value: 'vulgar' },
      { label: '招嫖信息', value: 'prostitution' }
    ]
  },
  {
    title: '垃圾广告',
    desc: '频繁发布无意义推广、微商引流或骚扰营销信息',
    reasons: [
      { label: '微商/引流', value: 'marketing' },
      { label: '频繁骚扰', value: 'harassment' },
      { label: '刷量刷粉', value: 'spam' }
    ]
  },
  {
    title: '其他问题',
    desc: '不属于以上分类的其他违规或体验不佳问题',
    reasons: [
      { label: '引战谩骂', value: 'abuse' },
      { label: '泄露隐私', value: 'privacy_leak' },
      { label: '不实评论', value: 'fake_comment' },
      { label: '其他', value: 'others' }
    ]
  }
];

// 2. 计算属性
const isSubmitDisabled = computed(() => {
  return !selectedReason.value;
});

// 3. 交互函数
const handleClose = () => {
  emit('update:visible', false);
  // 重置状态
  setTimeout(() => {
    currentStep.value = 1;
    selectedReason.value = '';
    description.value = '';
    identityType.value = '';
    rightsStep.value = 1;
    fileList.value = [];
  }, 300);
};

const selectReason = (reason: string) => {
  selectedReason.value = reason;
  if (reason === '侵犯我/我的组织权益') {
    currentStep.value = 4; // 专门的权益侵犯流程步骤
    rightsStep.value = 1; // 重置权益流程到第一步
  } else {
    currentStep.value = 2;
  }
};

const goBack = () => {
  if (currentStep.value === 4) {
    if (rightsStep.value > 1) {
      rightsStep.value--;
    } else {
      currentStep.value = 1;
      selectedReason.value = '';
    }
  } else if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const handleSubmit = (rightsData?: any) => {
  if (currentStep.value === 2 || currentStep.value === 4) {
    // 模拟提交
    emit('submit', {
      reason: selectedReason.value,
      description: description.value,
      images: fileList.value.map(f => f.url || f.content),
      isRightsViolation: currentStep.value === 4,
      rightsData: rightsData || null, // 传入专项投诉的数据
      type: props.type,
      targetId: props.targetId
    });
    
    if (currentStep.value === 4) {
      rightsStep.value = 3; // 专项流程进入成功页
    } else {
      currentStep.value = 3; // 通用流程进入成功页
    }
  } else if (currentStep.value === 3) {
    handleClose();
  }
};

// 监听 visible 变化，重置步骤
watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentStep.value = 1;
  }
});
</script>

<template>
  <van-action-sheet 
    :show="props.visible" 
    @update:show="(val) => emit('update:visible', val)"
    class="report-action-sheet"
    @click-overlay="handleClose"
  >
    <div class="report-container" :class="themeClass">
      <!-- 顶部标题栏 -->
      <div class="report-header">
        <div class="header-left">
  <el-icon v-if="currentStep === 2 || currentStep === 4" @click="goBack" class="back-icon"><ArrowLeft /></el-icon>
</div>
        <div class="header-title">{{ currentStep === 3 ? '举报' : (currentStep === 4 ? '权益保护' : (currentStep === 2 ? '补充说明' : '举报')) }}</div>
        <div class="header-right">
          <span v-if="currentStep < 3" class="close-btn" @click="handleClose">取消</span>
        </div>
      </div>

      <div class="step-wrapper" :style="{ minHeight: wrapperHeight }">
        <transition name="slide" mode="out-in">
          <!-- 第一步：选择原因 -->
          <div v-if="currentStep === 1" class="step-content" key="step1">
            <!-- 醒目选项：权益侵犯 -->
            <div class="special-option-wrap">
              <div class="special-option" @click="selectReason('侵犯我/我的组织权益')">
                <div class="option-main">
                  <el-icon class="special-icon"><WarningFilled /></el-icon>
                  <span class="option-text">侵犯我/我的组织权益</span>
                </div>
                <el-icon class="arrow-icon"><ArrowRight /></el-icon>
              </div>
              <div class="divider"></div>
            </div>

            <van-tabs v-model:active="activeTab" class="report-tabs" swipeable animated :color="props.theme === 'dark' ? '#fe2c55' : '#ff2442'" :title-active-color="props.theme === 'dark' ? '#fff' : '#333'" :title-inactive-color="props.theme === 'dark' ? '#888' : '#999'">
              <van-tab v-for="(category, index) in reportCategories" :key="index" :title="category.title">
                <div class="category-panel">
                  <div class="category-desc">{{ category.desc }}</div>
                  <div class="reason-list">
                    <div 
                      v-for="item in category.reasons" 
                      :key="item.value" 
                      class="reason-item"
                      @click="selectReason(item.label)"
                    >
                      <div class="reason-left">
                        <span class="reason-label">{{ item.label }}</span>
                      </div>
                      <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                    </div>
                  </div>
                </div>
              </van-tab>
            </van-tabs>
          </div>

          <!-- 第二步：补充详情 -->
          <div v-else-if="currentStep === 2" class="step-content" key="step2">
            <div class="detail-form">
              <div class="input-section">
                <textarea 
                  v-model="description" 
                  maxlength="300"
                  placeholder="请详细描述您的问题，帮助我们更好处理..."
                  class="report-textarea"
                ></textarea>
                <div class="word-count">{{ description.length }}/300</div>
              </div>

              <div class="upload-section">
                <div class="upload-title">添加截图（选填，最多3张）</div>
                <van-uploader 
                  v-model="fileList" 
                  multiple 
                  :max-count="3" 
                  class="report-uploader"
                  upload-icon="plus"
                />
              </div>

              <div class="footer-btn-wrap">
                <button 
                  class="submit-btn" 
                  :disabled="isSubmitDisabled"
                  @click="handleSubmit"
                >
                  提交
                </button>
              </div>
            </div>
          </div>

          <!-- 第三步：提交成功 -->
          <div v-else-if="currentStep === 3" class="step-content" key="step3">
            <div class="success-content">
              <div class="success-icon-wrap">
                <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
              </div>
              <h2 class="success-title">举报已提交</h2>
              <p class="success-desc">感谢您的反馈，我们会尽快核实处理。</p>
              <button class="finish-btn" @click="handleClose">返回</button>
            </div>
          </div>
          <!-- 步骤4：权益侵犯专属流程 -->
          <div v-else-if="currentStep === 4" class="step-content rights-flow" key="step4">
            <!-- 权益流程子步骤 1: 身份选择 -->
            <StepIdentity 
              v-if="rightsStep === 1" 
              v-model="identityType" 
              :theme="props.theme"
              @next="rightsStep = 2"
            />

            <!-- 权益流程子步骤 2: 证明材料 -->
            <StepEvidence 
              v-else-if="rightsStep === 2"
              :identity-type="identityType"
              :theme="props.theme"
              @submit="handleSubmit"
              @back="rightsStep = 1"
            />

            <!-- 权益流程子步骤 3: 提交成功 -->
            <StepConfirmed 
              v-else-if="rightsStep === 3"
              :theme="props.theme"
              @finish="handleClose"
            />
          </div>
        </transition>
      </div>
    </div>
  </van-action-sheet>
</template>

<style scoped lang="scss">
/* 主题适配样式 */
.theme-dark {
  background: #161823;
  color: #fff;
}

/* 权益投诉专项流程样式 */
.special-option-wrap {
  padding: 4px 0 12px;
  width: 100%;
  
  .special-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px; /* 方案A：增加左右内边距 */
    background: #fff;
    cursor: pointer;
    transition: background 0.2s;
    width: 100%; /* 确保独占一行 */
    box-sizing: border-box;
    
    &:active {
      background: #f9f9f9;
    }
    
    .option-main {
      display: inline-flex; /* 方案C：使用 inline-flex */
      align-items: center; /* 方案C：垂直居中对齐 */
      gap: 14px; /* 增加图标和文字间的间距 */
      flex: 1;
      
      .special-icon {
        font-size: 24px; /* 略微放大图标增加识别度 */
        color: #ff2442;
        display: flex;
        align-items: center;
      }
      
      .option-text {
        font-size: 16px; /* 略微放大文字 */
        font-weight: 600;
        color: #333;
        letter-spacing: 0.3px;
      }
    }
    
    .arrow-icon {
      font-size: 18px;
      color: #ccc;
      margin-left: 8px;
    }
  }
  
  .divider {
    height: 10px; /* 增加分割线厚度，使层级更清晰 */
    background: #f7f7f7;
    margin-top: 4px;
  }
}

.rights-flow {
  padding: 20px 16px;
  
  .rights-notice {
    background: #fff5f6;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
    
    .notice-title {
      font-size: 15px;
      font-weight: 600;
      color: #ff2442;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }
    
    ul {
      margin: 0;
      padding-left: 18px;
      
      li {
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
        list-style-type: disc;
      }
    }
  }
  
  .rights-form {
    .form-item {
      margin-bottom: 20px;
      
      label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }
      
      input, textarea {
        width: 100%;
        background: #f9f9f9;
        border: 0.5px solid #eee;
        border-radius: 8px;
        padding: 12px;
        font-size: 14px;
        outline: none;
        
        &:focus {
          border-color: #ff2442;
          background: #fff;
        }
      }
      
      textarea {
        height: 120px;
        resize: none;
      }
    }
  }
  
  .rights-footer {
    margin-top: 32px;
    padding-bottom: 20px;
    
    .submit-btn.special {
      width: 100%;
      height: 48px;
      background: #ff2442;
      color: #fff;
      border: none;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);
      
      &:active {
        opacity: 0.9;
        transform: scale(0.98);
      }
    }
  }
}

/* 黑暗模式适配 */
.theme-dark {
  .special-option-wrap {
    .special-option {
      background: #1a1a1a;
      &:active { background: #222; }
      .option-text { color: #eee; }
    }
    .divider { background: #000; }
  }

  .rights-flow {
    .rights-notice {
      background: rgba(255, 36, 66, 0.1);
      .notice-title { color: #ff4d6a; }
      p, li { color: #aaa; }
    }
    
    .rights-form {
      .form-item {
        label { color: #eee; }
        input, textarea {
          background: #222;
          border-color: #333;
          color: #fff;
          &:focus { border-color: #ff4d6a; background: #2a2a2a; }
        }
      }
    }
  }

  .report-header {
    border-bottom-color: #333;
    .header-title { color: #fff; }
    .back-icon { color: #fff; }
    .close-btn { color: #ccc; }
  }

  .step-wrapper {
    background: #161823;
  }

  .step-content {
    background: #161823;
  }

  :deep(.van-tabs__wrap) {
    border-bottom-color: #333;
    background: #161823;
  }

  :deep(.van-tab) {
    background: #161823;
  }

  .category-desc {
    background: #2b2e3d;
    color: #aaa;
  }

  .reason-item {
    background: #161823;
    border-bottom-color: #333;
    .reason-label { color: #eee; }
    .arrow-icon { color: #666; }
    &:active { background-color: #2b2e3d; }
  }

  .input-section {
    background: #2b2e3d;
    .report-textarea { color: #fff; }
  }

  .upload-title { color: #eee; }
  :deep(.van-uploader__upload) {
    background-color: #2b2e3d;
  }

  .submit-btn {
    background: #fe2c55;
    &:disabled { background: #5c1a29; color: #888; }
  }

  .success-icon-wrap { background: #1a3a2a; }
  .success-icon { color: #2ecc71; }
  .success-title { color: #fff; }
  .finish-btn {
    background: #2b2e3d;
    color: #fff;
    border-color: #444;
  }
}

.report-action-sheet {
  max-height: 90vh;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  /* 确保弹窗在键盘弹出时不会被完全遮挡 */
  display: flex;
  flex-direction: column;
}

.report-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.report-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 0.5px solid #f0f0f0;
  flex-shrink: 0;
}

.header-left, .header-right {
  width: 60px;
}

.back-icon {
  font-size: 20px;
  color: #333;
  cursor: pointer;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.step-wrapper {
  position: relative;
  overflow-y: visible; /* 允许垂直内容溢出，由内部容器控制滚动 */
  overflow-x: hidden;
  background: #fff;
  transition: height 0.3s ease;
  will-change: height, transform;
}

.step-content {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  will-change: transform, opacity;
  background: #fff;
}

/* 动画效果：使用平滑的位移而非抖动的显示隐藏 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  top: 0;
  left: 0;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 第一步：原因列表 */
.report-tabs {
  :deep(.van-tabs__wrap) {
    height: 44px;
    border-bottom: 0.5px solid #f0f0f0;
  }
  
  :deep(.van-tab) {
    font-size: 14px;
    font-weight: 500;
    padding: 0 12px;
  }
  
  :deep(.van-tabs__line) {
    bottom: 20px;
    width: 20px !important;
  }
}

.category-panel {
  padding: 0;
}

.category-desc {
  padding: 12px 16px;
  background: #f9f9f9;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.reason-list {
  padding: 0;
}

.reason-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fff;
  border-bottom: 0.5px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:active {
    background-color: #fafafa;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.reason-left {
  display: flex;
  align-items: center;
}

.reason-label {
  font-size: 15px;
  color: #333;
}

.arrow-icon {
  font-size: 16px;
  color: #ccc;
}

/* 第二步：详情表单 */
.detail-form {
  padding: 16px;
  max-height: calc(85vh - 120px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.input-section {
  position: relative;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.report-textarea {
  width: 100%;
  height: 120px;
  border: none;
  background: transparent;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  outline: none;

  &::placeholder {
    color: #999;
  }
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.upload-section {
  margin-bottom: 32px;
}

.upload-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.report-uploader {
  :deep(.van-uploader__upload) {
    background-color: #f7f7f7;
    border-radius: 8px;
    margin: 0;
  }
  
  :deep(.van-uploader__preview-image) {
    border-radius: 8px;
  }
}

.footer-btn-wrap {
  padding: 16px 0;
}

.submit-btn {
  width: 100%;
  height: 44px;
  background: #ff2442;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 600;
  transition: opacity 0.3s;

  &:disabled {
    background: #ffb5be;
    cursor: not-allowed;
  }

  &:active {
    opacity: 0.8;
  }
}

/* 第三步：成功状态 */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 24px;
}

.success-icon-wrap {
  width: 64px;
  height: 64px;
  background: #f2fff9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.success-icon {
  font-size: 40px;
  color: #07c160;
}

.success-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.success-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 40px;
  text-align: center;
}

.finish-btn {
  width: 100%;
  height: 44px;
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 600;
}

/* 动画效果 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
  position: absolute;
  top: 0;
  left: 0;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
