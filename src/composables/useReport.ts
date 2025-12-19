import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useReport() {
  const isVisible = ref(false)
  const reportType = ref<'post' | 'comment'>('post')
  const targetId = ref<string | number | undefined>(undefined)

  const openReport = (type: 'post' | 'comment' = 'post', id?: string | number) => {
    reportType.value = type
    targetId.value = id
    isVisible.value = true
  }

  const closeReport = () => {
    isVisible.value = false
  }

  const onReportSubmit = (data: any) => {
    console.log('[Report Service] Submitting report:', data)
    ElMessage.success('举报已提交，平台将尽快审核')
    closeReport()
  }

  return {
    isVisible,
    reportType,
    targetId,
    openReport,
    closeReport,
    onReportSubmit
  }
}
