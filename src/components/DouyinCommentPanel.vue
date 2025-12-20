<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  commentCount: number
  autoFocusInput?: boolean
}>()

const emit = defineEmits(['update:visible', 'update:autoFocusInput', 'update:commentCount'])

const showInputPopup = ref(false)

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  const seed = Math.floor(Math.random() * 1000)
  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.autoFocusInput) {
    // 如果是从视频底部的“发评论”点进来的，直接打开输入模态框
    setTimeout(() => {
      openInputPopup()
      emit('update:autoFocusInput', false)
    }, 300) // 等待评论面板展开动画完成
  }
})
const commentText = ref('')
const selectedImage = ref<string | null>(null)
const replyingTo = ref<Comment | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const onInputPopupOpened = () => {
  textareaRef.value?.focus()
}

const openInputPopup = (reply: Comment | null = null) => {
  replyingTo.value = reply
  showInputPopup.value = true
}

const closeInputPopup = () => {
  showInputPopup.value = false
  commentText.value = ''
  selectedImage.value = null
  replyingTo.value = null
}

const isPickingFile = ref(false)

const triggerImageUpload = () => {
  isPickingFile.value = true
  fileInputRef.value?.click()
}

const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string
      isPickingFile.value = false
      // 如果模态框还没打开，打开它
      if (!showInputPopup.value) {
        showInputPopup.value = true
      }
      // 选择图片后聚焦输入框
      nextTick(() => {
        textareaRef.value?.focus()
      })
    }
    reader.readAsDataURL(file)
  } else {
    isPickingFile.value = false
  }
}

const onInputBlur = () => {
  // 如果正在选择文件，不要关闭模态窗
  if (isPickingFile.value) return

  // 当 textarea 失去焦点（收起键盘）时，延迟一点关闭，防止点击发送按钮失效
  setTimeout(() => {
    if (!commentText.value.trim() && !selectedImage.value && !isPickingFile.value) {
      closeInputPopup()
    }
  }, 200)
}

const emojis = [
  '😊', '🥰', '😳', '😭', '🐶', '😂', '🔥', '🫂', '✨', '👏', '🙌', '👍', '🌹', '❤️', '🤔', '🙄', '👀', '🤣', '🤤', '🌚',
  '😏', '😇', '🥳', '🤩', '😍', '😘', '😚', '😜', '😎', '🤓', '🧐', '🤨', '😟', '😠', '😡', '🤬', '🤯', '😱', '😨', '😰'
]

const handleEmojiClick = (emoji: string) => {
  commentText.value += emoji
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const handleSend = () => {
  if (!commentText.value.trim() && !selectedImage.value) return
  
  const newComment: Comment = {
    id: Date.now(),
    avatar: 'https://picsum.photos/100/100?random=20',
    name: '我',
    content: commentText.value,
    image: selectedImage.value || undefined,
    replyTo: replyingTo.value ? replyingTo.value.name : undefined,
    time: '刚刚',
    location: '上海',
    likeCount: 0,
    isLiked: false,
    isDisliked: false,
    replies: []
  }
  
  if (replyingTo.value) {
    // 寻找目标评论，如果是二级回复，也放到所属的一级评论下
    const findAndAddReply = (list: Comment[]) => {
      for (const item of list) {
        if (item.id === replyingTo.value?.id) {
          if (!item.replies) item.replies = []
          item.replies.push(newComment)
          return true
        }
        if (item.replies && findAndAddReply(item.replies)) {
          return true
        }
      }
      return false
    }
    findAndAddReply(comments.value)
  } else {
    comments.value.unshift(newComment)
  }
  
  emit('update:commentCount', props.commentCount + 1)
  closeInputPopup()
}

interface Comment {
  id: number
  avatar: string
  name: string
  content: string
  image?: string
  replyTo?: string
  time: string
  location: string
  likeCount: number
  isLiked: boolean
  isDisliked: boolean
  isFirst?: boolean
  replies?: Comment[]
}

const comments = ref<Comment[]>([
  {
    id: 1,
    avatar: 'https://picsum.photos/100/100?random=10',
    name: 'JC-T',
    content: '教教我😭😭😭',
    time: '4小时前',
    location: '广东',
    likeCount: 5,
    isLiked: true,
    isDisliked: false,
    isFirst: true,
    replies: [
      {
        id: 11,
        avatar: 'https://picsum.photos/100/100?random=15',
        name: '开发者',
        content: '关注我，带你飞',
        time: '3小时前',
        location: '上海',
        likeCount: 2,
        isLiked: false,
        isDisliked: false
      }
    ]
  },
  {
    id: 2,
    avatar: 'https://picsum.photos/100/100?random=11',
    name: '桃花',
    content: '🥺🥺到底怎么做成这样的',
    time: '2小时前',
    location: '北京',
    likeCount: 0,
    isLiked: false,
    isDisliked: false,
    replies: []
  }
])

const handleLike = (cmt: Comment) => {
  cmt.isLiked = !cmt.isLiked
  if (cmt.isLiked) {
    cmt.likeCount++
    if (cmt.isDisliked) cmt.isDisliked = false
  } else {
    cmt.likeCount--
  }
}

const toggleDislike = (cmt: Comment) => {
  cmt.isDisliked = !cmt.isDisliked
  if (cmt.isDisliked && cmt.isLiked) {
    cmt.isLiked = false
    cmt.likeCount--
  }
}

const close = () => {
  emit('update:visible', false)
}

// 暴露给外部调用的快速评论方法
const addExternalComment = (content: string) => {
  const newComment: Comment = {
    id: Date.now(),
    avatar: 'https://picsum.photos/100/100?random=20',
    name: '我',
    content: content,
    time: '刚刚',
    location: '上海',
    likeCount: 0,
    isLiked: false,
    isDisliked: false,
    replies: []
  }
  comments.value.unshift(newComment)
  emit('update:commentCount', props.commentCount + 1)
}

defineExpose({
  addExternalComment
})
</script>

<template>
  <van-popup
    :show="props.visible"
    position="bottom"
    round
    @update:show="close"
    class="douyin-comment-popup"
  >
    <div class="comment-panel">
      <!-- 隐藏的文件上传 input 移到外层，确保全局可触发 -->
      <input 
        type="file" 
        ref="fileInputRef" 
        style="display: none" 
        accept="image/*"
        @change="handleImageChange"
      >
      <!-- 顶部搜索条 -->
      <div class="panel-header">
        <div class="search-bar">
          <span class="search-label">大家都在搜：</span>
          <span class="search-keyword">AI怎么使用</span>
          <van-icon name="search" class="search-icon" />
        </div>
        <div class="header-actions">
          <div class="action-btn">
            <van-icon name="enlarge" />
          </div>
          <div class="action-btn" @click="close">
            <van-icon name="cross" />
          </div>
        </div>
      </div>

      <!-- 评论计数 -->
      <div class="comment-count-title">
        {{ props.commentCount }}条评论
      </div>

      <!-- 评论列表 -->
      <div class="comment-list">
        <div v-for="cmt in comments" :key="cmt.id" class="comment-item">
          <div class="cmt-avatar">
            <img :src="cmt.avatar" alt="avatar" @error="handleAvatarError" />
          </div>
          <div class="cmt-main">
            <div class="cmt-user-name" @click="openInputPopup(cmt)">{{ cmt.name }}</div>
            <div class="cmt-content" @click="openInputPopup(cmt)">
              <template v-if="cmt.replyTo">
                回复 <span class="reply-name">{{ cmt.replyTo }}</span>：
              </template>
              {{ cmt.content }}
              <span v-if="cmt.isFirst" class="first-tag">首评</span>
              <div v-if="cmt.image" class="comment-image-preview">
                <img :src="cmt.image" alt="comment-img" />
              </div>
            </div>
            <div class="cmt-footer">
              <div class="footer-left">
                <span class="cmt-time">{{ cmt.time }}</span>
                <span class="cmt-dot">·</span>
                <span class="cmt-location">{{ cmt.location }}</span>
                <span class="cmt-reply" @click="openInputPopup(cmt)">回复</span>
              </div>
              <div class="cmt-actions">
                <div class="action-item" :class="{ active: cmt.isLiked }" @click="handleLike(cmt)">
                  <van-icon :name="cmt.isLiked ? 'like' : 'like-o'" />
                  <span v-if="cmt.likeCount > 0" class="count">{{ cmt.likeCount }}</span>
                </div>
                <div class="action-item dislike-item" :class="{ active: cmt.isDisliked }" @click="toggleDislike(cmt)">
                  <van-icon name="closed-eye" class="dislike-icon" />
                </div>
              </div>
            </div>

            <!-- 二级回复列表 -->
            <div v-if="cmt.replies && cmt.replies.length > 0" class="replies-list">
              <div v-for="reply in cmt.replies" :key="reply.id" class="comment-item reply-item">
                <div class="cmt-avatar reply-avatar">
                  <img :src="reply.avatar" alt="avatar" @error="handleAvatarError" />
                </div>
                <div class="cmt-main">
                  <div class="cmt-user-name" @click="openInputPopup(reply)">{{ reply.name }}</div>
                  <div class="cmt-content" @click="openInputPopup(reply)">
                    <template v-if="reply.replyTo">
                      回复 <span class="reply-name">{{ reply.replyTo }}</span>：
                    </template>
                    {{ reply.content }}
                    <div v-if="reply.image" class="comment-image-preview">
                      <img :src="reply.image" alt="comment-img" />
                    </div>
                  </div>
                  <div class="cmt-footer">
                    <div class="footer-left">
                      <span class="cmt-time">{{ reply.time }}</span>
                      <span class="cmt-dot">·</span>
                      <span class="cmt-location">{{ reply.location }}</span>
                      <span class="cmt-reply" @click="openInputPopup(reply)">回复</span>
                    </div>
                    <div class="cmt-actions">
                      <div class="action-item" :class="{ active: reply.isLiked }" @click="handleLike(reply)">
                        <van-icon :name="reply.isLiked ? 'like' : 'like-o'" />
                        <span v-if="reply.likeCount > 0" class="count">{{ reply.likeCount }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="no-more">暂时没有更多了</div>
      </div>

      <!-- 底部输入框 -->
      <div class="panel-footer" @click="openInputPopup(null)">
        <div class="input-container">
          <div class="fake-input">发条评论，说说你的感受</div>
          <div class="input-icons">
            <van-icon name="photo-o" class="footer-icon" @click.stop="triggerImageUpload" />
          </div>
        </div>
      </div>
    </div>
  </van-popup>

  <!-- 评论输入弹窗 -->
  <van-popup
    v-model:show="showInputPopup"
    position="bottom"
    :overlay-style="{ background: 'rgba(0,0,0,0.1)' }"
    class="comment-input-popup"
    @opened="onInputPopupOpened"
    :duration="0.2"
    :lock-scroll="false"
  >
    <div class="input-modal-content">
      <!-- 回复提示 -->
      <div v-if="replyingTo" class="reply-hint">
        回复 <span class="reply-user">@{{ replyingTo.name }}</span>
      </div>

      <!-- 图片回显预览 -->
      <div v-if="selectedImage" class="image-preview-box">
        <img :src="selectedImage" class="preview-img" />
        <div class="close-preview" @click="selectedImage = null">
          <van-icon name="cross" />
        </div>
      </div>

      <div class="input-area-wrapper">
        <textarea
          v-model="commentText"
          :placeholder="replyingTo ? `回复 ${replyingTo.name}...` : '善语结善缘，恶语伤人心'"
          class="real-textarea"
          ref="textareaRef"
          @blur="onInputBlur"
        ></textarea>
        <div v-if="!commentText" class="cursor-mock"></div>
      </div>
      
      <div class="input-modal-footer">
        <div class="footer-left-icons">
          <van-icon name="photo-o" class="modal-icon" @click="triggerImageUpload" />
        </div>
        <div 
          class="send-btn" 
          :class="{ active: commentText.length > 0 || selectedImage }"
          @click="handleSend"
        >
          发送
        </div>
      </div>

      <div class="emoji-row-scroll">
        <div 
          v-for="(emoji, index) in emojis" 
          :key="index" 
          class="emoji-item"
          @click="handleEmojiClick(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>
  </van-popup>
</template>

<style scoped lang="scss">
.douyin-comment-popup {
  height: 75vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.comment-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

/* 顶部搜索条 */
.panel-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  
  .search-label {
    color: #666;
  }
  
  .search-keyword {
    color: #4b89ac;
    margin: 0 4px;
  }
  
  .search-icon {
    font-size: 14px;
    color: #4b89ac;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 12px;
  
  .action-btn {
    font-size: 20px;
    color: #333;
    cursor: pointer;
  }
}

/* 评论标题 */
.comment-count-title {
  text-align: center;
  font-size: 13px;
  color: #333;
  font-weight: 500;
  padding: 4px 0 12px;
}

/* 评论列表 */
.comment-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;

  .reply-name {
    color: #999;
    font-weight: 500;
  }

  .comment-image-preview {
    margin-top: 8px;
    width: 120px;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      display: block;
    }
  }

  .replies-list {
    margin-top: 4px;
    
    .reply-item {
      padding: 8px 0;
      
      .reply-avatar {
        width: 24px;
        height: 24px;
        margin-right: 8px;
      }
      
      .cmt-content {
        font-size: 14px;
      }
    }
  }
}

.comment-item {
  display: flex;
  padding: 12px 0;
  
  .cmt-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    margin-right: 12px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .cmt-main {
    flex: 1;
    min-width: 0;
    
    .cmt-user-name {
      font-size: 13px;
      color: #999;
      margin-bottom: 4px;
    }
    
    .cmt-content {
      font-size: 15px;
      color: #111;
      line-height: 1.4;
      margin-bottom: 6px;
      word-break: break-all;
      
      .first-tag {
        display: inline-block;
        font-size: 10px;
        background: #fff0f3;
        color: #ff2c55;
        padding: 0 4px;
        border-radius: 2px;
        margin-left: 4px;
        vertical-align: middle;
        transform: translateY(-1px);
      }
    }
    
    .cmt-footer {
      font-size: 13px;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
      
      .footer-left {
        display: flex;
        align-items: center;
      }
      
      .cmt-dot {
        margin: 0 4px;
      }
      
      .cmt-reply {
        margin-left: 12px;
        font-weight: 500;
        color: #666;
      }
    }
  }
}

.cmt-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .action-item {
    display: flex;
    align-items: center;
    color: #999;
    
    .van-icon {
      font-size: 20px;
    }
    
    .count {
      font-size: 12px;
      margin-left: 2px;
    }
    
    &.active {
      color: #ff2c55;
    }

    &.dislike-item {
      &.active {
        color: #ff2c55;
      }
      .dislike-icon {
        font-size: 18px;
      }
    }
  }
}

.no-more {
  text-align: center;
  font-size: 13px;
  color: #999;
  padding: 24px 0 40px;
}

/* 底部输入框 */
.panel-footer {
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 0.5px solid #f2f2f2;
  box-sizing: border-box;
}

.input-container {
  height: 40px;
  background: #f8f8f8;
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  width: 100%;
  box-sizing: border-box;

  .fake-input {
    flex: 1;
    font-size: 14px;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .input-icons {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #333;
    
    .footer-icon {
      font-size: 22px;
    }
    
    .at-icon {
      font-size: 20px;
      font-weight: 500;
    }
  }
}

/* 评论输入弹窗样式 */
.comment-input-popup {
  background: #fff;
  border-radius: 12px 12px 0 0;
}

.input-modal-content {
  padding: 12px 16px env(safe-area-inset-bottom);
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;

  .reply-hint {
    font-size: 13px;
    color: #666;
    margin-bottom: 8px;
    .reply-user {
      color: #333;
      font-weight: 500;
    }
  }

  .image-preview-box {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 12px;
    border-radius: 8px;
    overflow: hidden;

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .close-preview {
      position: absolute;
      right: 4px;
      top: 4px;
      width: 18px;
      height: 18px;
      background: rgba(0,0,0,0.5);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
  }
}

.input-area-wrapper {
  position: relative;
  background: #f8f8f8;
  border-radius: 12px;
  padding: 12px 14px;
  min-height: 90px;
  display: flex;
  
  .real-textarea {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 15px;
    line-height: 1.6;
    color: #111;
    resize: none;
    padding: 0;
    outline: none;
    
    &::placeholder {
      color: #999;
    }
  }

  .cursor-mock {
    position: absolute;
    left: 14px;
    top: 14px;
    width: 2px;
    height: 18px;
    background: #ff2c55;
    animation: blink 1s step-end infinite;
  }
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}

.input-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 0 4px;
}

.footer-left-icons {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #333;

  .modal-icon {
    font-size: 24px;
  }

  .modal-at-icon {
    font-size: 22px;
    font-weight: 500;
  }
}

.send-btn {
  width: 60px;
  height: 30px;
  background: #f1f1f1;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #bfbfbf;
  font-weight: 500;
  transition: all 0.2s;

  &.active {
    background: #ff2c55;
    color: #fff;
  }
}

.emoji-row-scroll {
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  padding: 16px 4px 8px;
  
  &::-webkit-scrollbar {
    display: none;
  }

  .emoji-item {
    font-size: 24px;
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.1s;

    &:active {
      transform: scale(1.2);
    }
  }
}
</style>