<template>
  <view class="page">
    <view class="create-section">
      <view class="create-card card" @click="showCreateModal = true">
        <text class="create-icon">➕</text>
        <text class="create-text">创建新挑战</text>
      </view>
    </view>

    <view class="my-challenges">
      <text class="section-title">我参与的挑战</text>
      <view class="challenge-list">
        <view 
          class="challenge-card card" 
          v-for="competition in friendsStore.joinedCompetitions" 
          :key="competition.id"
        >
          <view class="challenge-header">
            <text class="challenge-name">{{ competition.name }}</text>
            <view class="challenge-status ongoing">进行中</view>
          </view>
          <text class="challenge-desc">{{ competition.description }}</text>
          <view class="challenge-meta">
            <view class="meta-item">
              <text class="meta-icon">📅</text>
              <text class="meta-text">{{ formatDate(competition.startDate) }} - {{ formatDate(competition.endDate) }}</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">👥</text>
              <text class="meta-text">{{ competition.participants.length }}人参与</text>
            </view>
          </view>
          <view class="challenge-progress">
            <view class="progress-info">
              <text class="progress-label">我的进度</text>
              <text class="progress-value">{{ userStore.progress }}%</text>
            </view>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: userStore.progress + '%' }"></view>
            </view>
          </view>
          <view class="challenge-action">
            <button class="action-btn btn-secondary">查看详情</button>
            <button class="action-btn btn-primary">邀请好友</button>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="friendsStore.joinedCompetitions.length === 0">
        <text class="empty-icon">🏃</text>
        <text class="empty-text">还没有参与任何挑战</text>
        <text class="empty-hint">创建或加入一个挑战，和好友一起减肥吧！</text>
      </view>
    </view>

    <view class="all-challenges">
      <text class="section-title">热门挑战</text>
      <view class="challenge-list">
        <view 
          class="challenge-card card" 
          v-for="competition in availableCompetitions" 
          :key="competition.id"
        >
          <view class="challenge-header">
            <text class="challenge-name">{{ competition.name }}</text>
            <view class="challenge-status ongoing">进行中</view>
          </view>
          <text class="challenge-desc">{{ competition.description }}</text>
          <view class="challenge-meta">
            <view class="meta-item">
              <text class="meta-icon">📅</text>
              <text class="meta-text">{{ formatDate(competition.startDate) }} - {{ formatDate(competition.endDate) }}</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">👥</text>
              <text class="meta-text">{{ competition.participants.length }}人参与</text>
            </view>
          </view>
          <button class="join-btn btn-primary" @click="joinCompetition(competition.id)">
            参与挑战
          </button>
        </view>
      </view>
    </view>

    <view class="modal-overlay" v-if="showCreateModal" @click="showCreateModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">创建新挑战</text>
        <view class="modal-form">
          <view class="form-item">
            <text class="form-label">挑战名称</text>
            <input class="form-input" placeholder="输入挑战名称" v-model="newCompetition.name" />
          </view>
          <view class="form-item">
            <text class="form-label">挑战描述</text>
            <textarea class="form-textarea" placeholder="输入挑战描述" v-model="newCompetition.description"></textarea>
          </view>
          <view class="form-item">
            <text class="form-label">结束日期</text>
            <picker mode="date" :value="newCompetition.endDate" @change="onDateChange">
              <view class="form-picker">
                <text>{{ newCompetition.endDate || '选择日期' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
        </view>
        <view class="modal-actions">
          <button class="modal-btn btn-secondary" @click="showCreateModal = false">取消</button>
          <button class="modal-btn btn-primary" @click="createCompetition">创建</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { useFriendsStore } from '@/stores/friends'

const userStore = useUserStore()
const friendsStore = useFriendsStore()

const showCreateModal = ref(false)
const newCompetition = reactive({
  name: '',
  description: '',
  endDate: ''
})

const availableCompetitions = computed(() => {
  return friendsStore.competitions.filter(c => !c.participants.includes('1'))
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function onDateChange(e: { detail: { value: string } }) {
  newCompetition.endDate = e.detail.value
}

function createCompetition() {
  if (!newCompetition.name) {
    uni.showToast({ title: '请输入挑战名称', icon: 'none' })
    return
  }
  if (!newCompetition.endDate) {
    uni.showToast({ title: '请选择结束日期', icon: 'none' })
    return
  }
  
  friendsStore.createCompetition(newCompetition.name, newCompetition.description, newCompetition.endDate)
  uni.showToast({ title: '创建成功', icon: 'success' })
  showCreateModal.value = false
  
  newCompetition.name = ''
  newCompetition.description = ''
  newCompetition.endDate = ''
}

function joinCompetition(competitionId: string) {
  friendsStore.joinCompetition(competitionId)
  uni.showToast({ title: '参与成功', icon: 'success' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/global.scss';

.page {
  min-height: 100vh;
  background: $apple-dark-gray;
  padding: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $apple-text;
  margin-bottom: 24rpx;
  display: block;
}

.create-card {
  background: linear-gradient(135deg, $apple-purple 0%, $apple-blue 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56rpx;
  margin-bottom: 40rpx;
  border-radius: 32rpx;
  box-shadow: 
    0 8rpx 32rpx rgba(175, 82, 222, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
  
  .create-icon {
    font-size: 56rpx;
    margin-right: 20rpx;
  }
  
  .create-text {
    font-size: 36rpx;
    font-weight: 600;
  }
}

.challenge-list {
  margin-bottom: 40rpx;
}

.challenge-card {
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  
  .challenge-name {
    font-size: 34rpx;
    font-weight: 700;
    color: $apple-text;
  }
}

.challenge-status {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-weight: 500;
  
  &.ongoing {
    background: rgba(52, 199, 89, 0.15);
    color: $apple-green;
  }
  
  &.ended {
    background: $apple-light-gray;
    color: $apple-text-muted;
  }
}

.challenge-desc {
  font-size: 28rpx;
  color: $apple-text-secondary;
  margin-bottom: 20rpx;
  display: block;
}

.challenge-meta {
  display: flex;
  margin-bottom: 24rpx;
  
  .meta-item {
    display: flex;
    align-items: center;
    
    &:first-child {
      margin-right: 40rpx;
    }
    
    .meta-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }
    
    .meta-text {
      font-size: 26rpx;
      color: $apple-text-muted;
    }
  }
}

.challenge-progress {
  margin-bottom: 24rpx;
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12rpx;
    
    .progress-label {
      font-size: 26rpx;
      color: $apple-text-muted;
    }
    
    .progress-value {
      font-size: 26rpx;
      font-weight: 600;
      color: $apple-blue;
    }
  }
  
  .progress-bar {
    height: 12rpx;
    background: $apple-light-gray;
    border-radius: 6rpx;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, $apple-blue, $apple-cyan);
    border-radius: 6rpx;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.challenge-action {
  display: flex;
  gap: 20rpx;
  
  .action-btn {
    flex: 1;
  }
}

.join-btn {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  
  .empty-icon {
    font-size: 100rpx;
    display: block;
    margin-bottom: 32rpx;
  }
  
  .empty-text {
    font-size: 32rpx;
    color: $apple-text-secondary;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .empty-hint {
    font-size: 28rpx;
    color: $apple-text-muted;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 85%;
  background: $apple-gray;
  border-radius: 32rpx;
  padding: 48rpx;
  border: 1rpx solid $apple-border;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $apple-text;
  text-align: center;
  margin-bottom: 40rpx;
  display: block;
}

.modal-form {
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 28rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 28rpx;
  color: $apple-text-secondary;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  background: $apple-light-gray;
  border-radius: 16rpx;
  padding: 28rpx;
  font-size: 30rpx;
  color: $apple-text;
  border: 1rpx solid $apple-border;
}

.form-textarea {
  width: 100%;
  background: $apple-light-gray;
  border-radius: 16rpx;
  padding: 28rpx;
  font-size: 30rpx;
  color: $apple-text;
  height: 180rpx;
  border: 1rpx solid $apple-border;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $apple-light-gray;
  border-radius: 16rpx;
  padding: 28rpx;
  font-size: 30rpx;
  color: $apple-text;
  border: 1rpx solid $apple-border;
  
  .picker-arrow {
    font-size: 24rpx;
    color: $apple-text-muted;
  }
}

.modal-actions {
  display: flex;
  gap: 24rpx;
  
  .modal-btn {
    flex: 1;
  }
}
</style>
