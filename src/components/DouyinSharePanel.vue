<script setup lang="ts">
import { ref } from 'vue'
import DouyinReportPanel from './DouyinReportPanel.vue'

const props = defineProps<{
  visible: boolean
  shareCount: number
}>()

const emit = defineEmits(['update:visible', 'update:shareCount'])

const selectedContactIds = ref<number[]>([])
const shareText = ref('')
const showReport = ref(false)

const contacts = ref([
  { id: 1, name: 'ai课程(4)', avatar: 'https://picsum.photos/100/100?random=20', fire: '271', fireType: 'gray' },
  { id: 2, name: '前端', avatar: 'https://picsum.photos/100/100?random=21', fire: '616', fireType: 'gray' },
  { id: 3, name: 'vue(4)', avatar: 'https://picsum.photos/100/100?random=22', fire: '272', fireType: 'hot' },
  { id: 4, name: '魔芋(5)', avatar: 'https://picsum.photos/100/100?random=23', fire: '12', fireType: 'gray' },
  { id: 5, name: '导师🧑‍🏫', avatar: 'https://picsum.photos/100/100?random=24', fire: '', fireType: '' },
])

const actions = ref([
  { id: 1, name: '合拍', icon: 'friends-o' },
  { id: 2, name: '一起看视频', icon: 'tv-o' },
  { id: 3, name: '生成图片', icon: 'photo-o' },
  { id: 4, name: '桌面刷抖音', icon: 'apps-o' },
  { id: 5, name: '举报', icon: 'warning-o' },
  { id: 6, name: '播放速度', icon: 'clock-o' },
])

const close = () => {
  emit('update:visible', false)
}

const toggleSelect = (id: number) => {
  const index = selectedContactIds.value.indexOf(id)
  if (index > -1) {
    selectedContactIds.value.splice(index, 1)
    if (selectedContactIds.value.length === 0) {
      shareText.value = ''
    }
  } else {
    selectedContactIds.value.push(id)
  }
}

const handleSend = () => {
  emit('update:shareCount', props.shareCount + selectedContactIds.value.length)
  selectedContactIds.value = []
  shareText.value = ''
  close()
}

const handleAction = (action: any) => {
  if (action.name === '举报') {
    showReport.value = true
  }
}
</script>

<template>
  <van-popup
    :show="props.visible"
    position="bottom"
    round
    @update:show="close"
    class="douyin-share-popup"
  >
    <div class="share-panel">
      <div class="share-header">
        <span class="title">分享给</span>
        <div class="close-btn" @click="close">
          <van-icon name="cross" />
        </div>
      </div>

      <!-- 第一行：联系人 -->
      <div class="share-row contacts-row">
        <div class="row-inner">
          <div 
            v-for="item in contacts" 
            :key="item.id" 
            class="share-item contact-item"
            @click="toggleSelect(item.id)"
          >
            <div class="avatar-box" :class="{ selected: selectedContactIds.includes(item.id) }">
              <img :src="item.avatar" alt="avatar" />
              <div v-if="selectedContactIds.includes(item.id)" class="select-badge">
                <van-icon name="success" />
              </div>
            </div>
            <span class="item-name">{{ item.name }}</span>
            <div v-if="item.fire" class="fire-info" :class="item.fireType">
              <van-icon name="fire" class="fire-icon" />
              <span>{{ item.fire }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 选择后的输入区域 -->
      <div v-if="selectedContactIds.length > 0" class="share-input-section">
        <div class="input-header-line"></div>
        <div class="input-content">
          <textarea 
            v-model="shareText" 
            placeholder="分享此刻的想法"
            rows="2"
          ></textarea>
          <div class="video-preview">
            <img src="https://picsum.photos/1080/1920?random=1" alt="preview" />
          </div>
        </div>
        <div class="send-btn-wrap">
          <div class="send-btn" @click="handleSend">
            <van-icon name="paper-plane" class="send-icon" />
            <span>发送</span>
          </div>
        </div>
      </div>

      <!-- 第二行：功能按钮 -->
      <div v-if="selectedContactIds.length === 0" class="share-row actions-row">
        <div class="row-inner">
          <div 
            v-for="item in actions" 
            :key="item.id" 
            class="share-item action-item"
            @click="handleAction(item)"
          >
            <div class="icon-box">
              <van-icon :name="item.icon" />
            </div>
            <span class="item-name">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </van-popup>

  <!-- 举报面板 -->
  <DouyinReportPanel 
    :visible="showReport" 
    @update:visible="showReport = $event"
    @back="showReport = false"
  />
</template>

<style scoped lang="scss">
.douyin-share-popup {
  background: #f8f8f8;
  border-radius: 12px 12px 0 0;
}

.share-panel {
  padding-bottom: env(safe-area-inset-bottom);
}

.share-header {
  padding: 20px 20px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .title {
    font-size: 18px;
    font-weight: 600;
    color: #111;
  }
  
  .close-btn {
    width: 28px;
    height: 28px;
    background: #eee;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #333;
  }
}

.share-row {
  padding: 15px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .row-inner {
    display: flex;
    padding: 0 10px;
  }
}

.share-item {
  flex-shrink: 0;
  width: 85px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  .item-name {
    font-size: 13px;
    color: #333;
    width: 100%;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 4px;
  }
}

/* 联系人样式 */
.contact-item {
  .avatar-box {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    overflow: visible;
    background: #fff;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      transition: all 0.2s;
    }

    &.selected {
      img {
        opacity: 0.7;
      }
    }
  }

  .select-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    background: #ff2c55;
    border-radius: 50%;
    border: 2px solid #f8f8f8;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    z-index: 2;
  }
  
  .fire-info {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 11px;
    font-weight: 500;
    
    &.gray {
      color: #999;
    }
    
    &.hot {
      color: #ff602e;
    }
    
    .fire-icon {
      font-size: 12px;
    }
  }
}

/* 分享输入区域 */
.share-input-section {
  padding: 0 20px 20px;
  
  .input-header-line {
    height: 0.5px;
    background: #eee;
    margin: 10px 0 20px;
  }
  
  .input-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 25px;
    
    textarea {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      color: #333;
      resize: none;
      outline: none;
      padding-top: 5px;
      
      &::placeholder {
        color: #999;
      }
    }
    
    .video-preview {
      width: 65px;
      height: 85px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  
  .send-btn-wrap {
    padding-bottom: 10px;
  }
  
  .send-btn {
    width: 100%;
    height: 48px;
    background: #ff2c55;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    gap: 6px;
    
    .send-icon {
      font-size: 20px;
      transform: rotate(-10deg);
    }
  }
}

/* 功能按钮样式 */
.action-item {
  .icon-box {
    width: 58px;
    height: 58px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    color: #333;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
}

.actions-row {
  border-top: 0.5px solid #eee;
  padding-top: 25px;
  margin-top: 5px;
}
</style>