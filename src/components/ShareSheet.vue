<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToast, showLoadingToast } from 'vant';
import { 
  Warning,
  Link,
  Download,
  ChatDotRound,
  Connection,
  Picture,
  Close,
  UserFilled,
  CircleClose
} from '@element-plus/icons-vue';

interface Props {
  visible: boolean;
  theme?: 'light' | 'dark';
  coverImage?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:visible', 'report', 'share', 'send', 'dislike']);

const themeClass = computed(() => props.theme === 'dark' ? 'theme-dark' : 'theme-light');

// 状态管理
const selectedContacts = ref<string[]>([]);
const messageText = ref('');
const isSending = computed(() => selectedContacts.value.length > 0);

// 模拟联系人数据 - 1:1 复刻图片
const contacts = [
  { id: '1', name: '难', avatar: 'https://picsum.photos/100/100?random=30' },
  { id: '2', name: '猫舍-成都…', avatar: 'https://picsum.photos/100/100?random=31' },
  { id: '3', name: '哈哈哈哈', avatar: 'https://picsum.photos/100/100?random=32', status: '今天在线' },
  { id: '4', name: 'Serendipity', avatar: 'https://picsum.photos/100/100?random=33', status: '.' },
  { id: '5', name: '小红薯682CC7F1', avatar: 'https://picsum.photos/100/100?random=34' },
];

// 切换联系人选择
const toggleContact = (contactId: string) => {
  const index = selectedContacts.value.indexOf(contactId);
  if (index > -1) {
    selectedContacts.value.splice(index, 1);
  } else {
    selectedContacts.value.push(contactId);
  }
};

// 发送逻辑
const handleSend = () => {
  emit('send', {
    contacts: selectedContacts.value,
    message: messageText.value
  });
  resetState();
  emit('update:visible', false);
};

const resetState = () => {
  selectedContacts.value = [];
  messageText.value = '';
};

// 监听关闭重置
const handleClose = () => {
  if (!isSending.value) {
    emit('update:visible', false);
  }
};

// 分享渠道配置 - 1:1 复刻图片
const shareChannels = [
  { icon: 'chat', label: '微信好友', color: '#07c160' },
  { icon: 'wechat-moments', label: '朋友圈', color: '#2ba245' },
  { icon: 'qq', label: 'QQ好友', color: '#12b7f5' },
  { icon: 'star', label: 'QQ空间', color: '#ffce00' },
  { icon: 'weibo', label: '微博', color: '#e6162d' },
];

// 操作选项配置 - 1:1 复刻图片
const actionOptions = [
  { label: '复制链接', icon: Link, action: 'copy' },
  { label: '生成分享图', icon: Picture, action: 'generate' },
  { label: '建群分享', icon: UserFilled, action: 'create_group' },
  { label: '保存图片', icon: Download, action: 'save' },
  { label: '不喜欢', icon: CircleClose, action: 'dislike' },
  { label: '举报', icon: Warning, action: 'report' },
];

const handleAction = async (action: string) => {
  if (action === 'report') {
    emit('report');
    emit('update:visible', false);
    return;
  }
  
  if (action === 'dislike') {
    emit('dislike');
    showToast('将减少此类内容推荐');
    emit('update:visible', false);
    return;
  }

  // 1:1 模仿小红书逻辑
  switch (action) {
    case 'copy':
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('链接已复制');
      } catch (err) {
        showToast('复制失败');
      }
      break;

    case 'save':
      showToast('已保存至相册');
      break;

    case 'generate':
      showToast('正在生成分享图...');
      break;
      
    case 'create_group':
      showToast('请选择群组成员');
      break;

    default:
      if (action.startsWith('share-')) {
        const channel = action.replace('share-', '');
        showToast(`正在跳转至${channel}...`);
      }
      emit('share', action);
      break;
  }

  emit('update:visible', false);
};
</script>

<template>
  <van-popup 
    :show="props.visible" 
    position="bottom"
    round
    @update:show="handleClose"
    class="share-sheet-container"
  >
    <div class="share-content" :class="themeClass">
      <!-- 自定义标题栏 -->
      <div class="share-header">
        <span class="header-title">{{ isSending ? '' : '分享至' }}</span>
        <div class="close-icon-wrap" @click="emit('update:visible', false)">
          <el-icon><Close /></el-icon>
        </div>
      </div>

      <!-- 第一排：联系人 -->
      <div class="share-grid contacts-grid">
        <div 
          v-for="contact in contacts" 
          :key="contact.id" 
          class="share-item contact-item"
          @click="toggleContact(contact.id)"
        >
          <div class="avatar-box" :class="{ 'is-selected': selectedContacts.includes(contact.id) }">
            <img :src="contact.avatar" :alt="contact.name" />
            <div v-if="selectedContacts.includes(contact.id)" class="check-badge">
              <van-icon name="success" />
            </div>
          </div>
          <span class="label truncate">{{ contact.name }}</span>
          <span v-if="contact.status" class="status-label">{{ contact.status }}</span>
        </div>
      </div>

      <template v-if="!isSending">
        <div class="divider"></div>

        <!-- 第二排：分享渠道 -->
        <div class="share-grid share-channels">
          <div 
            v-for="item in shareChannels" 
            :key="item.label" 
            class="share-item"
            @click="handleAction('share-' + item.label)"
          >
            <div class="icon-box" :style="item.color ? { color: item.color } : {}">
              <van-icon :name="item.icon" />
            </div>
            <span class="label">{{ item.label }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 第三排：操作选项 -->
        <div class="share-grid action-options">
          <div 
            v-for="item in actionOptions" 
            :key="item.label" 
            class="share-item"
            @click="handleAction(item.action)"
          >
            <div class="icon-box action-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <span class="label">{{ item.label }}</span>
          </div>
        </div>
      </template>

      <!-- 留言区域 (选中联系人后显示) -->
      <template v-else>
        <div class="message-container">
          <div class="message-input-wrap">
            <textarea 
              v-model="messageText" 
              placeholder="跟朋友说点什么吧..." 
              class="message-textarea"
            ></textarea>
            <div class="post-preview">
              <img :src="props.coverImage || 'https://picsum.photos/200/200?random=50'" alt="preview" />
            </div>
          </div>
        </div>
      </template>

      <!-- 底部按钮 -->
      <div v-if="isSending" class="send-btn-wrap">
        <div class="send-btn" @click="handleSend">发送</div>
      </div>
      <!-- 取消按钮已由顶部 X 代替 -->
    </div>
  </van-popup>
</template>

<style scoped lang="scss">
.share-sheet-container {
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

.share-content {
  padding: 0 0 20px;
  background: #fff;
}

.share-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  .header-title {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }

  .close-icon-wrap {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 20px;
    color: #333;
    padding: 4px;
    cursor: pointer;
    
    &:active {
      opacity: 0.6;
    }
  }
}

.share-grid {
  display: flex;
  overflow-x: auto;
  padding: 12px 16px;
  gap: 16px; /* 间距调整为 16px */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px; /* 宽度微调 */
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }

  .icon-box {
    width: 48px;
    height: 48px;
    background: #f5f5f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px; /* 图标稍大 */
    margin-bottom: 8px;

    &.action-icon {
      background: #f8f8f8;
      color: #333;
      font-size: 22px;
    }
  }

  .avatar-box {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    position: relative;
    margin-bottom: 6px;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    &.is-selected {
      &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid #ff2442;
        border-radius: 50%;
      }
    }

    .check-badge {
      position: absolute;
      right: -2px;
      bottom: -2px;
      width: 18px;
      height: 18px;
      background: #ff2442;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 10px;
      border: 1.5px solid #fff;
      z-index: 1;
    }
  }

  .label {
    font-size: 10px; /* 字体更小 */
    color: #666;
    max-width: 64px;
    text-align: center;
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .status-label {
    font-size: 9px;
    color: #ccc;
    transform: scale(0.9);
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.divider {
  height: 0.5px;
  background: #f0f0f0;
  margin: 0 16px;
}

.message-container {
  padding: 16px;
  background: #fff;
}

.message-input-wrap {
  display: flex;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 12px;
  min-height: 80px;
  gap: 12px;
}

.message-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-size: 14px;
  color: #333;
  padding: 0;
  &::placeholder {
    color: #ccc;
  }
  &:focus {
    outline: none;
  }
}

.post-preview {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.send-btn-wrap {
  padding: 10px 16px 20px;
  border-top: 0.5px solid #eee;
}

.send-btn {
  height: 44px;
  background: #ff2442;
  color: #fff;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  
  &:active {
    opacity: 0.8;
  }
}

/* 黑暗模式适配 */
.theme-dark {
  background: #1a1a1a;
  
  .share-header .header-title,
  .share-header .close-icon-wrap {
    color: #eee;
  }

  .icon-box {
    background: #2a2a2a;
  }

  .icon-box.action-icon {
    background: #2a2a2a;
    color: #999;
  }
  
  .label {
    color: #999;
  }
  
  .divider {
    background: #333;
  }
}
</style>
