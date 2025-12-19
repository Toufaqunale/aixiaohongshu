<script setup lang="ts">
interface Props {
  modelValue: string;
  theme?: 'light' | 'dark';
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'next']);

const selectIdentity = (identity: 'personal' | 'organization') => {
  emit('update:modelValue', identity);
  // 延迟一会再进入下一步，让用户看到选中态
  setTimeout(() => {
    emit('next');
  }, 200);
};
</script>

<template>
  <div class="step-identity" :class="props.theme === 'dark' ? 'theme-dark' : 'theme-light'">
    <h3 class="step-title">请选择你的身份</h3>
    
    <div class="identity-cards">
      <div 
        class="identity-card" 
        :class="{ active: props.modelValue === 'personal' }"
        @click="selectIdentity('personal')"
      >
        <div class="icon-box">
          <van-icon name="user-o" />
        </div>
        <div class="card-content">
          <div class="card-title">我是个人</div>
          <p class="card-desc">维护我个人的肖像权、著作权等</p>
        </div>
      </div>

      <div 
        class="identity-card" 
        :class="{ active: props.modelValue === 'organization' }"
        @click="selectIdentity('organization')"
      >
        <div class="icon-box">
          <van-icon name="hotel-o" />
        </div>
        <div class="card-content">
          <div class="card-title">我的组织</div>
          <p class="card-desc">维护我公司、品牌或机构的商标权、名誉权等</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.step-identity {
  padding: 0 16px;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 20px;
}

.identity-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.identity-card {
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    background: #fff;
    border-color: #ff2442;
    box-shadow: 0 4px 12px rgba(255, 36, 66, 0.1);

    .icon-box {
      background: rgba(255, 36, 66, 0.1);
      color: #ff2442;
    }
  }

  .icon-box {
    width: 48px;
    height: 48px;
    background: #eee;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #666;
    margin-bottom: 16px;
    transition: all 0.2s;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
  }

  .card-desc {
    font-size: 11px;
    color: #999;
    line-height: 1.4;
    margin: 0;
  }
}

/* 黑暗模式适配 */
.theme-dark {
  .step-title {
    color: #eee;
  }

  .identity-card {
    background: #222;
    
    &.active {
      background: #2a2a2a;
      border-color: #ff4d6a;
      .icon-box {
        background: rgba(255, 77, 106, 0.15);
        color: #ff4d6a;
      }
      .card-title { color: #fff; }
    }

    .icon-box {
      background: #333;
      color: #aaa;
    }

    .card-title {
      color: #eee;
    }

    .card-desc {
      color: #777;
    }
  }
}
</style>
