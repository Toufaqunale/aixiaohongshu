<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'back'])

const selectedId = ref<number | null>(null)
const currentStep = ref(1)
const detailText = ref('')
const selectedSubId = ref<number | null>(null)
const selectedRole = ref<'principal' | 'other'>('principal')
const isAIGenerated = ref<boolean | null>(null)
const showInfringementType = ref(false)
const selectedInfringementType = ref('')
const infringementStep = ref(1)
const selectedInfringementDetailType = ref<string | null>(null)
const isSubmitted = ref(false)

// 抄袭举报相关状态
const copyPlatform = ref<'douyin' | 'other'>('douyin')
const showOriginalPicker = ref(false)
const originalPickerTab = ref<'mine' | 'others'>('mine')
const selectedOriginalWork = ref<string | null>(null)
const otherPlatformLink = ref('')

// 图片上传相关
const uploadedImages = ref<string[]>([])
const identityImages = ref<{front: string, back: string}>({ front: '', back: '' })
const proofImages = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const activeUploadType = ref<'general' | 'identity-front' | 'identity-back' | 'proof'>('general')

const triggerUpload = (type: 'general' | 'identity-front' | 'identity-back' | 'proof') => {
  activeUploadType.value = type
  fileInputRef.value?.click()
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  const file = files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const result = event.target?.result as string
    if (activeUploadType.value === 'general') {
      if (uploadedImages.value.length < 4) {
        uploadedImages.value.push(result)
      }
    } else if (activeUploadType.value === 'identity-front') {
      identityImages.value.front = result
    } else if (activeUploadType.value === 'identity-back') {
      identityImages.value.back = result
    } else if (activeUploadType.value === 'proof') {
      if (proofImages.value.length < 4) {
        proofImages.value.push(result)
      }
    }
  }
  reader.readAsDataURL(file)
  // 重置 input 以后便再次选择同一张图
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const removeImage = (type: 'general' | 'proof', index: number) => {
  if (type === 'general') {
    uploadedImages.value.splice(index, 1)
  } else {
    proofImages.value.splice(index, 1)
  }
}

// 成功界面逻辑
const isBlocked = ref(false)
const handleBlockAuthor = () => {
  isBlocked.value = true
  ElMessage.success('已拉黑作者，将不再为您推荐该作者的内容')
}

const handleSafetyCenter = () => {
  ElMessage.info('正在跳转至安全中心...')
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  const seed = Math.floor(Math.random() * 1000)
  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

const infringementTypes = [
  { text: '曝光肖像', value: '曝光肖像' },
  { text: '泄露隐私', value: '泄露隐私' },
  { text: '冒充身份', value: '冒充身份' },
  { text: '著作权侵权', value: '著作权侵权' },
  { text: '商标权侵权', value: '商标权侵权' }
]

const onConfirmType = ({ selectedOptions }: any) => {
  selectedInfringementType.value = selectedOptions[0].text
  showInfringementType.value = false
}

interface ReportType {
  id: number
  title: string
  desc: string
  subTypes?: string[]
}

const reportTypes = ref<ReportType[]>([
  { id: 1, title: '我不喜欢', desc: '作品内容质量差，我不感兴趣。', subTypes: ['内容单调', '画质模糊', '音频嘈杂', '不感兴趣'] },
  { id: 2, title: '侵犯权益', desc: '作品涉嫌侵害他人合法权益（包括肖像权、隐私权、名誉权等人身权益或者著作权、商标权、专利权等知识产权）', subTypes: ['侵犯肖像权', '侵犯隐私权', '侵犯名誉权', '著作权侵权', '商标权侵权'] },
  { id: 3, title: '搬运、抄袭作品', desc: '作品涉及搬运他人原创内容或抄袭他人作品。', subTypes: ['搬运作品', '抄袭作品', '洗稿', '冒充原作者'] },
  { id: 4, title: '色情低俗', desc: '作品包含淫秽色情、低俗趣味或性暗示内容。', subTypes: ['色情暴露', '性暗示', '招嫖信息', '低俗表演'] },
  { id: 5, title: '违法犯罪', desc: '作品中可能含有管制枪械、刀具、毒品，等违禁品，或涉嫌诈骗、赌博、侵害野生动植物的相关内容。', subTypes: ['违禁品', '涉嫌欺诈', '涉嫌赌博', '推广作弊软件', '宣传游戏私服', '其他违规'] },
  { id: 6, title: '政治敏感', desc: '作品包含损害国家形象、危害国家安全或不当政治言论。', subTypes: ['损害国家形象', '不当言论', '违规政治信息', '危害国家安全'] },
  { id: 7, title: '违规营销', desc: '作品包含虚假宣传、诱导关注或违规广告推广。', subTypes: ['虚假广告', '诱导关注', '违规推广', '垃圾营销'] },
  { id: 8, title: '不实信息', desc: '作品包含造谣传谣、误导公众或伪造事实内容。', subTypes: ['造谣传谣', '误导公众', '伪造事实', '旧闻重发'] },
  { id: 9, title: '网络暴力', desc: '作品包含谩骂攻击、人肉搜索或恶意诋毁他人。', subTypes: ['谩骂攻击', '人肉搜索', '恶意诋毁', '骚扰他人'] },
  { id: 10, title: '危害人身安全', desc: '作品包含宣扬自残、自杀或鼓励危险行为内容。', subTypes: ['宣扬自残', '宣扬自杀', '鼓励危险行为', '暴力血腥'] },
  { id: 11, title: '未成年相关', desc: '作品包含危害未成年人身心健康、诱导未成年人不良行为内容。', subTypes: ['危害身心健康', '诱导不良行为', '儿童色情', '校园霸凌'] },
  { id: 12, title: '以上没有我要的类型', desc: '如果上述类型都无法涵盖您要举报的内容，请选择此项。', subTypes: ['其他内容', '无法描述'] },
])

const selectedReport = computed(() => {
  return reportTypes.value.find(item => item.id === selectedId.value)
})

const close = () => {
  emit('update:visible', false)
  selectedId.value = null
  currentStep.value = 1
  detailText.value = ''
  selectedSubId.value = null
  isSubmitted.value = false
  infringementStep.value = 1
  selectedInfringementDetailType.value = null
}

const handleBack = () => {
  if (isSubmitted.value) {
    close()
    return
  }
  if (showOriginalPicker.value) {
    showOriginalPicker.value = false
    return
  }
  if (currentStep.value === 4) {
    if (selectedId.value === 3) {
      currentStep.value = 1
    } else {
      currentStep.value = 2
    }
    return
  }
  if (currentStep.value === 3) {
    if (infringementStep.value === 1) {
      currentStep.value = 2
    } else {
      infringementStep.value--
    }
  } else if (currentStep.value === 2) {
    currentStep.value = 1
  } else {
    emit('back')
  }
}

const handleNext = () => {
  if (selectedId.value === 3) { // 搬运、抄袭作品
    currentStep.value = 4
  } else if (selectedId.value !== null) {
    currentStep.value = 2
  }
}

const handleSubmit = () => {
  if (currentStep.value === 4) {
    isSubmitted.value = true
    return
  }
  if (selectedId.value === 2 && selectedRole.value === 'principal') {
    if (currentStep.value === 2) {
      currentStep.value = 3
      infringementStep.value = 1
    } else if (currentStep.value === 3) {
      if (infringementStep.value < 3) {
        infringementStep.value++
      } else {
        isSubmitted.value = true
      }
    }
    return
  }
  
  if (selectedSubId.value !== null || (selectedId.value === 2 && selectedRole.value === 'other' && isAIGenerated.value !== null)) {
    isSubmitted.value = true
  }
}
</script>

<template>
  <van-popup
    :show="props.visible"
    position="right"
    :style="{ width: '100%', height: '100%' }"
    class="douyin-report-popup"
  >
    <div class="report-panel">
      <!-- 隐藏的文件上传 input -->
      <input 
        type="file" 
        ref="fileInputRef" 
        style="display: none" 
        accept="image/*"
        @change="handleFileChange"
      >
      <div class="report-header">
        <div class="back-btn" @click="handleBack">
          <van-icon name="arrow-left" />
        </div>
        <span class="title">视频举报</span>
        <div class="placeholder"></div>
      </div>

      <div class="report-content" :class="{ 'bg-light': currentStep === 3 || isSubmitted }">
        <!-- 提交成功界面 -->
        <div v-if="isSubmitted" class="submit-success">
          <div class="success-status">
            <div class="success-icon-wrapper">
              <van-icon name="success" class="success-icon" />
            </div>
            <h2 class="success-title">已经帮您减少此类内容的推荐</h2>
            <p class="success-subtitle">感谢您对社区安全做的贡献！</p>
          </div>

          <div class="success-card" @click="handleSafetyCenter">
            <div class="card-header">
              <h3 class="card-title">进度查询</h3>
              <p class="card-desc">我们将在第一时间通过站内信通知您受理结果，您也可以在安全中心「我的举报」查询最新的举报进度</p>
            </div>
            <div class="card-footer">
              <div class="footer-left">
                <div class="safety-icon">
                  <van-icon name="shield-o" />
                </div>
                <span class="footer-text">安全中心</span>
              </div>
              <div class="footer-right">
                <span class="click-enter">点击进入</span>
                <van-icon name="arrow" />
              </div>
            </div>
          </div>

          <div class="success-card">
            <div class="card-header">
              <h3 class="card-title">同时你可以</h3>
            </div>
            <div class="author-item">
              <div class="author-info">
                <div class="author-avatar">
                  <img src="https://p3-pc.byteimg.com/tos-cn-i-uz8utp1n8u/9936894c264245648f57f6a8e561a067.jpeg~tplv-uz8utp1n8u-resize:80:80.webp" alt="avatar" @error="handleAvatarError" />
                </div>
                <span class="author-name">奥特曼</span>
              </div>
              <button 
                class="block-btn" 
                :class="{ blocked: isBlocked }"
                @click="handleBlockAuthor"
              >
                {{ isBlocked ? '已拉黑' : '拉黑作者' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 步骤1：选择大类 -->
        <div v-else-if="currentStep === 1" class="report-list">
          <div 
            v-for="item in reportTypes" 
            :key="item.id" 
            class="report-item"
            :class="{ active: selectedId === item.id }"
            @click="selectedId = item.id"
          >
            <div class="item-main">
              <div class="item-left">
                <span class="item-title">{{ item.title }}</span>
                <div v-if="selectedId === item.id && item.desc" class="item-desc">
                  {{ item.desc }}
                </div>
              </div>
              <div class="item-right">
                <div class="radio-btn" :class="{ checked: selectedId === item.id }">
                  <van-icon v-if="selectedId === item.id" name="success" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤2：填写详情 -->
        <div v-else-if="currentStep === 2" class="report-detail">
          <!-- 侵权投诉专用界面 -->
          <div v-if="selectedId === 2">
            <div class="detail-header">
              <h2 class="detail-title">侵权投诉</h2>
              <p class="detail-desc">请选择准确的角色并提交完整资料</p>
            </div>

            <div class="detail-section">
              <h3 class="section-label">你的角色是</h3>
              <div class="role-selection">
                <div 
                  class="role-card" 
                  :class="{ active: selectedRole === 'principal' }"
                  @click="selectedRole = 'principal'"
                >
                  当事人/授权代理人
                  <div v-if="selectedRole === 'principal'" class="select-check">
                    <van-icon name="success" />
                  </div>
                </div>
                <div 
                  class="role-card" 
                  :class="{ active: selectedRole === 'other' }"
                  @click="selectedRole = 'other'"
                >
                  其他
                  <div v-if="selectedRole === 'other'" class="select-check">
                    <van-icon name="success" />
                  </div>
                </div>
              </div>
              
              <p v-if="selectedRole === 'principal'" class="role-helper">
                若被侵犯权益的是你本人、或你代理的亲属/朋友/客户，你可选此选项发起维权
              </p>
              <p v-else class="role-helper">
                若你只是想反馈一个与你无关的侵权问题，你可选此选项。若你需要维权，请选择「当事人/授权代理人」的角色。
              </p>
            </div>

            <!-- 当事人视角 -->
            <div v-if="selectedRole === 'principal'" class="detail-section">
              <div class="info-card">
                <h3 class="info-card-title">材料补充说明</h3>
                <div class="info-list">
                  <div class="info-item">1. 请参考<span class="link">抖音侵权投诉指引</span>提交身份证明、构成侵权的初步证明等材料；</div>
                  <div class="info-item">2. 如发现同一用户的资料及/或多个作品侵权<span class="link">点击投诉</span></div>
                  <div class="info-item">3. 如你在提交过程中发现投诉资料准备不全的，可在退出时提交保存，并在72小时内补全。</div>
                </div>
              </div>
            </div>

            <!-- 其他角色视角 -->
            <div v-else>
              <div class="detail-section">
                <div class="info-card">
                  <h3 class="info-card-title">举报内容</h3>
                  <div class="form-item" @click="showInfringementType = true">
                    <span class="form-label">侵权类型</span>
                    <div class="form-value">
                      <span v-if="selectedInfringementType" class="selected-value">{{ selectedInfringementType }}</span>
                      <span v-else class="placeholder">请选择侵权类型</span>
                      <van-icon name="arrow" />
                    </div>
                  </div>
                  <div class="ai-check">
                    <p class="ai-label">该内容是否可能由AI生成</p>
                    <div class="ai-btns">
                      <div 
                        class="ai-btn" 
                        :class="{ active: isAIGenerated === true }"
                        @click="isAIGenerated = true"
                      >是</div>
                      <div 
                        class="ai-btn" 
                        :class="{ active: isAIGenerated === false }"
                        @click="isAIGenerated = false"
                      >否</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <div class="info-card">
                  <h3 class="info-card-title">举报描述</h3>
                  <div class="textarea-container">
                    <textarea 
                      v-model="detailText"
                      placeholder="请在此输入，你认为被举报内容存在的问题或继续在平台传播可能造成的不良影响。"
                      maxlength="200"
                    ></textarea>
                    <div class="char-count">{{ detailText.length }}/200</div>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <div class="info-card">
                  <h3 class="info-card-title">图片材料提交</h3>
                  <div class="upload-box">
                    <div 
                      v-for="(img, idx) in uploadedImages" 
                      :key="idx" 
                      class="upload-preview-item"
                    >
                      <img :src="img" alt="upload" />
                      <div class="remove-icon" @click="removeImage('general', idx)">
                        <van-icon name="cross" />
                      </div>
                    </div>
                    <div v-if="uploadedImages.length < 4" class="upload-btn" @click="triggerUpload('general')">
                      <van-icon name="plus" />
                      <span class="count">{{ uploadedImages.length }}/4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 其他举报类型通用界面 -->
          <div v-else>
            <div class="detail-header">
              <h2 class="detail-title">{{ selectedReport?.title }}</h2>
              <p class="detail-desc">{{ selectedReport?.desc }}</p>
            </div>

            <div class="detail-section">
              <h3 class="section-label">请选择具体问题</h3>
              <div class="sub-types-grid">
                <div 
                  v-for="(sub, index) in selectedReport?.subTypes" 
                  :key="index"
                  class="sub-type-item"
                  :class="{ active: selectedSubId === index }"
                  @click="selectedSubId = index"
                >
                  {{ sub }}
                  <div v-if="selectedSubId === index" class="select-check">
                    <van-icon name="success" />
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section card-style">
              <h3 class="section-label">举报描述</h3>
              <div class="textarea-container">
                <textarea 
                  v-model="detailText"
                  placeholder="请描述作品中存在的问题，如：涉及哪些受保护的动植物、违法行为或违禁品"
                  maxlength="200"
                ></textarea>
                <div class="char-count">{{ detailText.length }}/200</div>
              </div>
            </div>

            <div class="detail-section card-style">
              <h3 class="section-label">图片材料提交</h3>
              <div class="upload-box">
                <div 
                  v-for="(img, idx) in uploadedImages" 
                  :key="idx" 
                  class="upload-preview-item"
                >
                  <img :src="img" alt="upload" />
                  <div class="remove-icon" @click="removeImage('general', idx)">
                    <van-icon name="cross" />
                  </div>
                </div>
                <div v-if="uploadedImages.length < 4" class="upload-btn" @click="triggerUpload('general')">
                  <van-icon name="plus" />
                  <span class="count">{{ uploadedImages.length }}/4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤3：侵权投诉详情子流程 -->
        <div v-else-if="currentStep === 3" class="infringement-flow">
          <div class="steps-container">
            <div class="step-item" :class="{ active: infringementStep >= 1 }">
              <div class="step-icon">
                <div v-if="infringementStep > 1" class="checked"><van-icon name="success" /></div>
                <div v-else class="num">1</div>
              </div>
              <span class="step-label">投诉类型</span>
            </div>
            <div class="step-line" :class="{ active: infringementStep >= 2 }"></div>
            <div class="step-item" :class="{ active: infringementStep >= 2 }">
              <div class="step-icon">
                <div v-if="infringementStep > 2" class="checked"><van-icon name="success" /></div>
                <div v-else class="num">2</div>
              </div>
              <span class="step-label">身份确认</span>
            </div>
            <div class="step-line" :class="{ active: infringementStep >= 3 }"></div>
            <div class="step-item" :class="{ active: infringementStep >= 3 }">
              <div class="step-icon">
                <div class="num">3</div>
              </div>
              <span class="step-label">材料提交</span>
            </div>
          </div>

          <!-- 第一步：投诉类型选择 -->
          <div v-if="infringementStep === 1" class="complaint-type-content">
            <div class="complaint-section">
              <h4 class="section-title">侵犯个人/组织人身权益</h4>
              <div class="option-list">
                <div 
                  v-for="opt in ['曝光肖像', '泄露隐私', '冒充身份', '损害个人名誉', '损害企业商誉']" 
                  :key="opt"
                  class="option-item"
                  @click="selectedInfringementDetailType = opt"
                >
                  <span class="opt-label">{{ opt }}</span>
                  <div class="radio-circle" :class="{ checked: selectedInfringementDetailType === opt }"></div>
                </div>
              </div>
            </div>

            <div class="complaint-section">
              <h4 class="section-title">侵犯知识产权</h4>
              <div class="option-list">
                <div 
                  v-for="opt in ['搬运、抄袭、洗稿', '假冒商标', '假冒专利']" 
                  :key="opt"
                  class="option-item"
                  @click="selectedInfringementDetailType = opt"
                >
                  <span class="opt-label">{{ opt }}</span>
                  <div class="radio-circle" :class="{ checked: selectedInfringementDetailType === opt }"></div>
                </div>
              </div>
            </div>

            <div class="complaint-section">
              <div class="option-item" @click="selectedInfringementDetailType = '其他'">
                <span class="opt-label">其他</span>
                <div class="radio-circle" :class="{ checked: selectedInfringementDetailType === '其他' }"></div>
              </div>
            </div>
          </div>

          <!-- 第二步：身份确认 -->
          <div v-else-if="infringementStep === 2" class="identity-confirm-content">
            <div class="complaint-section">
              <h4 class="section-title">权利人身份信息</h4>
              <div class="form-group">
                <div class="form-item-row">
                  <span class="label">姓名/名称</span>
                  <input type="text" placeholder="请输入真实姓名或组织名称" />
                </div>
                <div class="form-item-row">
                  <span class="label">证件类型</span>
                  <div class="value">身份证 <van-icon name="arrow" /></div>
                </div>
                <div class="form-item-row">
                  <span class="label">证件号码</span>
                  <input type="text" placeholder="请输入证件号码" />
                </div>
              </div>
            </div>
            
            <div class="complaint-section">
              <h4 class="section-title">证件照片上传</h4>
              <div class="upload-grid">
                <div class="upload-item" @click="triggerUpload('identity-front')">
                  <template v-if="identityImages.front">
                    <img :src="identityImages.front" class="preview-img" />
                    <div class="change-mask">点击更换</div>
                  </template>
                  <template v-else>
                    <div class="upload-plus"><van-icon name="plus" /></div>
                    <span class="upload-label">手持证件正面照</span>
                  </template>
                </div>
                <div class="upload-item" @click="triggerUpload('identity-back')">
                  <template v-if="identityImages.back">
                    <img :src="identityImages.back" class="preview-img" />
                    <div class="change-mask">点击更换</div>
                  </template>
                  <template v-else>
                    <div class="upload-plus"><van-icon name="plus" /></div>
                    <span class="upload-label">证件反面照</span>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 第三步：材料提交 -->
          <div v-else-if="infringementStep === 3" class="material-submit-content">
            <div class="complaint-section">
              <h4 class="section-title">侵权证据说明</h4>
              <div class="textarea-box">
                <textarea placeholder="请详细描述侵权事实，包括但不限于侵权链接、侵权内容描述等..." maxlength="1000"></textarea>
                <div class="limit">0/1000</div>
              </div>
            </div>

            <div class="complaint-section">
              <h4 class="section-title">证明材料上传</h4>
              <div class="upload-grid">
                <div 
                  v-for="(img, idx) in proofImages" 
                  :key="idx" 
                  class="upload-item has-img"
                >
                  <img :src="img" class="preview-img" />
                  <div class="remove-btn" @click.stop="removeImage('proof', idx)">
                    <van-icon name="cross" />
                  </div>
                </div>
                <div v-if="proofImages.length < 4" class="upload-item" @click="triggerUpload('proof')">
                  <div class="upload-plus"><van-icon name="plus" /></div>
                  <span class="upload-label">{{ proofImages.length }}/4</span>
                </div>
              </div>
              <p class="upload-tip">请上传著作权登记证、商标注册证或授权书等有效证明材料</p>
            </div>
          </div>
        </div>

        <!-- 步骤4：抄袭作品举报主界面 -->
        <div v-else-if="currentStep === 4" class="copy-report-flow">
          <!-- 原创作品选择弹窗层 -->
          <div v-if="showOriginalPicker" class="original-picker-overlay">
            <div class="picker-header">
              <div class="back-btn" @click="showOriginalPicker = false">
                <van-icon name="arrow-left" />
              </div>
              <span class="title">原创作品选择</span>
              <div class="placeholder"></div>
            </div>
            <div class="picker-tabs">
              <div 
                class="tab-item" 
                :class="{ active: originalPickerTab === 'mine' }"
                @click="originalPickerTab = 'mine'"
              >我的作品</div>
              <div 
                class="tab-item" 
                :class="{ active: originalPickerTab === 'others' }"
                @click="originalPickerTab = 'others'"
              >他人作品</div>
            </div>
            
            <div class="picker-content">
              <!-- 我的作品 - 空状态 -->
              <div v-if="originalPickerTab === 'mine'" class="empty-state">
                <div class="empty-icon">
                  <van-icon name="play-circle-o" />
                </div>
                <p class="empty-title">暂无作品可勾选</p>
                <p class="empty-desc">为保护你的作品隐私，你仅能选择已对外公开可见的作品。</p>
              </div>

              <!-- 他人作品 - 列表 -->
              <div v-else class="others-list">
                <div class="search-bar">
                  <van-icon name="search" />
                  <input type="text" placeholder="搜索原创作者" />
                </div>
                <div class="following-label">我的关注</div>
                <div class="author-list">
                  <div v-for="(author, idx) in [
                    { name: 'AI控制人类', id: '999', avatar: 'https://p3-pc.byteimg.com/tos-cn-i-uz8utp1n8u/9936894c264245648f57f6a8e561a067.jpeg~tplv-uz8utp1n8u-resize:80:80.webp' },
                    { name: '哥斯拉进击成都', id: 'gesila', avatar: 'https://p3-pc.byteimg.com/tos-cn-i-uz8utp1n8u/9936894c264245648f57f6a8e561a067.jpeg~tplv-uz8utp1n8u-resize:80:80.webp' },
                    { name: '变形金刚奴役人类', id: 'jingang', avatar: 'https://p3-pc.byteimg.com/tos-cn-i-uz8utp1n8u/9936894c264245648f57f6a8e561a067.jpeg~tplv-uz8utp1n8u-resize:80:80.webp' }
                  ]" :key="idx" 
                    class="author-card"
                    :class="{ selected: selectedOriginalWork === author.id }"
                    @click="selectedOriginalWork = author.id"
                  >
                    <div class="author-avatar">
                      <img :src="author.avatar" alt="avatar" />
                    </div>
                    <div class="author-info">
                      <div class="name">{{ author.name }}</div>
                      <div class="id">抖音号：{{ author.id }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="picker-footer">
              <button 
                class="picker-next-btn"
                :class="{ active: selectedOriginalWork !== null }"
                @click="showOriginalPicker = false"
              >下一步</button>
            </div>
          </div>

          <!-- 主界面内容 -->
          <template v-else>
            <div class="complaint-section">
              <h4 class="section-title">要举报的作品是</h4>
              <div class="work-preview">
                <div class="preview-card">
                  <van-icon name="video" />
                </div>
              </div>
            </div>

            <div class="complaint-section">
              <h4 class="section-title">选择被抄袭的原创作品 <span class="required">*</span></h4>
              <div class="platform-switch">
                <div 
                  class="switch-btn" 
                  :class="{ active: copyPlatform === 'douyin' }"
                  @click="copyPlatform = 'douyin'"
                >抖音作品</div>
                <div 
                  class="switch-btn" 
                  :class="{ active: copyPlatform === 'other' }"
                  @click="copyPlatform = 'other'"
                >其他平台作品</div>
              </div>

              <!-- 抖音作品选项 -->
              <div v-if="copyPlatform === 'douyin'" class="original-work-select" @click="showOriginalPicker = true">
                <span class="label">原创作品</span>
                <div class="value">
                  <span class="placeholder">{{ selectedOriginalWork ? '已选择' : '请选择作品' }}</span>
                  <van-icon name="arrow" />
                </div>
              </div>

              <!-- 其他平台作品选项 -->
              <div v-else class="other-platform-input">
                <h5 class="input-title">作品链接</h5>
                <p class="input-helper">请提供<span class="link">可公开访问</span>的原始链接，并确认发布时间<span class="link">早于</span>被举报内容</p>
                <div class="textarea-wrapper">
                  <textarea 
                    v-model="otherPlatformLink"
                    placeholder="请输入或粘贴站外原创作品链接"
                  ></textarea>
                </div>
                <p v-if="otherPlatformLink && !otherPlatformLink.includes('http')" class="error-tip">请提供有效的原始链接信息</p>
              </div>
            </div>

            <div class="complaint-section">
              <h4 class="section-title">权属证明材料</h4>
              <div class="proof-desc">
                <p>1. 如果你是原创作者本人</p>
                <p class="sub">请上传首发作品截图、首发账号个人主页截图</p>
                <p>2. 如果你是原创作者授权的代理人</p>
                <p class="sub">请上传授权书（含授权人签字或盖章）、原创作者首发作品截图、原创作者账号个人主页截图</p>
              </div>
              <div class="upload-grid-container">
                <div 
                  v-for="(img, idx) in proofImages" 
                  :key="idx" 
                  class="upload-box-item"
                >
                  <div class="upload-inner has-img">
                    <img :src="img" alt="proof" />
                    <div class="remove-badge" @click.stop="removeImage('proof', idx)">
                      <van-icon name="cross" />
                    </div>
                  </div>
                </div>
                <div v-if="proofImages.length < 4" class="upload-box-item" @click="triggerUpload('proof')">
                  <div class="upload-inner">
                    <van-icon name="plus" />
                    <span class="upload-text">{{ proofImages.length }}/4</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="complaint-section">
              <h4 class="section-title">其他补充材料</h4>
              <div class="textarea-wrapper simple">
                <textarea placeholder="请详细填写补充描述，以提高反馈成功率" maxlength="200"></textarea>
                <div class="char-count">0/200</div>
              </div>
              <div class="upload-grid-container mini">
                <div 
                  v-for="(img, idx) in uploadedImages" 
                  :key="idx" 
                  class="upload-box-item mini"
                >
                  <div class="upload-inner has-img">
                    <img :src="img" alt="extra" />
                    <div class="remove-badge" @click.stop="removeImage('general', idx)">
                      <van-icon name="cross" />
                    </div>
                  </div>
                </div>
                <div v-if="uploadedImages.length < 4" class="upload-box-item mini" @click="triggerUpload('general')">
                  <div class="upload-inner">
                    <van-icon name="plus" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="report-footer">
        <button 
          v-if="isSubmitted"
          class="next-btn active"
          @click="close"
        >
          完成
        </button>
        <button 
          v-else-if="currentStep === 1"
          class="next-btn" 
          :class="{ active: selectedId !== null }"
          @click="handleNext"
        >
          下一步
        </button>
        <button 
          v-else
          class="next-btn" 
          :class="{ 
            active: (selectedId === 2 && selectedRole === 'principal') || 
                   (selectedId === 2 && selectedRole === 'other' && isAIGenerated !== null && selectedInfringementType !== '') || 
                   (selectedId !== 2 && selectedId !== 3 && selectedSubId !== null) || 
                   (selectedId === 3 && selectedSubId !== null && currentStep !== 4) ||
                   (currentStep === 4 && ((copyPlatform === 'other' && otherPlatformLink.trim() !== '') || (copyPlatform === 'douyin' && selectedOriginalWork !== null))) ||
                   (currentStep === 3 && selectedInfringementDetailType !== null),
            'infringement-btn': (selectedId === 2 && selectedRole === 'principal') || (selectedId === 3 && selectedSubId === 1 && currentStep !== 4)
          }"
          @click="handleSubmit"
        >
          <template v-if="(selectedId === 2 && selectedRole === 'principal') || (selectedId === 3 && selectedSubId === 1 && currentStep !== 4)">
            {{ (currentStep === 2 && selectedId === 2) ? '下一步，资料提交' : '下一步' }}
          </template>
          <template v-else>提交</template>
        </button>
      </div>
    </div>

    <!-- 侵权类型选择弹窗 -->
    <van-popup
      v-model:show="showInfringementType"
      position="bottom"
      round
      teleport="body"
      class="infringement-picker-popup"
    >
      <van-picker
        :columns="infringementTypes"
        @confirm="onConfirmType"
        @cancel="showInfringementType = false"
        :confirm-button-text="'确认'"
        :cancel-button-text="'取消'"
        :visible-option-num="5"
        :option-height="54"
      />
    </van-popup>
  </van-popup>
</template>

<style scoped lang="scss">
.douyin-report-popup {
  background: #fff;
}

.report-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9f9f9;
}

.report-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: #fff;
  border-bottom: 0.5px solid #f2f2f2;
  flex-shrink: 0;
  position: relative;

  .back-btn {
    position: absolute;
    left: 16px;
    font-size: 20px;
    color: #161823;
    display: flex;
    align-items: center;
  }

  .title {
    font-size: 16px;
    font-weight: 500;
    color: #161823;
  }
}

.report-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 32px;
  background: #f8f9fa;

  &.bg-light {
    background: #f4f7fa;
  }

  &::-webkit-scrollbar {
    display: none;
  }
}

/* 侵权流程子步骤样式 */
.infringement-flow {
  .steps-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 10px;
    margin-bottom: 10px;

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;

      .step-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #fff;
        border: 1.5px solid #dcdfe6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #909399;
        transition: all 0.3s;
        position: relative;
        z-index: 2;

        .checked {
          color: #fff;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .step-label {
        font-size: 12px;
        color: #909399;
        transition: all 0.3s;
      }

      &.active {
        .step-icon {
          background: #4080ff;
          border-color: #4080ff;
          color: #fff;
          box-shadow: 0 0 0 4px rgba(64, 128, 255, 0.1);
        }
        .step-label {
          color: #4080ff;
          font-weight: 500;
        }
      }
    }

    .step-line {
      height: 1.5px;
      background: #dcdfe6;
      flex: 1;
      margin: 0 -15px;
      margin-top: -24px;
      transition: all 0.3s;

      &.active {
        background: #4080ff;
      }
    }
  }

  .complaint-section {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      padding-left: 4px;
    }

    .option-list {
      .option-item {
        &:last-child {
          .opt-label {
            border-bottom: none;
          }
        }
      }
    }

    .option-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 4px;
      cursor: pointer;

      .opt-label {
        font-size: 15px;
        color: #333;
        flex: 1;
      }

      .radio-circle {
        width: 20px;
        height: 20px;
        border: 1.5px solid #dcdfe6;
        border-radius: 50%;
        transition: all 0.2s;
        position: relative;

        &.checked {
          border-color: #4080ff;
          background: #4080ff;

          &::after {
            content: '';
            width: 8px;
            height: 4px;
            border-left: 2px solid #fff;
            border-bottom: 2px solid #fff;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -65%) rotate(-45deg);
          }
        }
      }

      &:active {
        background: #f9f9f9;
      }
    }
  }

  .form-group {
    .form-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 0.5px solid #f2f2f2;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-size: 15px;
        color: #333;
        width: 100px;
      }

      input {
        flex: 1;
        border: none;
        text-align: right;
        font-size: 15px;
        color: #333;
        outline: none;

        &::placeholder {
          color: #ccc;
        }
      }

      .value {
        font-size: 15px;
        color: #333;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .upload-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .upload-item {
      aspect-ratio: 16/10;
      background: #f7f8fa;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px dashed #dcdfe6;

      .upload-plus {
        font-size: 24px;
        color: #909399;
      }

      .upload-label {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .textarea-box {
    background: #f7f8fa;
    border-radius: 8px;
    padding: 12px;

    textarea {
      width: 100%;
      height: 120px;
      border: none;
      background: transparent;
      font-size: 14px;
      color: #333;
      resize: none;
      outline: none;
    }

    .limit {
      text-align: right;
      font-size: 12px;
      color: #999;
    }
  }

  .upload-tip {
    font-size: 12px;
    color: #999;
    margin-top: 12px;
    line-height: 1.5;
  }
}

/* 提交成功界面样式 */
.submit-success {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .success-status {
    padding: 30px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .success-icon-wrapper {
      width: 56px;
      height: 56px;
      background: #00c853;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;

      .success-icon {
        font-size: 32px;
        color: #fff;
      }
    }

    .success-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .success-subtitle {
      font-size: 14px;
      color: #999;
    }
  }

  .success-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

    .card-header {
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      .card-desc {
        font-size: 13px;
        color: #999;
        line-height: 1.6;
      }
    }

    .card-footer {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 0.5px solid #f2f2f2;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .footer-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .safety-icon {
          width: 20px;
          height: 20px;
          background: #e8f0ff;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4080ff;
          font-size: 14px;
        }

        .footer-text {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
      }

      .footer-right {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #999;
        font-size: 13px;

        .click-enter {
          margin-right: 2px;
        }
      }
    }
  }

  .author-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;

    .author-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .author-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        background: #f0f0f0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .author-name {
        font-size: 15px;
        color: #333;
        font-weight: 500;
      }
    }

    .block-btn {
      background: #f2f2f2;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      color: #4080ff;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;

      &:active {
        opacity: 0.7;
      }

      &.blocked {
        background: #f8f8f8;
        color: #999;
      }
    }
  }
}

.upload-box {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;

  .upload-preview-item {
    width: 72px;
    height: 72px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-icon {
      position: absolute;
      top: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      padding: 2px;
      border-bottom-left-radius: 8px;
      font-size: 12px;
    }
  }
}

.upload-grid {
  .upload-item {
    position: relative;
    overflow: hidden;

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .change-mask {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      font-size: 10px;
      text-align: center;
      padding: 2px 0;
    }

    .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
  }
}

.upload-grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .upload-box-item {
    width: calc(25% - 6px);
    aspect-ratio: 1;

    &.mini {
      width: 48px;
      height: 48px;
      
      .upload-inner {
        .van-icon {
          font-size: 16px;
          margin-bottom: 0;
        }
      }
    }

    .upload-inner {
      width: 100%;
      height: 100%;
      background: #f7f8fa;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      border: 1px dashed #e0e0e0;
      position: relative;
      overflow: hidden;

      &.has-img {
        border: none;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          padding: 2px;
          border-bottom-left-radius: 4px;
          font-size: 12px;
        }
      }

      .van-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }

      .upload-text {
        font-size: 11px;
      }
    }
  }
}

/* 抄袭举报流程样式 */
.copy-report-flow {
  background: #f8f9fa;
  min-height: calc(100vh - 48px - 80px);
  margin: -12px -16px;
  padding: 12px 16px;

  .complaint-section {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

    .section-title {
      font-size: 15px;
      font-weight: 500;
      color: #161823;
      margin-bottom: 16px;
      padding-left: 0;
      display: flex;
      align-items: center;

      .required {
        color: #fe2c55;
        margin-left: 4px;
        font-size: 14px;
        font-weight: normal;
      }
    }
  }

  .work-preview {
    padding: 0;
    .preview-card {
      width: 72px;
      height: 96px;
      background: #f2f2f2;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #d1d1d1;
      font-size: 32px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .platform-switch {
    display: flex;
    background: #f2f2f2;
    border-radius: 4px;
    padding: 2px;
    margin-bottom: 20px;

    .switch-btn {
      flex: 1;
      height: 32px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #8a8b91;
      transition: all 0.2s;
      background: transparent;

      &.active {
        background: #fff;
        color: #2f54eb;
        font-weight: 500;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
    }
  }

  .original-work-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-top: 0.5px solid #f2f2f2;

    .label {
      font-size: 14px;
      color: #161823;
    }

    .value {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #999;
      font-size: 14px;

      .placeholder {
        color: #bbb;
      }

      .van-icon {
        font-size: 14px;
        color: #bbb;
      }
    }
  }

  .other-platform-input {
    .input-title {
      font-size: 14px;
      color: #161823;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .input-helper {
      font-size: 12px;
      color: #949494;
      line-height: 1.5;
      margin-bottom: 12px;

      .link {
        color: #2f54eb;
      }
    }

    .textarea-wrapper {
      background: #f8f8f8;
      border-radius: 8px;
      padding: 12px;

      textarea {
        width: 100%;
        height: 80px;
        border: none;
        background: transparent;
        font-size: 14px;
        color: #161823;
        resize: none;
        outline: none;

        &::placeholder {
          color: #bbb;
        }
      }
    }

    .error-tip {
      font-size: 12px;
      color: #fe2c55;
      margin-top: 8px;
    }
  }

  .proof-desc {
    margin-bottom: 16px;
    p {
      font-size: 14px;
      color: #161823;
      line-height: 1.6;
      margin-bottom: 4px;

      &.sub {
        color: #8a8b91;
        font-size: 13px;
        margin-bottom: 12px;
      }
    }
  }

  .textarea-wrapper.simple {
    background: #f8f8f8;
    border-radius: 4px;
    padding: 12px;
    position: relative;
    margin-bottom: 12px;

    textarea {
      width: 100%;
      height: 80px;
      border: none;
      background: transparent;
      font-size: 14px;
      color: #161823;
      resize: none;
      outline: none;

      &::placeholder {
        color: #bbb;
      }
    }

    .char-count {
      position: absolute;
      bottom: 8px;
      right: 12px;
      font-size: 12px;
      color: #bbb;
    }
  }

  .upload-grid-container {
    display: flex;
    gap: 8px;
    margin-top: 12px;

    .upload-box-item {
      width: 80px;
      height: 80px;
      background: #f8f8f8;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;

      .upload-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        color: #bbb;

        .van-icon {
          font-size: 24px;
        }

        .upload-text {
          font-size: 12px;
        }
      }
    }
  }
}

.report-footer {
  padding: 16px;
  background: #fff;
  border-top: 0.5px solid #f2f2f2;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;

  .next-btn {
    width: 100%;
    height: 44px;
    border: none;
    border-radius: 8px;
    background: #c8d6ff; // 默认浅蓝色态
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s;

    &.active {
      background: #2f54eb; // 激活态深蓝色
    }

    &:active {
      opacity: 0.8;
    }
  }
}

/* 原创作品选择弹窗样式 */
.original-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f4f7fa;
  z-index: 2000;
  display: flex;
  flex-direction: column;

  .picker-header {
    height: 44px;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 16px;

    .back-btn {
      font-size: 20px;
      color: #333;
    }

    .title {
      flex: 1;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
    }

    .placeholder {
      width: 20px;
    }
  }

  .picker-tabs {
    background: #fff;
    display: flex;
    padding: 0 40px;
    height: 44px;
    align-items: center;
    border-bottom: 0.5px solid #f2f2f2;

    .tab-item {
      flex: 1;
      text-align: center;
      font-size: 15px;
      color: #999;
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.active {
        color: #333;
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: #333;
          border-radius: 1px;
        }
      }
    }
  }

  .picker-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-top: 100px;
      text-align: center;

      .empty-icon {
        width: 64px;
        height: 84px;
        background: #f7f8fa;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #dcdfe6;
        font-size: 32px;
        margin-bottom: 24px;
      }

      .empty-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
      }

      .empty-desc {
        font-size: 13px;
        color: #999;
        padding: 0 40px;
        line-height: 1.6;
      }
    }

    .others-list {
      .search-bar {
        background: #f2f2f2;
        border-radius: 8px;
        height: 36px;
        display: flex;
        align-items: center;
        padding: 0 12px;
        gap: 8px;
        margin-bottom: 20px;

        .van-icon {
          font-size: 16px;
          color: #999;
        }

        input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          outline: none;
        }
      }

      .following-label {
        font-size: 13px;
        color: #999;
        margin-bottom: 12px;
      }

      .author-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .author-card {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          border: 1.5px solid transparent;
          transition: all 0.2s;
          position: relative;

          &.selected {
            border-color: #4080ff;
            background: #f0f7ff;

            &::after {
               content: '\2713';
               position: absolute;
               top: 12px;
               right: 12px;
               width: 18px;
               height: 18px;
               background: #4080ff;
               border-radius: 50%;
               display: flex;
               align-items: center;
               justify-content: center;
               color: #fff;
               font-size: 10px;
               font-weight: bold;
             }
           }

          .author-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            overflow: hidden;
            background: #f0f0f0;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .author-info {
            .name {
              font-size: 15px;
              font-weight: 600;
              color: #333;
              margin-bottom: 4px;
            }
            .id {
              font-size: 13px;
              color: #999;
            }
          }
        }
      }
    }
  }

  .picker-footer {
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    background: #fff;

    .picker-next-btn {
      width: 100%;
      height: 48px;
      background: #a8c5ff;
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.2s;

      &.active {
        background: #4080ff;
      }

      &:active {
        opacity: 0.8;
      }
    }
  }
}

/* 详情页样式 */
.report-detail {
  .detail-header {
    margin-bottom: 24px;
    
    .detail-title {
      font-size: 20px;
      font-weight: 600;
      color: #111;
      margin-bottom: 8px;
    }
    
    .detail-desc {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
  }

  .detail-section {
    margin-bottom: 24px;
    .section-label {
      font-size: 14px;
      color: #999;
      margin-bottom: 12px;
      font-weight: normal;
    }
  }
  .card-style {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .sub-types-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    
    .sub-type-item {
      height: 56px;
      background: #fff;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #333;
      padding: 0 4px;
      text-align: center;
      line-height: 1.3;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
      
      &.active {
        background: #0066ff;
        color: #fff;
        font-weight: 500;
      }
    }
  }

  /* 通用勾选角标 */
  .select-check {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 4px 0 6px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0066ff;
    font-size: 10px;
    font-weight: bold;
    z-index: 1;
  }

  /* 角色选择样式 */
  .role-selection {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;

    .role-card {
      height: 56px;
      background: #fff;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #333;
      position: relative;
      overflow: hidden;
      transition: all 0.2s;
      border: 1px solid transparent;

      &.active {
        background: #0066ff;
        color: #fff;
        font-weight: 500;
      }
    }
  }

  .role-helper {
    font-size: 12px;
    color: #999;
    line-height: 1.5;
    margin-top: 8px;
  }

  /* 信息卡片样式 */
  .info-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;

    .info-card-title {
      font-size: 14px;
      font-weight: 600;
      color: #111;
      margin-bottom: 12px;
    }

    .info-list {
      .info-item {
        font-size: 13px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }

        .link {
          color: #0066ff;
          margin: 0 4px;
        }
      }
    }
  }

  /* 表单项样式 */
  .form-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 0.5px solid #f2f2f2;

    &:last-child {
      border-bottom: none;
    }

    .form-label {
      font-size: 14px;
      color: #333;
    }

    .form-value {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #999;
    font-size: 14px;

    .selected-value {
      color: #111;
    }

    .placeholder {
      color: #ccc;
    }
  }
}

/* 侵权类型选择弹窗样式 - 1:1 抖音风格 */
.infringement-picker-popup {
  :deep(.van-picker) {
    background: #fff;
    
    .van-picker__toolbar {
      height: 54px;
      padding: 0 16px;
      
      .van-picker__cancel {
        font-size: 16px;
        color: #333;
        font-weight: 400;
      }
      
      .van-picker__confirm {
        font-size: 16px;
        color: #fe2c55; /* 抖音红 */
        font-weight: 500;
      }
    }

    .van-picker__columns {
      .van-picker-column {
        .van-picker-column__item {
          font-size: 18px;
          color: #999;
          
          &.van-picker-column__item--selected {
            color: #111;
            font-weight: 600;
          }
        }
      }
    }

    /* 模拟图片中的灰色选中背景框 */
    .van-picker__mask {
      background-image: none;
    }
    
    .van-picker__frame {
      background: #f5f5f5;
      border-radius: 8px;
      left: 12px;
      right: 12px;
      height: 44px;
      top: 50%;
      transform: translateY(-50%);
      z-index: -1;
      border: none;
      
      &::after {
        display: none;
      }
    }
  }
}

/* AI 检查样式 */
  .ai-check {
    margin-top: 16px;
    
    .ai-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 12px;
    }

    .ai-btns {
      display: flex;
      gap: 12px;

      .ai-btn {
        flex: 1;
        height: 40px;
        background: #f5f5f5;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #333;
        transition: all 0.2s;

        &.active {
          background: #0066ff;
          color: #fff;
        }
      }
    }
  }

  .textarea-container {
    background: #f5f5f5;
    border-radius: 4px;
    padding: 12px;
    position: relative;
    
    textarea {
      width: 100%;
      height: 120px;
      border: none;
      background: transparent;
      font-size: 14px;
      color: #333;
      resize: none;
      outline: none;
      
      &::placeholder {
        color: #bbb;
      }
    }
    
    .char-count {
      position: absolute;
      bottom: 12px;
      right: 12px;
      font-size: 12px;
      color: #bbb;
    }
  }

  .upload-box {
    .upload-btn {
      width: 80px;
      height: 80px;
      background: #f5f5f5;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #bbb;
      gap: 4px;
      
      .van-icon {
        font-size: 24px;
      }
      
      .count {
        font-size: 12px;
      }
    }
  }
}

.report-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.report-item {
  padding: 16px;
  border-bottom: 0.5px solid #f2f2f2;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  .item-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .item-left {
    flex: 1;
    padding-right: 12px;
  }

  .item-title {
    font-size: 16px;
    color: #111;
    display: block;
    line-height: 1.4;
  }

  .item-desc {
    font-size: 13px;
    color: #999;
    margin-top: 8px;
    line-height: 1.5;
    overflow: hidden;
  }

  .item-right {
    padding-top: 2px;
  }

  .radio-btn {
    width: 20px;
    height: 20px;
    border: 1.5px solid #ccc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &.checked {
      background: #0066ff;
      border-color: #0066ff;
      color: #fff;
      font-size: 10px;
    }
  }
}

/* 动画效果相关已移除，保持切换顺畅 */
</style>
