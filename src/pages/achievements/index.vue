<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <view class="container">
    <!-- 进度总览 -->
    <view class="card stats-card">
      <text class="card-title">🏅 成就进度</text>
      <text class="card-subtitle">
        {{ userStore.unlockedAchievements.length }} / {{ userStore.achievements.length }} 已解锁
      </text>
      <view class="progress-bar">
        <view
          class="progress-fill"
          :style="{ width: (userStore.unlockedAchievements.length / userStore.achievements.length * 100) + '%' }"
        />
      </view>
    </view>

    <!-- 成就列表 -->
    <view class="achievement-list">
      <view
        v-for="a in userStore.achievements"
        :key="a.id"
        class="card achievement-item"
        :class="{ unlocked: a.unlocked }"
      >
        <view class="achievement-icon">{{ a.icon }}</view>
        <view class="achievement-info">
          <text class="achievement-name">{{ a.name }}</text>
          <text class="achievement-desc">{{ a.description }}</text>
          <text class="achievement-time" v-if="a.unlocked && a.unlockedTime">
            {{ new Date(a.unlockedTime).toLocaleDateString() }} 解锁
          </text>
        </view>
        <view class="achievement-status">
          <text v-if="a.unlocked" class="status-done">✅</text>
          <text v-else class="status-locked">🔒</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.stats-card {
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1D1D1F;
  display: block;
}

.card-subtitle {
  display: block;
  font-size: 24rpx;
  color: #86868B;
  margin-top: 8rpx;
  margin-bottom: 20rpx;
}

.progress-bar {
  height: 8rpx;
  background: #F2F2F7;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  border-radius: 4rpx;
  transition: width 0.5s ease;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 32rpx;

  &.unlocked {
    .achievement-icon,
    .achievement-name {
      opacity: 0.4;
    }
  }
}

.achievement-icon {
  font-size: 48rpx;
  width: 72rpx;
  text-align: center;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #1D1D1F;
  margin-bottom: 4rpx;
}

.achievement-desc {
  display: block;
  font-size: 24rpx;
  color: #86868B;
}

.achievement-time {
  display: block;
  font-size: 22rpx;
  color: #34C759;
  margin-top: 6rpx;
}

.achievement-status {
  flex-shrink: 0;
  font-size: 36rpx;
}

.status-locked {
  opacity: 0.3;
}
</style>
