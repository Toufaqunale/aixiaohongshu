<script setup lang="ts">
import { ref, computed } from 'vue';
import { Close } from '@element-plus/icons-vue';

interface Props {
  identityType: 'personal' | 'organization' | string;
  theme?: 'light' | 'dark';
}

const props = defineProps<Props>();
const emit = defineEmits(['submit', 'back']);

// 表单数据
const formData = ref({
  name: '', // 姓名或组织名称
  contactName: '', // 联系人姓名（组织）
  phone: '',
  idImages: [] as any[], // 身份/资质证明
  rightsImages: [] as any[], // 权属证明
});

// 表单验证
const isFormValid = computed(() => {
  if (props.identityType === 'personal') {
    return formData.value.name.trim() !== '' && formData.value.phone.trim() !== '';
  } else {
    return formData.value.name.trim() !== '' && 
           formData.value.contactName.trim() !== '' && 
           formData.value.phone.trim() !== '';
  }
});

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', { ...formData.value });
  }
};
</script>

<template>
  <div class="step-evidence" :class="props.theme === 'dark' ? 'theme-dark' : 'theme-light'">
    <h3 class="step-title">请提供证明材料（选填，有助于加快处理）</h3>

    <div class="evidence-form">
      <!-- 个人表单项 -->
      <template v-if="props.identityType === 'personal'">
        <div class="form-item">
          <label>你的姓名</label>
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="请输入您的真实姓名" 
            class="xhs-input"
          />
        </div>
        <div class="form-item">
          <label>联系电话</label>
          <input 
            v-model="formData.phone" 
            type="tel" 
            placeholder="请留下您的联系电话" 
            class="xhs-input"
          />
        </div>
      </template>

      <!-- 组织表单项 -->
      <template v-else>
        <div class="form-item">
          <label>组织名称</label>
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="请输入完整的公司/组织名称" 
            class="xhs-input"
          />
        </div>
        <div class="form-item">
          <label>联系人姓名</label>
          <input 
            v-model="formData.contactName" 
            type="text" 
            placeholder="请输入联系人真实姓名" 
            class="xhs-input"
          />
        </div>
        <div class="form-item">
          <label>联系电话</label>
          <input 
            v-model="formData.phone" 
            type="tel" 
            placeholder="请留下联系人电话" 
            class="xhs-input"
          />
        </div>
      </template>

      <!-- 上传区域：身份/资质证明 -->
      <div class="upload-section">
        <label>
          {{ props.identityType === 'personal' ? '上传身份证明（如身份证照片）' : '上传组织资质证明（如营业执照）' }}
          <span class="sub-label">（最多3张）</span>
        </label>
        <van-uploader 
          v-model="formData.idImages" 
          multiple 
          :max-count="3" 
          upload-icon="plus"
          class="xhs-uploader"
        >
          <template #preview-delete>
            <div class="custom-delete">
              <el-icon><Close /></el-icon>
            </div>
          </template>
        </van-uploader>
      </div>

      <!-- 上传区域：权属证明 -->
      <div class="upload-section">
        <label>
          {{ props.identityType === 'personal' ? '上传权属证明（如原创作品底稿、版权证书）' : '上传权属证明（如商标注册证、授权书）' }}
          <span class="sub-label">（最多3张）</span>
        </label>
        <van-uploader 
          v-model="formData.rightsImages" 
          multiple 
          :max-count="3" 
          upload-icon="plus"
          class="xhs-uploader"
        >
          <template #preview-delete>
            <div class="custom-delete">
              <el-icon><Close /></el-icon>
            </div>
          </template>
        </van-uploader>
      </div>
    </div>

    <div class="submit-button-container">
      <button 
        class="submit-button" 
        :class="{ active: isFormValid }"
        :disabled="!isFormValid"
        @click="handleSubmit"
      >
        提交
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.step-evidence {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  min-height: 0; /* 允许内容自然撑开 */
  /* === 【修复核心】添加以下两个属性 === */
    overflow-y: auto; /* 1. 启用垂直滚动 */
    -webkit-overflow-scrolling: touch; /* 2. 启用移动端弹性滚动（关键！）*/

    /* === 【可选但推荐】添加强制性高度约束 === */
    /* 方案A：设定一个最大高度（视情况调整数值） */
    max-height: 70vh;
  * {
    box-sizing: border-box;
  }
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 20px 0;
}

.evidence-form {
  /* 移除固定高度和内部滚动，由父容器统一处理滚动 */
  width: 100%;
  padding-bottom: 20px;
}

.form-item {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }

  .xhs-input {
    width: 100%;
    height: 44px;
    background: #f9f9f9;
    border: 0.5px solid #eee;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      background: #fff;
      border-color: #ff2442;
    }

    &::placeholder {
      color: #ccc;
    }
  }
}

.upload-section {
  margin-bottom: 24px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;

    .sub-label {
      font-size: 12px;
      color: #999;
      font-weight: normal;
    }
  }
}

.xhs-uploader {
  max-width: 100%;
  
  :deep(.van-uploader__wrapper) {
    flex-wrap: wrap;
    max-width: 100%;
  }

  :deep(.van-uploader__upload) {
    background-color: #f9f9f9;
    border: 1px dashed #ddd;
    border-radius: 8px;
    width: 80px;
    height: 80px;
    margin: 0 8px 8px 0;
  }

  :deep(.van-uploader__preview) {
    margin: 0 8px 8px 0;
  }

  :deep(.van-uploader__preview-image) {
    border-radius: 8px;
    width: 80px;
    height: 80px;
  }
}

.custom-delete {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  z-index: 1;
}

.submit-button-container {
  /* 固定在底部 */
  position: sticky;
  bottom: 0;
  left: 0;
  width: calc(100% + 32px); /* 补偿父容器的 padding */
  margin-left: -16px;
  padding: 16px;
  background-color: #fff;
  // box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  box-sizing: border-box;
  padding-bottom: calc(16px + env(safe-area-inset-bottom)); /* 适配 iOS 安全区域 */
}

.submit-button {
  width: 100%;
  height: 44px;
  background-color: #ccc;
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  cursor: not-allowed;

  &.active {
    background-color: #ff2442;
    cursor: pointer;
    
    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
  }
}

/* 黑暗模式适配 */
.theme-dark {
  .step-title { color: #eee; }

  .form-item {
    label { color: #aaa; }
    .xhs-input {
      background: #222;
      border-color: #333;
      color: #eee;
      &:focus { background: #2a2a2a; border-color: #ff2442; }
    }
  }

  .upload-section {
    label { color: #aaa; }
  }

  .xhs-uploader {
    :deep(.van-uploader__upload) {
      background-color: #222;
      border-color: #444;
    }
  }

  .submit-button-container {
    background: #161823;
  }
}
</style>
