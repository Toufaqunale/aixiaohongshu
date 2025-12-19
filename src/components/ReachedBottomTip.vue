<template>
  <div class="reached-bottom-tip">
    <span class="tip-text">没有更多了，休息一下吧 ~</span>
    <van-icon name="smile-comment-o" class="tip-icon" />
  </div>
</template>

<script setup lang="ts">
/**
 * ReachedBottomTip Component
 * Displayed at the end of the content to indicate no more items.
 */
defineOptions({
  name: 'ReachedBottomTip'
});
</script>

<style scoped lang="scss">
.reached-bottom-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
  color: #999;
  font-size: 12px;
  gap: 4px;

  .tip-icon {
    font-size: 14px;
  }
}
</style>
