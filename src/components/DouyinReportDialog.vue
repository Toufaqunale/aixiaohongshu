<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { 
  Close,
  ArrowLeft
} from '@element-plus/icons-vue';

interface Props {
  visible: boolean;
  targetId?: string | number;
  type?: 'post' | 'comment';
}

const props = defineProps<Props>();
const emit = defineEmits(['update:visible', 'submit']);

// 1. 状态管理
const currentStep = ref(1);
const selectedReason = ref('');
const description = ref('');
const sourceLink = ref('');
const fileList = ref<any[]>([]);
const maxDescriptionLength = 200;

const descriptionCount = computed(() => description.value.length);

// 判断是否需要显示源链接输入框
const isCopyrightInfringement = computed(() => {
  const copyrightReasons = ['盗用作品', '抄袭侵权', '侵权', '抄袭'];
  return copyrightReasons.includes(selectedReason.value);
});

// 动画高度管理
const step1Ref = ref<HTMLElement | null>(null);
const step2Ref = ref<HTMLElement | null>(null);
const step1Height = ref<number | string>('auto');
const step2Height = ref<number | string>(0);
const isTransitioning = ref(false);

const steps = [
  { title: '原因', icon: '1' },
  { title: '详情', icon: '2' }
];

const activeCategoryIndex = ref(0);
const hoveredSubOptionIndex = ref<number | null>(null);

const currentCategory = computed(() => reportCategories.value[activeCategoryIndex.value]);

const reportCategories = ref([
  { 
    title: '违法违规', 
    icon: 'warning-o', 
    subOptions: [ 
      { text: '政治敏感', desc: '包含不当 political 言论、损害国家形象等内容' }, 
      { text: '暴力行为', desc: '展示自残、斗殴、虐待动物等暴力画面' }, 
      { text: '危险行为', desc: '传播危险动作、或易引发模仿的极限挑战' }, 
      { text: '违法犯罪', desc: '涉及毒品、赌博、诈骗等违法信息' } 
    ] 
  }, 
  { 
    title: '侵权', 
    icon: 'warning-o',
    subOptions: [ 
      { text: '盗用作品', desc: '未经许可转载、搬运或重新发布他人原创视频' }, 
      { text: '冒充他人', desc: '假冒明星、名人、官方机构或其他用户' }, 
      { text: '侵犯肖像权', desc: '未经本人同意，拍摄、发布或商用其肖像' }, 
      { text: '侵犯名誉权', desc: '使用侮辱、诽谤等方式损害他人名誉' } 
    ] 
  }, 
  { 
    title: '低俗色情', 
    icon: 'closed-eye', 
    subOptions: [ 
      { text: '色情暴露', desc: '直接展示或暗示性行为、敏感部位' }, 
      { text: '低俗行为', desc: '以性暗示为目的的挑逗、低俗表演或言论' }, 
      { text: '不良交友', desc: '发布色情交友、约炮等违规信息' } 
    ] 
  }, 
  { 
    title: '虚假不实', 
    icon: 'close', 
    subOptions: [ 
      { text: '造谣传谣', desc: '散布未经证实、损害公共利益或他人的谣言' }, 
      { text: '虚假营销', desc: '发布虚假广告、夸大宣传、欺诈性销售' }, 
      { text: '内容不实', desc: '关键信息存在事实性错误或刻意误导' }, 
      { text: 'AI造假', desc: '使用人工智能技术生成并冒充真实事件' } 
    ] 
  } 
]);

// 2. 交互函数
const resetForm = () => {
  currentStep.value = 1;
  selectedReason.value = '';
  activeCategoryIndex.value = 0;
  hoveredSubOptionIndex.value = null;
  description.value = '';
  sourceLink.value = '';
  fileList.value = [];
  step1Height.value = 'auto';
  step2Height.value = 0;
  isTransitioning.value = false;
};

const handleClose = () => {
  emit('update:visible', false);
  // 延迟重置，等待退出动画结束
  setTimeout(() => {
    resetForm();
  }, 300);
};

const selectReason = (reason: string) => {
  selectedReason.value = reason;
};

const selectCategory = (index: number) => {
  activeCategoryIndex.value = index;
  // 切换分类时，如果已选择的原因不在新分类中，可以考虑清空或保留
  // 抖音通常是切换分类即重置子选项选择
  selectedReason.value = '';
};

const handleNext = async () => {
  if (selectedReason.value && !isTransitioning.value) {
    isTransitioning.value = true;
    
    // 1. 测量当前高度并锁定
    if (step1Ref.value) {
      step1Height.value = step1Ref.value.scrollHeight;
    }
    
    // 2. 切换步骤
    currentStep.value = 2;
    
    // 3. 在下个 tick 测量并展开第二步，同时收起第一步
    await nextTick();
    if (step2Ref.value) {
      const targetH = step2Ref.value.scrollHeight;
      step1Height.value = 0;
      step2Height.value = targetH;
    }
    
    setTimeout(() => {
      isTransitioning.value = false;
      // 动画结束后将第二步设为 auto 以适应动态内容
      step2Height.value = 'auto';
    }, 350);
  }
};

const goBack = async () => {
  if (currentStep.value === 2 && !isTransitioning.value) {
    isTransitioning.value = true;
    
    // 1. 测量当前高度并锁定
    if (step2Ref.value) {
      step2Height.value = step2Ref.value.scrollHeight;
    }
    
    // 2. 切换回第一步
    currentStep.value = 1;
    
    // 3. 在下个 tick 测量并展开第一步，同时收起第二步
    await nextTick();
    if (step1Ref.value) {
      const targetH = step1Ref.value.scrollHeight;
      step2Height.value = 0;
      step1Height.value = targetH;
    }
    
    setTimeout(() => {
      isTransitioning.value = false;
      step1Height.value = 'auto';
    }, 350);
  } else if (currentStep.value > 2) {
    currentStep.value--;
  }
};

const handleSubmit = () => {
  emit('submit', {
    reason: selectedReason.value,
    description: description.value,
    sourceLink: isCopyrightInfringement.value ? sourceLink.value : '',
    type: props.type,
    targetId: props.targetId
  });
  currentStep.value = 3;
};

// 监听 visible
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    // 关闭时重置状态
    setTimeout(() => {
      resetForm();
    }, 300);
  } else {
    // 再次打开时确保从第一步开始
    currentStep.value = 1;
  }
});
</script>

<template>
  <transition name="dy-fade">
    <div v-if="props.visible" class="dy-report-overlay" @click.self="handleClose">
      <div class="dy-report-dialog">
        <!-- 标题栏 -->
        <div class="dy-header">
          <div class="header-action" @click="goBack" v-if="currentStep === 2">
            <el-icon><ArrowLeft /></el-icon>
          </div>
          <div class="header-action" v-else></div>
          
          <h2 class="header-title">举报</h2>
          
          <div class="header-action" @click="handleClose">
            <el-icon><Close /></el-icon>
          </div>
        </div>

        <!-- 步骤条 -->
        <div class="dy-stepper" v-if="currentStep < 3">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ active: currentStep === index + 1 }"
          >
            <span class="step-num">{{ step.icon }}</span>
            <span class="step-text">{{ step.title }}</span>
          </div>
        </div>

        <!-- 内容区 -->
        <div class="dy-body">
          <!-- 步骤1 & 2 的垂直折叠容器 -->
          <div class="vertical-fold-container" v-if="currentStep < 3">
            <!-- 步骤1：选择原因 -->
            <div 
              class="step-fold-wrapper" 
              :style="{ 
                height: step1Height === 'auto' ? 'auto' : step1Height + 'px',
                opacity: currentStep === 1 ? 1 : 0,
                pointerEvents: currentStep === 1 ? 'auto' : 'none'
              }"
            >
              <div ref="step1Ref" class="step-content-inner">
                <div class="category-selection-container">
                  <!-- 左侧导航 -->
                  <div class="category-sidebar">
                    <div 
                      v-for="(cat, index) in reportCategories" 
                      :key="index"
                      class="category-tab"
                      :class="{ active: activeCategoryIndex === index }"
                      @click="selectCategory(index)"
                    >
                      <van-icon :name="cat.icon" class="cat-icon" />
                      <span class="cat-title">{{ cat.title }}</span>
                    </div>
                  </div>

                  <!-- 右侧细分类 -->
                  <div class="sub-options-area">
                    <div 
                      v-for="(sub, idx) in currentCategory?.subOptions" 
                      :key="idx"
                      class="option-item"
                      :class="{ selected: selectedReason === sub.text }"
                      :data-id="idx"
                      @click="selectReason(sub.text)"
                    >
                      <!-- 选项的主要可点击区域 -->
                      <div 
                        class="option-main" 
                        @mouseenter="hoveredSubOptionIndex = idx" 
                        @mouseleave="hoveredSubOptionIndex = null"
                      >
                        <span class="sub-text">{{ sub.text }}</span>
                        <div v-if="selectedReason === sub.text" class="select-dot"></div>
                      </div>
                      
                      <!-- 描述文本浮层 -->
                      <transition name="dy-fade">
                        <div class="description-layer" v-if="hoveredSubOptionIndex === idx">
                          <div class="description-content">
                            {{ sub.desc }}
                          </div>
                        </div>
                      </transition>
                    </div>
                  </div>
                </div>

                <div class="dy-footer-btns px-20 pb-20">
                  <button 
                    class="dy-btn-next" 
                    :disabled="!selectedReason"
                    @click="handleNext"
                  >
                    下一步
                  </button>
                </div>
              </div>
            </div>

            <!-- 步骤2：详情补充 -->
            <div 
              class="step-fold-wrapper" 
              :style="{ 
                height: step2Height === 'auto' ? 'auto' : step2Height + 'px',
                opacity: currentStep === 2 ? 1 : 0,
                pointerEvents: currentStep === 2 ? 'auto' : 'none'
              }"
            >
              <div ref="step2Ref" class="step-content-inner">
  <div class="detail-wrap">
    <!-- 源作品链接 (针对侵权类原因) -->
    <div v-if="isCopyrightInfringement" class="source-link-section">
      <div class="section-title">添加源作品链接（选填）</div>
      <div class="input-container">
        <input 
          v-model="sourceLink" 
          type="text" 
          placeholder="请粘贴原创作品的链接，帮助我们快速核实"
          class="dy-input"
        />
      </div>
    </div>

    <div class="section-title" :class="{ 'mt-20': isCopyrightInfringement }">补充说明（选填）</div>
    <div class="textarea-container">
                    <textarea 
                      v-model="description" 
                      placeholder="补充更多详情以帮助我们核实..."
                      class="dy-textarea"
                      :maxlength="maxDescriptionLength"
                    ></textarea>
                    <div class="char-counter">{{ descriptionCount }}/{{ maxDescriptionLength }}</div>
                  </div>

                  <div class="section-title mt-20">添加截图或视频证据（选填）</div>
                  <div class="upload-container">
                    <van-uploader 
                      v-model="fileList" 
                      multiple 
                      :max-count="4"
                      upload-icon="plus"
                    >
                      <template #preview-delete>
                        <div class="custom-delete">
                          <el-icon><Close /></el-icon>
                        </div>
                      </template>
                    </van-uploader>
                  </div>

                  <div class="dy-footer-btns mt-30">
                    <button class="dy-btn-submit-gradient" @click="handleSubmit">
                      提交举报
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤3：成功提示 (抖音风格弹窗) - 移至此处以覆盖整个弹窗 -->
        <transition name="dy-fade">
          <div v-if="currentStep === 3" class="dy-prompt-overlay">
            <div class="dy-prompt-card">
              <div class="prompt-content">
                <h3 class="prompt-title">举报提交成功</h3>
                <p class="prompt-desc">感谢你的反馈，我们将尽快核实处理。</p>
              </div>
              <div class="prompt-footer">
                <button class="prompt-btn-confirm" @click="handleClose">确定</button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.dy-report-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dy-report-dialog {
  width: 90vw;
  max-width: 400px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  animation: dialog-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes dialog-pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 标题栏 */
.dy-header {
  background: #000;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-title {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.header-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

/* 步骤条 */
.dy-stepper {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 16px 0;
  background: #1a1a1a;
  border-bottom: 1px solid #222;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.4;
  transition: all 0.3s;
  
  .step-num {
    width: 18px;
    height: 18px;
    background: #444;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
  }
  
  .step-text {
    font-size: 13px;
    color: #fff;
  }
  
  &.active {
    opacity: 1;
    .step-num {
      background: #69c9ff; /* 抖音浅蓝/品牌色 */
      box-shadow: 0 0 8px rgba(105, 201, 255, 0.5);
    }
    .step-text {
      color: #69c9ff;
    }
  }
}

/* 内容体 */
.dy-body {
  padding: 0;
  min-height: 200px;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
}

.vertical-fold-container {
  width: 100%;
  position: relative;
}

.step-fold-wrapper {
  width: 100%;
  overflow: hidden;
  transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;
  will-change: height, opacity;
}

.step-content-inner {
  width: 100%;
}

.step-pane {
  width: 100%;
}

/* 原因选择容器 */
.category-selection-container {
  display: flex;
  height: 450px; /* 更新高度以容纳更多内容 */
  min-height: 450px; /* 确保最小高度 */
  background: #1a1a1a;
  overflow: hidden; /* 创建独立布局上下文，防止溢出 */
  position: relative; /* 为内部元素提供定位锚点 */
  flex-shrink: 0; /* 防止在父容器中被压缩 */
}

/* 左侧导航栏 */
.category-sidebar {
  width: 120px; /* 固定宽度 */
  background: #121212;
  border-right: 0.5px solid #222;
  overflow-y: auto;
  max-height: 450px; /* 限制高度，允许内部滚动 */
  
  &::-webkit-scrollbar {
    width: 0;
  }

  .category-tab {
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0.5;
    position: relative;

    .cat-icon {
      font-size: 20px;
      color: #fff;
    }

    .cat-title {
      font-size: 12px;
      color: #fff;
      text-align: center;
    }

    &.active {
      opacity: 1;
      background: #1a1a1a;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 20%;
        height: 60%;
        width: 3px;
        background: #fe2c55;
        border-radius: 0 2px 2px 0;
        box-shadow: 0 0 8px rgba(254, 44, 85, 0.6);
      }

      .cat-title {
        color: #fe2c55;
        font-weight: 600;
      }
      
      .cat-icon {
        color: #fe2c55;
      }
    }
  }
}

/* 右侧细分类区域 */
.sub-options-area {
  flex: 1; /* 自适应剩余空间 */
  padding: 12px;
  padding-right: 8px; /* 为滚动条预留空间 */
  max-height: 380px; /* 限制最大高度 */
  overflow-y: auto; /* 允许垂直滚动 */
  overflow-x: visible; /* 关键：确保描述层在水平方向不被裁剪 */
  background: #1a1a1a;
  position: relative;

  .option-item {
    position: relative; /* 关键：为绝对定位的描述层提供锚点 */
    padding-bottom: 4px; /* 为描述层预留一点空间 */
    margin-bottom: 4px; /* 增加项与项之间的间隔 */
    min-height: 24px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.25s;

    .option-main {
      background: #222;
      border-radius: 8px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s;
      border: 1px solid transparent;

      .sub-text {
        color: #eee;
        font-size: 14px;
        font-weight: 500;
      }

      .select-dot {
        width: 8px;
        height: 8px;
        background: #fe2c55;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(254, 44, 85, 0.8);
      }
    }

    &:hover .option-main {
      background: #2a2a2a;
    }

    &.selected .option-main {
      background: #2a2a2a;
      border-color: rgba(254, 44, 85, 0.4);
      .sub-text {
        color: #fe2c55;
      }
    }
  }

  /* 描述浮层：精准定位在父项正下方 */
  .description-layer {
    position: absolute; /* 关键：脱离文档流 */
    top: 100%; /* 关键：定位到父项底部 */
    left: 0;
    width: 100%;
    z-index: 10;
    pointer-events: none;
    padding: 0 12px;
    box-sizing: border-box;
  }

  /* 描述内容框样式 */
  .description-content {
    pointer-events: auto; /* 允许框内文本可选 */
    background-color: #333; /* 深色背景 */
    color: #eee;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    line-height: 1.4;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 1px solid #444;
    max-width: 280px;
    word-wrap: break-word;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      bottom: 100%; /* 定位到内容框顶部 */
      left: 16px;
      border-width: 6px;
      border-style: solid;
      border-color: transparent transparent #333 transparent;
    }
  }
}

/* 动画效果 */
.dy-fade-enter-active, .dy-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dy-fade-enter-from, .dy-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.px-20 { padding-left: 20px; padding-right: 20px; }
.pb-20 { padding-bottom: 20px; }

.dy-btn-next {
  width: 100%;
  height: 48px;
  background: #fe2c55;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 12px;
  
  &:disabled {
    background: #444;
    color: #888;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

/* 详情补充 */
.detail-wrap {
  padding: 20px;
}

.section-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.mt-20 { margin-top: 20px; }
.mt-30 { margin-top: 30px; }

.textarea-container, .input-container {
  position: relative;
  background: #000;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.3s;

  &:focus-within {
    border-color: #69c9ff;
  }
}

.dy-input {
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  outline: none;
  padding: 0;
  
  &::placeholder {
    color: #666;
  }
}

.dy-textarea {
  width: 100%;
  height: 120px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  resize: none;
  outline: none;
  padding: 0;
  
  &::placeholder {
    color: #666;
  }
}

.char-counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  color: #666;
  font-size: 12px;
  font-family: monospace;
}

.upload-container {
  margin-top: 12px;

  :deep(.van-uploader__upload) {
    background: #222;
    border: 1px solid #333;
    border-radius: 8px;
    margin: 0 8px 8px 0;
    width: 80px;
    height: 80px;
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border: 1px solid rgba(105, 201, 255, 0.1);
      pointer-events: none;
    }

    .van-icon-plus {
      color: #ccc;
      font-size: 24px;
    }
  }

  :deep(.van-uploader__preview) {
    margin: 0 8px 8px 0;
    .van-uploader__preview-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      pointer-events: none;
    }
  }
}

.custom-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  z-index: 1;
}

.dy-btn-submit-gradient {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #69c9ff 0%, #ff0050 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 0, 80, 0.3);
  animation: breathe 3s infinite ease-in-out;
  transition: transform 0.2s, opacity 0.2s;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

@keyframes breathe {
  0%, 100% { 
    box-shadow: 0 4px 15px rgba(255, 0, 80, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 4px 25px rgba(105, 201, 255, 0.5);
    transform: scale(1.02);
  }
}

.dy-footer-btns {
  margin-top: 20px;
}

.dy-btn-submit {
  width: 100%;
  height: 48px;
  background: #ff0050; /* 抖音红 */
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:active {
    opacity: 0.8;
  }
}

/* 成功提示弹窗 (抖音风格) */
.dy-prompt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dy-prompt-card {
  width: 280px;
  background: rgba(40, 40, 40, 0.85);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: prompt-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes prompt-pop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.prompt-content {
  padding: 24px 20px;
  text-align: center;
  
  .prompt-title {
    color: #fff;
    font-size: 17px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  
  .prompt-desc {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }
}

.prompt-footer {
  border-top: 0.5px solid rgba(255, 255, 255, 0.1);
  
  .prompt-btn-confirm {
    width: 100%;
    height: 48px;
    background: transparent;
    border: none;
    color: #fe2c55; /* 抖音红 */
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    
    &:active {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

/* 动画 */
.dy-fade-enter-active, .dy-fade-leave-active {
  transition: opacity 0.3s;
}
.dy-fade-enter-from, .dy-fade-leave-to {
  opacity: 0;
}

.dy-slide-enter-active, .dy-slide-leave-active {
  transition: all 0.3s ease;
  will-change: transform, opacity;
}
.dy-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.dy-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
