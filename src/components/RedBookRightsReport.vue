<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeft, ArrowRight, Camera, SuccessFilled, Check, Plus, CircleCloseFilled } from '@element-plus/icons-vue';
import { showToast } from 'vant';
import RedBookReportSuccess from './RedBookReportSuccess.vue';

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:visible', 'close']);

const currentStep = ref(1);
const showSuccessPage = ref(false);

// 图片上传逻辑
const originalInputRef = ref<HTMLInputElement | null>(null);
const proofInputRef = ref<HTMLInputElement | null>(null);
const originalImages = ref<string[]>([]);
const proofImages = ref<string[]>([]);

const triggerUpload = (type: 'original' | 'proof') => {
  if (type === 'original') {
    if (originalImages.value.length >= 1) return;
    originalInputRef.value?.click();
  } else {
    if (proofImages.value.length >= 4) return;
    proofInputRef.value?.click();
  }
};

const handleFileChange = (event: Event, type: 'original' | 'proof') => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const url = e.target?.result as string;
    if (type === 'original') {
      originalImages.value.push(url);
    } else {
      proofImages.value.push(url);
    }
    // 清空 input 方便下次选择
    input.value = '';
  };
  reader.readAsDataURL(file);
};

const removeImage = (index: number, type: 'original' | 'proof') => {
  if (type === 'original') {
    originalImages.value.splice(index, 1);
  } else {
    proofImages.value.splice(index, 1);
  }
};

// 步骤 1 数据
const selectedType = ref('搬运、抄袭、洗稿');
const rightsCategories = [
  {
    title: '知识产权',
    types: ['搬运、抄袭、洗稿', '商标侵权', '专利侵权']
  },
  {
    title: '人身权益',
    types: ['名誉中伤', '肖像及隐私泄露', '假冒个人身份']
  },
  {
    title: '其它企业权益',
    types: ['商誉诋毁', '假冒企业身份', '侵犯商业秘密']
  }
];

// 步骤 2 数据
const identity = ref('owner'); // owner or agent

// 步骤 3 数据
const details = ref('');
const agreeForward = ref(false);
const keepInfo = ref(true);

// 步骤 4 数据
const signature = ref('');
const agreePromise = ref(false);

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    emit('update:visible', false);
  }
};

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++;
  } else {
    handleSubmit();
  }
};

const handleSubmit = () => {
  showSuccessPage.value = true;
};

const handleFinalClose = () => {
  showSuccessPage.value = false;
  emit('update:visible', false);
};

const stepTitle = computed(() => {
  if (currentStep.value === 1) return '下一步，身份确认';
  if (currentStep.value === 4) return '提交举报';
  return '下一步';
});

const isStepValid = computed(() => {
  if (currentStep.value === 1) return !!selectedType.value;
  if (currentStep.value === 2) return !!identity.value;
  if (currentStep.value === 4) return agreePromise.value && signature.value.length > 1;
  return true;
});
</script>

<template>
  <transition name="slide-up">
    <div v-if="props.visible" class="rights-report-page">
      <!-- 头部 -->
      <div class="header">
        <div class="header-left" @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <div class="header-title">侵权投诉</div>
        <div class="header-right"></div>
      </div>

      <!-- 步骤条 -->
      <div class="steps-bar">
        <div v-for="i in 4" :key="i" class="step-item" :class="{ 'active': currentStep >= i }">
          <div class="step-num">{{ i }}</div>
          <div class="step-text">{{ ['侵权类型', '身份确认', '材料提交', '承诺签名'][i-1] }}</div>
          <div v-if="i < 4" class="step-line"></div>
        </div>
      </div>

      <div class="content-scroll">
        <!-- 步骤 1: 侵权类型 -->
        <div v-if="currentStep === 1" class="step-content">
          <h2 class="section-title">请选择侵权类型</h2>
          <div v-for="cat in rightsCategories" :key="cat.title" class="cat-group">
            <h3 class="cat-title">{{ cat.title }}</h3>
            <div class="type-grid">
              <div 
                v-for="type in cat.types" 
                :key="type"
                class="type-item"
                :class="{ 'active': selectedType === type }"
                @click="selectedType = type"
              >
                {{ type }}
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 2: 身份确认 -->
        <div v-if="currentStep === 2" class="step-content no-padding">
          <div class="info-banner">
            小红书历来尊重的保护用户权益，请针对该条举报笔记，选择您的身份
          </div>
          <div class="radio-list">
            <div class="radio-item" @click="identity = 'owner'">
              <span>我是权利人本人</span>
              <div class="radio-circle" :class="{ 'checked': identity === 'owner' }">
                <el-icon v-if="identity === 'owner'"><Check /></el-icon>
              </div>
            </div>
            <div class="radio-item" @click="identity = 'agent'">
              <span>我是授权代理人</span>
              <div class="radio-circle" :class="{ 'checked': identity === 'agent' }">
                <el-icon v-if="identity === 'agent'"><Check /></el-icon>
              </div>
            </div>
          </div>
          <div class="identity-guide">
            <p class="guide-title">侵权投诉需要准备哪些材料？</p>
            <div class="guide-section">
              <p class="guide-sub">1.如果你是当事人</p>
              <p class="guide-text">请准备好清晰完整的身份证件照片/营业执照 (含公司或机构公章)</p>
            </div>
            <div class="guide-section">
              <p class="guide-sub">2.如果你是当事人授权的代理人</p>
              <p class="guide-text">除委托双方身份证件外，请准备好有效期内的维权授权书 (含授权人的签字或盖章)</p>
            </div>
            <div class="guide-section">
              <p class="guide-sub">3.其他注意事项</p>
              <ul class="guide-list">
                <li>请指出涉嫌侵权内容侵犯上述权益的具体内容和理由，并写明诉求</li>
                <li>不同侵权类型需提供的材料可能不同，详情可见 <span class="link">侵权投诉指引</span></li>
                <li>如需投诉多个作品，你可以访问 <span class="link">小红书权利保护中心</span> 投诉</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 步骤 3: 材料提交 -->
        <div v-if="currentStep === 3" class="step-content no-padding gray-bg">
          <div class="info-banner">
            你填写的部分信息或将依法转送至被投诉方，且仅用于本次投诉的处理。
          </div>
          
          <div class="form-card">
            <div class="card-header">
              <span>更早原创作品</span>
              <div class="header-right-text" @click="showToast('暂无可选笔记')">小红书原创笔记 <el-icon><ArrowRight /></el-icon></div>
            </div>
            <div class="upload-area">
              <div 
                v-for="(img, idx) in originalImages" 
                :key="idx" 
                class="image-preview"
              >
                <img :src="img" />
                <el-icon class="delete-btn" @click="removeImage(idx, 'original')"><CircleCloseFilled /></el-icon>
              </div>
              <div 
                v-if="originalImages.length < 1"
                class="upload-box" 
                @click="triggerUpload('original')"
              >
                <el-icon><Plus /></el-icon>
                <span>0/1</span>
              </div>
              <input 
                type="file" 
                ref="originalInputRef" 
                style="display: none" 
                accept="image/*"
                @change="e => handleFileChange(e, 'original')"
              />
            </div>
            <div class="card-tips">
              <p>1. 若原创更早公开首发于小红书，可点击右上角直接勾选笔记。</p>
              <p>2. 若原创未曾更早在小红书发布，则需手动粘贴公开发布链接。并需要在本页面下方的“权属证明”处，提交首发公开该内容的账号运营后台截图，确保该内容确系来源于您哦~</p>
            </div>
          </div>

          <div class="form-card">
            <div class="card-header">上传权属证明</div>
            <p class="card-desc">将权属证明转发给被投诉方，以加快处理流程。请注意保护隐私信息。</p>
            <div class="checkbox-row" @click="agreeForward = !agreeForward">
              <div class="radio-circle small" :class="{ 'checked': agreeForward }">
                <el-icon v-if="agreeForward"><Check /></el-icon>
              </div>
              <span>我同意将权属证明转发给被投诉方</span>
            </div>
            <div class="upload-area flex-wrap">
              <div 
                v-for="(img, idx) in proofImages" 
                :key="idx" 
                class="image-preview"
              >
                <img :src="img" />
                <el-icon class="delete-btn" @click="removeImage(idx, 'proof')"><CircleCloseFilled /></el-icon>
              </div>
              <div 
                v-if="proofImages.length < 4"
                class="upload-box" 
                @click="triggerUpload('proof')"
              >
                <el-icon><Camera /></el-icon>
                <span>{{ proofImages.length }}/4</span>
              </div>
              <input 
                type="file" 
                ref="proofInputRef" 
                style="display: none" 
                accept="image/*"
                @change="e => handleFileChange(e, 'proof')"
              />
            </div>
            <div class="card-tips">
              <p>1. 用来证明上述原创作品权属属于您</p>
              <p>2. 若您有版权/专利登记证书可以直接上传</p>
              <p>3. 若无也可以提交创作手稿、作品首次发表时间证明材料等</p>
              <p>4. 如您发现该笔记的文件存在侵权行为，请在此上传相关证明材料 (如权属证明、侵权对比截图等)，并在侵权详情描述进行详细说明</p>
            </div>
          </div>

          <div class="form-card">
            <div class="card-header">侵权详情描述</div>
            <textarea 
              class="desc-textarea" 
              placeholder="请说明具体抄袭的文本、图片，及您的诉求，会更有利于平台协助处理哦。如：该笔记第二张图中第二段文段抄袭、该笔记全文照搬，希望平台采取下架/限流操作等。"
              v-model="details"
            ></textarea>
          </div>

          <div class="form-card row-card">
            <span>保留这篇笔记的投诉信息</span>
            <el-switch v-model="keepInfo" active-color="#ff2442" />
          </div>
        </div>

        <!-- 步骤 4: 承诺签名 (小红书风格设计) -->
        <div v-if="currentStep === 4" class="step-content">
          <h2 class="section-title">承诺与签名</h2>
          <div class="promise-card">
            <div class="promise-header">
              <el-icon><SuccessFilled /></el-icon>
              <span>投诉承诺书</span>
            </div>
            <p class="promise-text">
              本人/本单位承诺：以上提供的所有投诉材料及信息均真实、合法、有效。本人/本单位保证对所投诉的内容拥有合法权益或已获得合法授权。
            </p>
            <p class="promise-text">
              如因本次投诉导致小红书平台遭受任何损失（包括但不限于赔偿金、诉讼费、律师费等），本人/本单位愿承担全部法律责任。
            </p>
          </div>

          <div class="signature-section">
            <p class="label">请签署您的真实姓名</p>
            <div class="sig-input-wrapper">
              <input 
                type="text" 
                class="sig-input" 
                placeholder="在此输入姓名" 
                v-model="signature"
              />
              <div class="sig-line"></div>
            </div>
          </div>

          <div class="promise-agree" @click="agreePromise = !agreePromise">
            <div class="radio-circle small" :class="{ 'checked': agreePromise }">
              <el-icon v-if="agreePromise"><Check /></el-icon>
            </div>
            <span class="agree-text">我已阅读并同意上述<span class="highlight">承诺条款</span></span>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="footer">
        <button 
          class="next-btn" 
          :disabled="!isStepValid"
          @click="nextStep"
        >
          {{ stepTitle }}
        </button>
      </div>

      <!-- 最终成功页 -->
      <RedBookReportSuccess 
        :visible="showSuccessPage"
        @close="handleFinalClose"
      />
    </div>
  </transition>
</template>

<style scoped lang="scss">
.rights-report-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 3200;
  display: flex;
  flex-direction: column;
  overflow-x: hidden; /* 防止横向滚动 */
}

.header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  box-sizing: border-box;
  .header-left { font-size: 24px; cursor: pointer; }
  .header-title { font-size: 17px; font-weight: 600; }
  .header-right { width: 24px; }
}

.steps-bar {
  display: flex;
  padding: 20px 16px; /* 减小内边距防止挤压 */
  justify-content: space-between;
  position: relative;
  box-sizing: border-box;
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    flex: 1;
    position: relative;
    box-sizing: border-box;

    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f5f5f5;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      border: 1px solid #eee;
      box-sizing: border-box;
    }

    .step-text {
      font-size: 11px;
      color: #999;
      white-space: nowrap; /* 保持文字一行 */
    }

    .step-line {
      position: absolute;
      top: 16px;
      left: calc(50% + 16px);
      width: calc(100% - 32px);
      height: 1px;
      background: #eee;
    }

    &.active {
      .step-num {
        background: #fff;
        color: #ff2442;
        border-color: #ff2442;
      }
      .step-text { color: #ff2442; }
      .step-line { background: #ff2442; opacity: 0.2; }
    }
  }
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.step-content {
  padding: 20px 16px;
  box-sizing: border-box;
  &.no-padding { padding: 0; }
  &.gray-bg { background: #f9f9f9; }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
}

.cat-group {
  margin-bottom: 24px;
  .cat-title {
    font-size: 14px;
    color: #999;
    font-weight: 400;
    margin-bottom: 12px;
  }
}

.type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .type-item {
    height: 44px;
    background: #f8f8f8;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #333;
    border: 1px solid transparent;

    &.active {
      background: #fff0f0;
      color: #ff2442;
      border-color: #ff2442;
    }
  }
}

.info-banner {
  background: #edf5ff;
  padding: 12px 16px;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.radio-list {
  background: #fff;
  .radio-item {
    height: 56px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    border-bottom: 0.5px solid #f5f5f5;

    .radio-circle {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1px solid #d9d9d9;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-sizing: border-box;

      i {
        font-size: 14px;
        font-weight: bold;
        color: #fff;
      }

      &.checked {
        background: #ff2442;
        border-color: #ff2442;
      }
    }
  }
}

.identity-guide {
  padding: 24px 16px;
  background: #f9f9f9;
  
  .guide-title { font-weight: 600; margin-bottom: 16px; color: #333; }
  .guide-section {
    margin-bottom: 20px;
    .guide-sub { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .guide-text { font-size: 13px; color: #666; line-height: 1.6; }
    .guide-list {
      padding-left: 18px;
      li {
        font-size: 13px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 8px;
        list-style: disc;
      }
    }
    .link { color: #5077aa; }
  }
}

.form-card {
  background: #fff;
  margin: 12px 16px;
  border-radius: 12px;
  padding: 16px;

  &.row-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 500;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    .header-right-text { font-size: 13px; color: #999; font-weight: 400; }
  }

  .card-desc { font-size: 13px; color: #666; margin-bottom: 12px; line-height: 1.4; }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #333;
  }

  .upload-area {
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
    &.flex-wrap { flex-wrap: wrap; }

    .image-preview {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .delete-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 18px;
        color: rgba(0,0,0,0.5);
        background: #fff;
        border-radius: 50%;
        cursor: pointer;
      }
    }

    .upload-box {
      width: 80px;
      height: 80px;
      background: #f8f8f8;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 24px;
      cursor: pointer;
      span { font-size: 11px; margin-top: 4px; }
    }
  }

  .card-tips {
    p { font-size: 12px; color: #bbb; line-height: 1.6; margin-bottom: 4px; }
  }

  .desc-textarea {
    width: 100%;
    height: 120px;
    border: none;
    background: #f8f8f8;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    &::placeholder { color: #ccc; }
  }
}

.promise-card {
  background: #fff5f5;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  border: 1px solid #ffecec;

  .promise-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ff2442;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    i { font-size: 20px; }
  }

  .promise-text {
    font-size: 14px;
    color: #666; /* 承诺正文用深灰色更专业 */
    line-height: 1.8;
    margin-bottom: 12px;
    &:last-child { margin-bottom: 0; }
  }
}

.signature-section {
  margin-bottom: 40px;
  .label { font-size: 14px; color: #999; margin-bottom: 16px; }
  
  .sig-input-wrapper {
    position: relative;
    .sig-input {
      width: 100%;
      height: 60px;
      border: none;
      background: #f9f9f9;
      border-radius: 8px;
      font-size: 20px;
      font-weight: 600;
      padding: 0 16px;
      color: #333;
      box-sizing: border-box; /* 确保 padding 不会撑开宽度 */
      &::placeholder { font-weight: 400; color: #ccc; font-size: 16px; }
    }
    .sig-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: #ff2442;
      transition: width 0.3s ease;
    }
    .sig-input:focus + .sig-line {
      width: 100%;
    }
  }
}

.promise-agree {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  .radio-circle.small {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid #d9d9d9;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;

    i {
      font-size: 12px;
      color: #fff;
      display: none;
    }

    &.checked {
      background: #ff2442;
      border-color: #ff2442;
      i {
        display: block;
      }
    }
  }

  .agree-text {
    font-size: 13px;
    color: #999;
    line-height: 1.4;
    
    .highlight {
      color: #333;
      font-weight: 500;
    }
  }
}

.footer {
  padding: 12px 16px 34px;
  background: #fff;
  .next-btn {
    width: 100%;
    height: 48px;
    background: #ff2442;
    color: #fff;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    border: none; /* 去除边框 */
    &:disabled { opacity: 0.5; }
  }
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
