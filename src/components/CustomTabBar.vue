<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: string
}>()

const emit = defineEmits<{
  switch: [page: string]
}>()

const tabs = [
  { page: 'pages/index/index', label: '首页', icon: '🏠' },
  { page: 'pages/record/index', label: '记录', icon: '⚖️' },
  { page: 'pages/friends/index', label: '好友', icon: '👥' },
  { page: 'pages/profile/index', label: '我的', icon: '👤' },
]

function switchTab(page: string) {
  if (page === props.current) return
  uni.switchTab({ url: '/' + page })
}
</script>

<template>
  <view class="tabbar">
    <view
      v-for="tab in tabs"
      :key="tab.page"
      class="tabbar-item"
      :class="{ active: current === tab.page }"
      @click="switchTab(tab.page)"
    >
      <text class="tabbar-icon">{{ tab.icon }}</text>
      <text class="tabbar-label">{{ tab.label }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(0, 0, 0, 0.1);
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(100rpx + env(safe-area-inset-bottom));
  z-index: 999;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  padding-top: 8rpx;
}

.tabbar-icon {
  font-size: 40rpx;
  line-height: 1;
}

.tabbar-label {
  font-size: 20rpx;
  color: #86868B;
  transition: color 0.2s;
}

.tabbar-item.active .tabbar-label {
  color: #007AFF;
  font-weight: 500;
}
</style>
