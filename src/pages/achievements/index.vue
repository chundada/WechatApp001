<template>
  <view class="page">
    <view class="header-card card">
      <view class="header-content">
        <text class="header-icon">🏅</text>
        <view class="header-text">
          <text class="header-title">我的成就</text>
          <text class="header-subtitle">{{ unlockedCount }}/{{ userStore.achievements.length }} 已解锁</text>
        </view>
      </view>
      <view class="progress-bar-wrapper">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: (unlockedCount / userStore.achievements.length * 100) + '%' }"></view>
        </view>
      </view>
    </view>

    <view class="achievements-grid">
      <view 
        class="achievement-card card"
        v-for="achievement in userStore.achievements"
        :key="achievement.id"
        :class="{ unlocked: achievement.unlocked, locked: !achievement.unlocked }"
      >
        <view class="achievement-icon-wrapper">
          <text class="achievement-icon">{{ achievement.icon }}</text>
          <view class="lock-icon" v-if="!achievement.unlocked">🔒</view>
        </view>
        <text class="achievement-name">{{ achievement.name }}</text>
        <text class="achievement-desc">{{ achievement.description }}</text>
        <text class="achievement-status" v-if="achievement.unlocked">
          {{ formatDate(achievement.unlockedTime) }} 解锁
        </text>
        <text class="achievement-status locked-text" v-else>
          未解锁</text>
      </view>
    </view>

    <view class="tips-card card">
      <text class="tips-icon">💡</text>
      <text class="tips-title">成就提示</text>
      <view class="tips-list">
        <text class="tip-item">坚持每天打卡可解锁连续打卡成就</text>
        <text class="tip-item">累计减重达到一定数量可解锁减重成就</text>
        <text class="tip-item">达到目标体重即可解锁终极成就</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const unlockedCount = computed(() => {
  return userStore.achievements.filter(a => a.unlocked).length
})

function formatDate(timestamp?: number) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style lang="scss" scoped>
@import '@/styles/global.scss';

.page {
  min-height: 100vh;
  background: $apple-dark-gray;
  padding: 32rpx;
}

.header-card {
  background: linear-gradient(135deg, $apple-purple 0%, $apple-blue 100%);
  color: #fff;
  margin-bottom: 32rpx;
  border-radius: 32rpx;
  box-shadow: 
    0 8rpx 32rpx rgba(175, 82, 222, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  
  .header-icon {
    font-size: 56rpx;
    margin-right: 20rpx;
  }
  
  .header-text {
    .header-title {
      font-size: 36rpx;
      font-weight: 700;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .header-subtitle {
      font-size: 26rpx;
      opacity: 0.8;
    }
  }
}

.progress-bar-wrapper {
  .progress-bar {
    height: 8rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4rpx;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: #fff;
    border-radius: 4rpx;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.achievement-card {
  padding: 28rpx;
  text-align: center;
  position: relative;
  
  &.unlocked {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 142, 83, 0.15));
    border: 2rpx solid rgba(255, 107, 107, 0.3);
  }
  
  &.locked {
    background: $apple-light-gray;
    opacity: 0.5;
    border: 1rpx solid $apple-border;
  }
}

.achievement-icon-wrapper {
  position: relative;
  width: 96rpx;
  height: 96rpx;
  margin: 0 auto 20rpx;
  
  .achievement-icon {
    font-size: 56rpx;
  }
  
  .lock-icon {
    position: absolute;
    bottom: -4rpx;
    right: -4rpx;
    font-size: 24rpx;
  }
}

.achievement-name {
  font-size: 30rpx;
  font-weight: 700;
  color: $apple-text;
  display: block;
  margin-bottom: 12rpx;
}

.achievement-desc {
  font-size: 24rpx;
  color: $apple-text-muted;
  display: block;
  margin-bottom: 16rpx;
}

.achievement-status {
  font-size: 22rpx;
  color: $apple-green;
  
  &.locked-text {
    color: $apple-text-muted;
  }
}

.tips-card {
  background: rgba(255, 149, 0, 0.1);
  border: 2rpx solid rgba(255, 149, 0, 0.2);
  
  .tips-icon {
    font-size: 36rpx;
    margin-right: 16rpx;
  }
  
  .tips-title {
    font-size: 30rpx;
    font-weight: 700;
    color: $apple-text;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .tips-list {
    .tip-item {
      font-size: 26rpx;
      color: $apple-text-secondary;
      line-height: 1.8;
      display: block;
    }
  }
}
</style>