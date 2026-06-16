<template>
  <view class="page">
    <view class="profile-header">
      <view class="user-info">
        <view class="avatar-wrapper">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="user-detail">
          <text class="user-name">{{ userStore.userInfo.nickname }}</text>
          <text class="user-id">ID: {{ userStore.userInfo.id }}</text>
        </view>
      </view>
      <view class="edit-btn" @click="showEditModal = true">
        <text class="edit-icon">✏️</text>
      </view>
    </view>

    <view class="stats-row card">
      <view class="stat-item">
        <text class="stat-value">{{ userStore.userInfo.currentWeight }}kg</text>
        <text class="stat-label">当前体重</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ userStore.userInfo.targetWeight }}kg</text>
        <text class="stat-label">目标体重</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ userStore.totalWeightLost }}kg</text>
        <text class="stat-label">累计减重</text>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-item card" @click="goToAchievements">
        <view class="menu-icon">🏅</view>
        <view class="menu-content">
          <text class="menu-title">我的成就</text>
          <text class="menu-desc">{{ unlockedCount }}/{{ userStore.achievements.length }} 已解锁</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item card" @click="goToChart">
        <view class="menu-icon">📊</view>
        <view class="menu-content">
          <text class="menu-title">数据统计</text>
          <text class="menu-desc">查看体重变化趋势</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item card" @click="goToCompetition">
        <view class="menu-icon">🏆</view>
        <view class="menu-content">
          <text class="menu-title">挑战赛</text>
          <text class="menu-desc">{{ friendsStore.joinedCompetitions.length }} 个进行中</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item card" @click="showShareModal = true">
        <view class="menu-icon">📤</view>
        <view class="menu-content">
          <text class="menu-title">分享成就</text>
          <text class="menu-desc">分享到朋友圈</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item card" @click="showSettings">
        <view class="menu-icon">⚙️</view>
        <view class="menu-content">
          <text class="menu-title">设置</text>
          <text class="menu-desc">个人信息、通知设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item card" @click="showAbout">
        <view class="menu-icon">ℹ️</view>
        <view class="menu-content">
          <text class="menu-title">关于我们</text>
          <text class="menu-desc">版本 1.0.0</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="goal-progress card">
      <text class="section-title">目标进度</text>
      <view class="progress-ring">
        <view class="ring-bg"></view>
        <view class="ring-fill" :style="{ '--progress': userStore.progress }"></view>
        <view class="ring-center">
          <text class="ring-value">{{ userStore.progress }}%</text>
          <text class="ring-label">完成度</text>
        </view>
      </view>
      <view class="progress-detail">
        <view class="detail-item">
          <text class="detail-label">起始体重</text>
          <text class="detail-value">{{ userStore.userInfo.startWeight }}kg</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">当前体重</text>
          <text class="detail-value">{{ userStore.userInfo.currentWeight }}kg</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">目标体重</text>
          <text class="detail-value">{{ userStore.userInfo.targetWeight }}kg</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">身高</text>
          <text class="detail-value">{{ userStore.userInfo.height }}cm</text>
        </view>
      </view>
    </view>

    <view class="modal-overlay" v-if="showEditModal" @click="showEditModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">编辑个人信息</text>
        <view class="modal-form">
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input class="form-input" v-model="editInfo.nickname" />
          </view>
          <view class="form-item">
            <text class="form-label">身高 (cm)</text>
            <input class="form-input" type="digit" v-model="editInfo.height" />
          </view>
          <view class="form-item">
            <text class="form-label">目标体重 (kg)</text>
            <input class="form-input" type="digit" v-model="editInfo.targetWeight" />
          </view>
        </view>
        <view class="modal-actions">
          <button class="modal-btn btn-secondary" @click="showEditModal = false">取消</button>
          <button class="modal-btn btn-primary" @click="saveEdit">保存</button>
        </view>
      </view>
    </view>

    <view class="modal-overlay" v-if="showShareModal" @click="showShareModal = false">
      <view class="modal-content share-modal" @click.stop>
        <text class="modal-title">分享到朋友圈</text>
        <view class="share-preview card">
          <view class="share-header">
            <text class="share-icon">🔥</text>
            <text class="share-title">我在瘦身搭档累计减重 {{ userStore.totalWeightLost }}kg！</text>
          </view>
          <view class="share-stats">
            <view class="share-stat">
              <text class="share-value">{{ userStore.streakDays }}</text>
              <text class="share-label">连续打卡</text>
            </view>
            <view class="share-stat">
              <text class="share-value">{{ userStore.progress }}%</text>
              <text class="share-label">目标完成</text>
            </view>
          </view>
          <view class="share-footer">
            <text class="share-tag">#瘦身搭档#</text>
          </view>
        </view>
        <view class="modal-actions">
          <button class="modal-btn btn-secondary" @click="showShareModal = false">取消</button>
          <button class="modal-btn btn-primary" @click="share">分享</button>
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

const showEditModal = ref(false)
const showShareModal = ref(false)

const editInfo = reactive({
  nickname: userStore.userInfo.nickname,
  height: userStore.userInfo.height.toString(),
  targetWeight: userStore.userInfo.targetWeight.toString()
})

const unlockedCount = computed(() => {
  return userStore.achievements.filter(a => a.unlocked).length
})

function saveEdit() {
  userStore.updateUserInfo({
    nickname: editInfo.nickname,
    height: parseInt(editInfo.height) || userStore.userInfo.height,
    targetWeight: parseFloat(editInfo.targetWeight) || userStore.userInfo.targetWeight
  })
  uni.showToast({ title: '保存成功', icon: 'success' })
  showEditModal.value = false
}

function goToAchievements() {
  uni.navigateTo({ url: '/pages/achievements/index' })
}

function goToChart() {
  uni.navigateTo({ url: '/pages/chart/index' })
}

function goToCompetition() {
  uni.navigateTo({ url: '/pages/competition/index' })
}

function showSettings() {
  uni.showToast({ title: '设置功能开发中', icon: 'none' })
}

function showAbout() {
  uni.showModal({
    title: '关于瘦身搭档',
    content: '版本 1.0.0\n\n瘦身搭档是一款帮助你记录体重变化、与好友一起减肥的小程序。坚持打卡，遇见更好的自己！💪',
    showCancel: false
  })
}

function share() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
  showShareModal.value = false
}
</script>

<style lang="scss" scoped>
@import '@/styles/global.scss';

.page {
  min-height: 100vh;
  background: $apple-light-gray;
  padding-bottom: 180rpx;
}

.profile-header {
  background: linear-gradient(135deg, $apple-blue 0%, $apple-cyan 100%);
  padding: 48rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  
  .avatar-icon {
    font-size: 56rpx;
  }
}

.user-detail {
  .user-name {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .user-id {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.edit-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .edit-icon {
    font-size: 32rpx;
  }
}

.stats-row {
  display: flex;
  align-items: center;
  margin: -48rpx 32rpx 32rpx;
  position: relative;
  z-index: 10;
  
  .stat-item {
    flex: 1;
    text-align: center;
    
    .stat-value {
      font-size: 36rpx;
      font-weight: 700;
      color: $apple-text;
      display: block;
      margin-bottom: 12rpx;
    }
    
    .stat-label {
      font-size: 26rpx;
      color: $apple-text-muted;
    }
  }
  
  .stat-divider {
    width: 1rpx;
    height: 72rpx;
    background: $apple-border;
  }
}

.menu-section {
  padding: 0 32rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:active {
    background: $apple-light-gray;
  }
  
  .menu-icon {
    font-size: 48rpx;
    margin-right: 24rpx;
  }
  
  .menu-content {
    flex: 1;
    
    .menu-title {
      font-size: 32rpx;
      color: $apple-text;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .menu-desc {
      font-size: 26rpx;
      color: $apple-text-muted;
    }
  }
  
  .menu-arrow {
    font-size: 32rpx;
    color: $apple-text-muted;
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $apple-text;
  margin-bottom: 28rpx;
  display: block;
}

.goal-progress {
  margin: 32rpx;
  padding: 40rpx;
}

.progress-ring {
  position: relative;
  width: 220rpx;
  height: 220rpx;
  margin: 0 auto 40rpx;
  
  .ring-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 12rpx solid $apple-light-gray;
  }
  
  .ring-fill {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 12rpx solid transparent;
    border-top-color: $apple-blue;
    border-right-color: $apple-blue;
    transform: rotate(calc(var(--progress) * 3.6deg - 90deg));
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .ring-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    
    .ring-value {
      font-size: 48rpx;
      font-weight: 200;
      color: $apple-blue;
      display: block;
    }
    
    .ring-label {
      font-size: 24rpx;
      color: $apple-text-muted;
    }
  }
}

.progress-detail {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  
  .detail-item {
    .detail-label {
      font-size: 26rpx;
      color: $apple-text-muted;
      display: block;
      margin-bottom: 12rpx;
    }
    
    .detail-value {
      font-size: 32rpx;
      font-weight: 600;
      color: $apple-text;
    }
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
  background: $apple-white;
  border-radius: 32rpx;
  padding: 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  
  &.share-modal {
    width: 90%;
  }
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

.modal-actions {
  display: flex;
  gap: 28rpx;
  
  .modal-btn {
    flex: 1;
  }
}

.share-preview {
  background: linear-gradient(135deg, $apple-blue 0%, $apple-cyan 100%);
  color: #fff;
  margin-bottom: 32rpx;
  
  .share-header {
    text-align: center;
    padding: 40rpx;
    
    .share-icon {
      font-size: 72rpx;
      display: block;
      margin-bottom: 20rpx;
    }
    
    .share-title {
      font-size: 30rpx;
      font-weight: 600;
      line-height: 1.5;
    }
  }
  
  .share-stats {
    display: flex;
    justify-content: center;
    padding: 0 40rpx;
    
    .share-stat {
      text-align: center;
      margin: 0 48rpx;
      
      .share-value {
        font-size: 56rpx;
        font-weight: 200;
        display: block;
      }
      
      .share-label {
        font-size: 26rpx;
        opacity: 0.8;
      }
    }
  }
  
  .share-footer {
    text-align: center;
    padding: 24rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.2);
    margin-top: 16rpx;
    
    .share-tag {
      font-size: 24rpx;
      opacity: 0.8;
    }
  }
}
</style>
