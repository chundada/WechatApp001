<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useFriendsStore } from '@/stores/friends'
import CustomTabBar from '@/components/CustomTabBar.vue'

const userStore = useUserStore()
const friendsStore = useFriendsStore()

function navigateTo(path: string) {
  uni.navigateTo({ url: path })
}

function quickRecord() {
  uni.showModal({
    title: '快速记录',
    editable: true,
    placeholderText: '输入今日体重(kg)',
    success(res) {
      if (res.confirm && res.content) {
        const weight = parseFloat(res.content)
        if (!isNaN(weight) && weight > 0) {
          userStore.addWeightRecord(weight)
          uni.showToast({ title: '记录成功', icon: 'success' })
        } else {
          uni.showToast({ title: '请输入有效体重', icon: 'error' })
        }
      }
    }
  })
}
</script>

<template>
  <view class="container">
    <!-- 顶部欢迎卡片 -->
    <view class="hero-card">
      <view class="hero-bg"></view>
      <view class="hero-content">
        <text class="hero-greeting">
          {{ userStore.streakDays > 0 ? '已坚持' + userStore.streakDays + '天' : '欢迎回来' }}
        </text>
        <text class="hero-title">瘦身搭档</text>
        <view class="hero-stats">
          <view class="hero-stat">
            <text class="hero-stat-value">{{ userStore.userInfo.currentWeight || '--' }}</text>
            <text class="hero-stat-label">当前体重 kg</text>
          </view>
          <view class="hero-stat-divider"></view>
          <view class="hero-stat">
            <text class="hero-stat-value">{{ userStore.totalWeightLost }}</text>
            <text class="hero-stat-label">已减 kg</text>
          </view>
          <view class="hero-stat-divider"></view>
          <view class="hero-stat">
            <text class="hero-stat-value">{{ userStore.remainingWeight }}</text>
            <text class="hero-stat-label">距目标 kg</text>
          </view>
        </view>
        <!-- 进度条 -->
        <view class="progress-section" v-if="userStore.userInfo.targetWeight > 0">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: userStore.progress + '%' }"></view>
          </view>
          <text class="progress-text">目标完成 {{ userStore.progress }}%</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-btn" @click="quickRecord">
        <view class="action-icon-wrap">
          <text class="action-icon">⚖️</text>
        </view>
        <text class="action-label">快速记录</text>
      </view>
      <view class="action-btn" @click="navigateTo('/pages/chart/index')">
        <view class="action-icon-wrap">
          <text class="action-icon">📊</text>
        </view>
        <text class="action-label">数据统计</text>
      </view>
      <view class="action-btn" @click="navigateTo('/pages/friends/index')">
        <view class="action-icon-wrap">
          <text class="action-icon">👥</text>
        </view>
        <text class="action-label">好友排行</text>
      </view>
      <view class="action-btn" @click="navigateTo('/pages/friends/index')">
        <view class="action-icon-wrap">
          <text class="action-icon">👥</text>
        </view>
        <text class="action-label">好友群组</text>
      </view>
    </view>

    <!-- 今日状态卡片 -->
    <view class="card">
      <text class="card-title">📋 今日状态</text>
      <view class="status-grid">
        <view class="status-item">
          <text class="status-value">{{ userStore.bmi }}</text>
          <text class="status-label">BMI</text>
        </view>
        <view class="status-item">
          <text class="status-value">{{ userStore.streakDays }}天</text>
          <text class="status-label">连续打卡</text>
        </view>
        <view class="status-item">
          <text class="status-value">{{ userStore.weightRecords.length }}次</text>
          <text class="status-label">总记录</text>
        </view>
        <view class="status-item">
          <text class="status-value">{{ userStore.unlockedAchievements.length }}/6</text>
          <text class="status-label">成就解锁</text>
        </view>
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="card" v-if="userStore.weightRecords.length > 0">
      <text class="card-title">📝 最近记录</text>
      <view class="record-list">
        <view
          class="record-item"
          v-for="record in userStore.weightRecords.slice(-5).reverse()"
          :key="record.id"
        >
          <text class="record-date">{{ record.date }}</text>
          <text class="record-weight">{{ record.weight }} kg</text>
          <text class="record-note" v-if="record.note">{{ record.note }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="card empty-state" v-else>
      <text class="empty-icon">📋</text>
      <text class="empty-text">还没有体重记录</text>
      <text class="empty-hint">点击上方「快速记录」开始吧</text>
    </view>
  </view>
  <CustomTabBar current="pages/index/index" />
</template>

<style lang="scss" scoped>
$blue: #007AFF;
$cyan: #5AC8FA;

.hero-card {
  position: relative;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, $blue, $cyan);
}

.hero-content {
  position: relative;
  padding: 48rpx 36rpx;
  color: #FFFFFF;
}

.hero-greeting {
  font-size: 26rpx;
  opacity: 0.8;
}

.hero-title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  margin-top: 8rpx;
}

.hero-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 36rpx;
}

.hero-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-stat-value {
  font-size: 40rpx;
  font-weight: 700;
}

.hero-stat-label {
  font-size: 22rpx;
  opacity: 0.7;
  margin-top: 4rpx;
}

.hero-stat-divider {
  width: 2rpx;
  background: rgba(255, 255, 255, 0.3);
  align-self: stretch;
}

.progress-section {
  margin-top: 28rpx;
}

.progress-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #FFFFFF;
  border-radius: 4rpx;
  transition: width 0.5s ease;
}

.progress-text {
  display: block;
  font-size: 22rpx;
  opacity: 0.8;
  margin-top: 8rpx;
  text-align: right;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 16rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  width: 23%;

  &:active {
    background: #F2F2F7;
    transform: scale(0.96);
  }
}

.action-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: #F2F2F7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  font-size: 36rpx;
}

.action-label {
  font-size: 22rpx;
  color: #1D1D1F;
  margin-top: 8rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1D1D1F;
  display: block;
  margin-bottom: 24rpx;
}

.status-grid {
  display: flex;
  justify-content: space-between;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.status-value {
  font-size: 36rpx;
  font-weight: 700;
  color: $blue;
}

.status-label {
  font-size: 22rpx;
  color: #86868B;
  margin-top: 6rpx;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #F2F2F7;

  &:last-child {
    border-bottom: none;
  }
}

.record-date {
  color: #86868B;
  font-size: 26rpx;
  width: 160rpx;
}

.record-weight {
  font-size: 32rpx;
  font-weight: 600;
  color: #1D1D1F;
  flex: 1;
}

.record-note {
  color: #AEAEB2;
  font-size: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 0;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #1D1D1F;
  font-weight: 500;
}

.empty-hint {
  font-size: 24rpx;
  color: #AEAEB2;
  margin-top: 8rpx;
}
.page-content { padding-bottom: 120rpx; }
</style>
