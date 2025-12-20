<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeft, ArrowRight, Check, Plus, CircleCloseFilled } from '@element-plus/icons-vue';
import RedBookReportSuccess from './RedBookReportSuccess.vue';

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:visible', 'select']);

const selectedValue = ref('');
const selectedSubReason = ref('');
const reportDesc = ref('');
const sourceValue = ref('原创内容');
const imageList = ref<string[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);
const showSourceSelect = ref(false);
const showSuccessPage = ref(false);

const triggerUpload = () => {
  if (imageList.value.length >= 9) return;
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const url = e.target?.result as string;
    imageList.value.push(url);
    input.value = '';
  };
  reader.readAsDataURL(file);
};

const removeImage = (index: number) => {
  imageList.value.splice(index, 1);
};

const sourceOptions = [
  { text: '原创作品为小红书笔记', value: 'internal' },
  { text: '原创作品为站外笔记', value: 'external' }
];



const onSourceConfirm = ({ selectedOptions }: any) => {
  sourceValue.value = selectedOptions[0].text;
  showSourceSelect.value = false;
};

const subReasons = [
  '色情低俗', '政治敏感', '涉嫌诈骗', '违法违规',
  '违反公德秩序', '危害人身安全', '未成年不当行为', '违规营销、假货',
  '导流到站外', '谩骂嘲讽、煽动对立', '饭圈乱象', '虚假不实',
  'AI 造假', '标题党', '引人不住', '诱导关注、点赞',
  '搬运抄袭他人作品', '不属于以上类型'
];

const reportReasons = [
  {
    title: '对他人造成困扰或危害',
    desc: '含有违法违规、色情低俗、涉嫌诈骗、违规营销及其他可能导致他人困扰或危害的内容',
    value: 'harassment'
  },
  {
    title: '侵犯我/我的组织的权益',
    desc: '含有中伤名誉、泄露肖像及隐私、抄袭搬运、假冒商标或专利、冒充身份等对我造成侵权的内容',
    value: 'rights_violation'
  }
];

const handleBack = () => {
  if (selectedValue.value === 'harassment') {
    selectedValue.value = '';
    selectedSubReason.value = '';
    return;
  }
  emit('update:visible', false);
};

const handleSelect = (reason: any) => {
  selectedValue.value = reason.value;
};

const toggleSubReason = (tag: string) => {
  selectedSubReason.value = tag;
};

const isFormValid = computed(() => {
  if (selectedValue.value === 'harassment') {
    return selectedSubReason.value !== '';
  }
  return selectedValue.value !== '';
});

const handleSubmit = () => {
  if (!isFormValid.value) return;
  
  if (selectedValue.value === 'rights_violation') {
    // 如果是权益侵犯，点击“下一步”触发原有逻辑（跳转到权益保护流程）
    const reason = reportReasons.find(r => r.value === selectedValue.value);
    emit('select', reason);
    return;
  }
  
  // 其他情况（对他人造成困扰等）进入提交成功反馈页
  showSuccessPage.value = true;
};

const handleFinalClose = () => {
  showSuccessPage.value = false;
  emit('update:visible', false);
};
</script>

<template>
  <transition name="slide-up">
    <div v-if="props.visible" class="redbook-report-page">
      <!-- 头部导航 -->
      <div class="report-header">
        <div class="header-left" @click="handleBack">
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
        </div>
        <div class="header-right"></div>
      </div>

      <div class="report-content-scroll">
        <div class="report-body">
          <h1 class="main-title">选择笔记举报原因</h1>

          <!-- 1. 顶部主分类卡片 -->
          <div class="reason-card">
            <div 
              v-for="(reason, index) in reportReasons" 
              :key="reason.value" 
              class="reason-item"
              :class="{ 'has-divider': index < reportReasons.length - 1 }"
              @click="handleSelect(reason)"
            >
              <div class="reason-content">
                <div class="reason-title">{{ reason.title }}</div>
                <div class="reason-desc">{{ reason.desc }}</div>
              </div>
              <div class="radio-box" :class="{ 'is-active': selectedValue === reason.value }">
                <el-icon v-if="selectedValue === reason.value" class="check-icon"><Check /></el-icon>
              </div>
            </div>
          </div>

          <!-- 2. 二级详情表单 (仅在选中 "harassment" 时显示) -->
          <template v-if="selectedValue === 'harassment'">
            <!-- 补充举报原因 -->
            <div class="sub-section card-style">
              <div class="section-title">补充举报原因 <span class="required">*</span></div>
              <div class="tag-container">
                <div 
                  v-for="tag in subReasons" 
                  :key="tag"
                  class="tag-item"
                  :class="{ 
                    'is-active': selectedSubReason === tag,
                    'is-long': tag.length > 6
                  }"
                  @click="toggleSubReason(tag)"
                >
                  {{ tag }}
                </div>
              </div>
            </div>

            <!-- 笔记来源 (仅在选中“搬运抄袭他人作品”时显示) -->
            <div 
              v-if="selectedSubReason === '搬运抄袭他人作品'"
              class="sub-section card-style flex-row" 
              @click="showSourceSelect = true"
            >
              <div class="section-title">笔记来源</div>
              <div class="flex-right">
                <span :class="{ 'placeholder': !sourceValue, 'selected-text': sourceValue }">
                  {{ sourceValue || '请选择笔记来源' }}
                </span>
                <el-icon class="arrow-icon"><ArrowRight /></el-icon>
              </div>
            </div>

            <!-- 举报描述 -->
            <div class="sub-section card-style">
              <div class="section-title">举报描述</div>
              <div class="textarea-wrapper">
                <textarea 
                  v-model="reportDesc"
                  placeholder="请详细填写，以提高举报通过率"
                  maxlength="400"
                ></textarea>
                <div class="word-count">{{ reportDesc.length }}/400</div>
              </div>
            </div>

            <!-- 图片上传 -->
            <div class="sub-section card-style upload-section">
              <div class="section-title">上传证据 <span class="limit-tip">最多上传9张</span></div>
              <div class="upload-container image-list">
                <div 
                  v-for="(img, index) in imageList" 
                  :key="index" 
                  class="image-item"
                >
                  <img :src="img" />
                  <el-icon class="delete-icon" @click="removeImage(index)"><CircleCloseFilled /></el-icon>
                </div>
                <div 
                  v-if="imageList.length < 9" 
                  class="upload-btn" 
                  @click="triggerUpload"
                >
                  <el-icon class="plus-icon"><Plus /></el-icon>
                  <span class="count">{{ imageList.length }}/9</span>
                </div>
              </div>
              <input 
                type="file" 
                ref="fileInputRef" 
                style="display: none" 
                accept="image/*"
                @change="handleFileChange"
              />
            </div>
          </template>
        </div>
      </div>

      <!-- 底部提交按钮 -->
      <div class="footer-action">
        <div class="rights-tip" v-if="selectedValue === 'rights_violation'">
          了解更多侵权投诉信息，请阅读<span class="link">《侵权投诉须知》</span>
        </div>
        <button 
          class="submit-btn" 
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          {{ selectedValue === 'rights_violation' ? '下一步' : '提交' }}
        </button>
      </div>

      <!-- 笔记来源选择器 -->
      <van-popup v-model:show="showSourceSelect" position="bottom" round>
        <van-picker
          title="笔记来源"
          :columns="sourceOptions"
          @confirm="onSourceConfirm"
          @cancel="showSourceSelect = false"
          confirm-button-text="确定"
          cancel-button-text="取消"
        />
      </van-popup>

      <!-- 举报提交成功反馈页 -->
      <RedBookReportSuccess 
        :visible="showSuccessPage"
        @close="handleFinalClose"
      />
    </div>
  </transition>
</template>

<style scoped lang="scss">
.redbook-report-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f9f9f9;
  z-index: 3000;
  display: flex;
  flex-direction: column;
}

.report-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: transparent;
  flex-shrink: 0;

  .header-left {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    cursor: pointer;
    
    .back-icon {
      font-size: 24px;
      color: #333;
    }
  }
}

.report-content-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.report-body {
  padding: 0 16px 32px;
}

.main-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 12px 0 24px;
}

.reason-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
}

.reason-item {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  cursor: pointer;
  position: relative;

  &.has-divider::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 0.5px;
    background: #f5f5f5;
  }

  .reason-content {
    flex: 1;
    margin-right: 12px;

    .reason-title {
      font-size: 16px;
      color: #333;
      margin-bottom: 6px;
      font-weight: 500;
    }

    .reason-desc {
      font-size: 13px;
      color: #999;
      line-height: 1.4;
    }
  }

  .radio-box {
    width: 22px;
    height: 22px;
    border: 1.5px solid #ccc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;

    &.is-active {
      border-color: #ff2442;
      background: #ff2442;
    }

    .check-icon {
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }
}

.card-style {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.sub-section {
  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    display: flex;
    align-items: center;

    .required {
      color: #ff2442;
      margin-left: 4px;
    }

    .limit-tip {
      font-weight: normal;
      font-size: 12px;
      color: #999;
      margin-left: auto;
    }
  }

  &.flex-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px;
    
    .section-title {
      margin-bottom: 0;
    }

    .flex-right {
      display: flex;
      align-items: center;
      color: #ccc;

      .placeholder {
        font-size: 14px;
        margin-right: 4px;
      }

      .arrow-icon {
        font-size: 16px;
      }
    }
  }
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .tag-item {
    height: 44px;
    padding: 0 14px;
    background: #f5f5f5;
    border-radius: 8px;
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    white-space: nowrap; /* 强制不换行 */
    flex: 0 0 auto;      /* 不自动扩充，根据内容自适应 */
    text-align: center;
    box-sizing: border-box;

    &.is-active {
      background: #fff0f0 !important;
      color: #ff2442 !important;
      font-weight: 600;
    }

    &:active {
      opacity: 0.8;
    }
  }
}

.sub-section {
  &.flex-row {
    .flex-right {
      .selected-text {
        font-size: 14px;
        color: #333;
        margin-right: 4px;
      }
    }
  }
}

:deep(.van-picker__toolbar) {
  height: 50px;
}

:deep(.van-picker__cancel) {
  color: #666;
  font-size: 16px;
}

:deep(.van-picker__confirm) {
  color: #ff2442;
  font-size: 16px;
}

:deep(.van-picker__title) {
  font-weight: 600;
  color: #333;
}

.textarea-wrapper {
  position: relative;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 12px;

  textarea {
    width: 100%;
    height: 100px;
    background: transparent;
    border: none;
    outline: none;
    font-size: 14px;
    color: #333;
    resize: none;

    &::placeholder {
      color: #ccc;
    }
  }

  .word-count {
    text-align: right;
    font-size: 12px;
    color: #ccc;
    margin-top: 4px;
  }
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .image-item {
    width: 80px;
    height: 80px;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
    }

    .delete-icon {
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 20px;
      color: rgba(0, 0, 0, 0.4);
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1;
    }
  }

  .upload-btn {
    width: 80px;
    height: 80px;
    background: #f8f8f8;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    .plus-icon {
      font-size: 24px;
      color: #999;
      margin-bottom: 4px;
    }

    .count {
      font-size: 11px;
      color: #ccc;
    }
  }
}

.footer-action {
  padding: 12px 16px 34px;
  background: #fff;
  border-top: 0.5px solid #f5f5f5;

  .rights-tip {
    font-size: 13px;
    color: #999;
    text-align: center;
    margin-bottom: 20px;
    line-height: 1.6;

    .link {
      color: #5077aa; /* 小红书链接蓝 */
      cursor: pointer;
    }
  }

  .submit-btn {
    width: 100%;
    height: 44px;
    background: #e0e0e0;
    color: #fff;
    border: none;
    border-radius: 22px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s;

    &:not(:disabled) {
      background: #ff2442;
    }
  }
}

/* 动画保持不变 */
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
