<template>
  <view class="page">
    <view class="init-modal" v-if="!isInitialized">
      <view class="init-content">
        <text class="init-icon">👋</text>
        <text class="init-title">欢迎使用瘦身搭档</text>
        <text class="init-desc">开始记录你的减肥之旅吧！</text>
        
        <view class="init-form">
          <view class="form-item">
            <text class="form-label">当前体重 (kg)</text>
            <input class="form-input" type="digit" placeholder="请输入当前体重" v-model="initForm.currentWeight" />
          </view>
          <view class="form-item">
            <text class="form-label">目标体重 (kg)</text>
            <input class="form-input" type="digit" placeholder="请输入目标体重" v-model="initForm.targetWeight" />
          </view>
          <view class="form-item">
            <text class="form-label">身高 (cm)</text>
            <input class="form-input" type="digit" placeholder="请输入身高" v-model="initForm.height" />
          </view>
        </view>
        
        <button class="init-btn btn-primary" @click="handleInit">开始记录</button>
      </view>
    </view>

    <view class="main-content" v-else>
      <view class="header">
        <view class="greeting">
          <text class="greeting-text">今日打卡</text>
          <text class="date-text">{{ currentDate }}</text>
        </view>
        <view class="streak-badge" v-if="userStore.streakDays > 0">
          <text class="streak-icon">🔥</text>
          <text class="streak-text">{{ userStore.streakDays }}天</text>
        </view>
      </view>

      <view class="weight-card card">
        <view class="weight-display">
          <text class="weight-value">{{ userStore.userInfo.currentWeight }}</text>
          <text class="weight-unit">kg</text>
        </view>
        <view class="weight-meta">
          <view class="meta-item">
            <text class="meta-label">目标体重</text>
            <text class="meta-value">{{ userStore.userInfo.targetWeight }}kg</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">BMI</text>
            <text class="meta-value">{{ userStore.bmi }}</text>
          </view>
        </view>
        <view class="progress-section">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: userStore.progress + '%' }"></view>
          </view>
          <text class="progress-text">已完成 {{ userStore.progress }}%</text>
        </view>
      </view>

      <view class="stats-card card">
        <view class="stat-item">
          <view class="stat-icon-wrapper success">
            <text class="stat-icon">📉</text>
          </view>
          <view class="stat-content">
            <text class="stat-value text-success">-{{ userStore.totalWeightLost }}kg</text>
            <text class="stat-label">累计减重</text>
          </view>
        </view>
        <view class="stat-item">
          <view class="stat-icon-wrapper warning">
            <text class="stat-icon">🎯</text>
          </view>
          <view class="stat-content">
            <text class="stat-value text-warning">{{ userStore.remainingWeight }}kg</text>
            <text class="stat-label">距离目标</text>
          </view>
        </view>
      </view>

      <view class="group-card card">
        <view class="group-header" v-if="groupsStore.currentGroup">
          <view class="group-info">
            <text class="group-icon">👥</text>
            <view class="group-detail">
              <text class="group-name">{{ groupsStore.currentGroup.name }}</text>
              <text class="group-code">群号: {{ groupsStore.currentGroup.code }}</text>
            </view>
          </view>
          <view class="group-switch" @click="showGroupModal = true">
            <text class="switch-icon">🔄</text>
          </view>
        </view>
        
        <view class="group-input" v-else>
          <view class="input-group">
            <input 
              class="group-code-input" 
              placeholder="输入挑战群号加入" 
              v-model="groupCode"
              maxlength="6"
            />
            <button class="join-btn" @click="handleJoinGroup">加入</button>
          </view>
          <text class="create-hint" @click="showCreateGroupModal = true">+ 创建新挑战群</text>
        </view>
      </view>

      <view class="quick-actions card">
        <text class="section-title">快捷操作</text>
        <view class="action-grid">
          <view class="action-item" @click="goToRecord">
            <view class="action-icon">📝</view>
            <text class="action-text">记录体重</text>
          </view>
          <view class="action-item" @click="goToChart">
            <view class="action-icon">📊</view>
            <text class="action-text">查看图表</text>
          </view>
          <view class="action-item" @click="goToFriends">
            <view class="action-icon">👥</view>
            <text class="action-text">好友对比</text>
          </view>
          <view class="action-item" @click="goToCompetition">
            <view class="action-icon">🏆</view>
            <text class="action-text">挑战赛</text>
          </view>
        </view>
      </view>

      <view class="achievements-card card">
        <view class="section-header">
          <text class="section-title">我的成就</text>
          <text class="achievement-count">{{ unlockedCount }}/{{ userStore.achievements.length }}</text>
        </view>
        <scroll-view class="achievements-scroll" scroll-x>
          <view class="achievements-list">
            <view 
              class="achievement-item" 
              :class="{ unlocked: achievement.unlocked, locked: !achievement.unlocked }"
              v-for="achievement in userStore.achievements" 
              :key="achievement.id"
            >
              <text class="achievement-icon">{{ achievement.icon }}</text>
              <text class="achievement-name">{{ achievement.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="today-card card" v-if="!hasCheckedInToday">
        <view class="checkin-prompt">
          <text class="checkin-title">今日还未打卡</text>
          <text class="checkin-desc">记录今天的体重，保持打卡习惯</text>
        </view>
        <view class="checkin-input">
          <view class="input-wrapper">
            <input 
              class="weight-input" 
              type="digit" 
              placeholder="输入体重" 
              v-model="inputWeight"
              @confirm="handleCheckin"
            />
            <text class="input-unit">kg</text>
          </view>
          <view class="note-input">
            <input 
              class="note-field" 
              placeholder="今日备注（可选）" 
              v-model="inputNote"
            />
          </view>
          <button class="checkin-btn btn-primary" @click="handleCheckin">立即打卡</button>
        </view>
      </view>

      <view class="today-card card checked-in" v-else>
        <view class="checked-in-content">
          <text class="checked-icon">✅</text>
          <text class="checked-title">今日已打卡</text>
          <text class="checked-desc">坚持就是胜利！明天继续加油 💪</text>
        </view>
      </view>
    </view>

    <view class="modal-overlay" v-if="showGroupModal" @click="showGroupModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">我的群组</text>
        <scroll-view class="group-list" scroll-y>
          <view 
            class="group-item" 
            :class="{ active: groupsStore.currentGroup?.id === group.id }"
            v-for="group in groupsStore.myGroups" 
            :key="group.id"
            @click="selectGroup(group)"
          >
            <text class="group-item-icon">👥</text>
            <view class="group-item-info">
              <text class="group-item-name">{{ group.name }}</text>
              <text class="group-item-count">{{ group.members.length }} 名成员</text>
            </view>
            <text class="group-item-code">{{ group.code }}</text>
          </view>
          <view class="empty-state" v-if="groupsStore.myGroups.length === 0">
            <text class="empty-text">还没有加入任何群组</text>
          </view>
        </scroll-view>
        <view class="modal-actions">
          <button class="modal-btn btn-secondary" @click="showGroupModal = false">关闭</button>
          <button class="modal-btn btn-primary" @click="showCreateGroupModal = true; showGroupModal = false">创建群组</button>
        </view>
      </view>
    </view>

    <view class="modal-overlay" v-if="showCreateGroupModal" @click="showCreateGroupModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">创建挑战群</text>
        <view class="modal-form">
          <view class="form-item">
            <text class="form-label">群名称</text>
            <input class="form-input" placeholder="输入群名称" v-model="newGroup.name" />
          </view>
          <view class="form-item">
            <text class="form-label">群描述</text>
            <textarea class="form-textarea" placeholder="输入群描述" v-model="newGroup.description"></textarea>
          </view>
        </view>
        <view class="modal-actions">
          <button class="modal-btn btn-secondary" @click="showCreateGroupModal = false">取消</button>
          <button class="modal-btn btn-primary" @click="handleCreateGroup">创建</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGroupsStore } from '@/stores/groups'

const userStore = useUserStore()
const groupsStore = useGroupsStore()

const inputWeight = ref('')
const inputNote = ref('')
const groupCode = ref('')
const showGroupModal = ref(false)
const showCreateGroupModal = ref(false)

const initForm = reactive({
  currentWeight: '',
  targetWeight: '',
  height: ''
})

const newGroup = reactive({
  name: '',
  description: ''
})

onMounted(() => {
  groupsStore.loadGroups()
})

const isInitialized = computed(() => {
  return userStore.userInfo.currentWeight > 0 && userStore.userInfo.targetWeight > 0
})

const currentDate = computed(() => {
  const now = new Date()
  const weekDays = '日一二三四五六'
  return `${now.getMonth() + 1}月${now.getDate()}日 周${weekDays[now.getDay()]}`
})

const hasCheckedInToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return userStore.weightRecords.some(record => record.date === today)
})

const unlockedCount = computed(() => {
  return userStore.achievements.filter(a => a.unlocked).length
})

function handleInit() {
  const currentWeight = parseFloat(initForm.currentWeight)
  const targetWeight = parseFloat(initForm.targetWeight)
  const height = parseInt(initForm.height)

  if (!currentWeight || currentWeight <= 0) {
    uni.showToast({ title: '请输入有效体重', icon: 'none' })
    return
  }
  if (!targetWeight || targetWeight <= 0) {
    uni.showToast({ title: '请输入目标体重', icon: 'none' })
    return
  }
  if (!height || height <= 0) {
    uni.showToast({ title: '请输入身高', icon: 'none' })
    return
  }

  userStore.updateUserInfo({
    currentWeight,
    targetWeight,
    startWeight: currentWeight,
    height
  })

  uni.showToast({ title: '设置成功', icon: 'success' })
}

function goToRecord() {
  uni.switchTab({ url: '/pages/record/index' })
}

function goToChart() {
  uni.navigateTo({ url: '/pages/chart/index' })
}

function goToFriends() {
  uni.switchTab({ url: '/pages/friends/index' })
}

function goToCompetition() {
  uni.navigateTo({ url: '/pages/competition/index' })
}

function handleCheckin() {
  const weight = parseFloat(inputWeight.value)
  if (!weight || weight <= 0) {
    uni.showToast({ title: '请输入有效体重', icon: 'none' })
    return
  }
  
  userStore.addWeightRecord(weight, inputNote.value)
  uni.showToast({ title: '打卡成功', icon: 'success' })
  inputWeight.value = ''
  inputNote.value = ''
}

async function handleJoinGroup() {
  if (!groupCode.value.trim()) {
    uni.showToast({ title: '请输入群号', icon: 'none' })
    return
  }
  
  const result = await groupsStore.joinGroup(groupCode.value)
  uni.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })
  
  if (result.success) {
    groupCode.value = ''
  }
}

async function handleCreateGroup() {
  if (!newGroup.name.trim()) {
    uni.showToast({ title: '请输入群名称', icon: 'none' })
    return
  }
  
  const result = await groupsStore.createGroup(newGroup.name, newGroup.description)
  uni.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })
  
  if (result.success) {
    newGroup.name = ''
    newGroup.description = ''
    showCreateGroupModal.value = false
  }
}

function selectGroup(group: any) {
  groupsStore.setCurrentGroup(group)
  showGroupModal.value = false
  uni.showToast({ title: `已切换到 ${group.name}`, icon: 'success' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/global.scss';

.page {
  min-height: 100vh;
  background: $apple-light-gray;
}

.init-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $apple-light-gray;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 100rpx 48rpx 48rpx;
  z-index: 1000;
  overflow-y: auto;
}

.init-content {
  width: 100%;
  max-height: 85vh;
  background: $apple-white;
  border-radius: 32rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  overflow-y: auto;
}

.init-icon {
  font-size: 72rpx;
  display: block;
  margin-bottom: 20rpx;
}

.init-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $apple-text;
  display: block;
  margin-bottom: 10rpx;
}

.init-desc {
  font-size: 26rpx;
  color: $apple-text-secondary;
  display: block;
  margin-bottom: 32rpx;
}

.init-form {
  margin-bottom: 28rpx;
}

.form-item {
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 26rpx;
  color: $apple-text-secondary;
  display: block;
  margin-bottom: 10rpx;
  text-align: left;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  background: $apple-light-gray;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  color: $apple-text;
  border: 1rpx solid $apple-border;
  
  &:focus {
    border-color: $apple-blue;
  }
}

.init-btn {
  width: 100%;
  background: $apple-blue;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  border-radius: 44rpx;
  padding: 26rpx;
  
  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

.main-content {
  padding: 32rpx;
  padding-bottom: 180rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.greeting {
  .greeting-text {
    font-size: 44rpx;
    font-weight: 700;
    color: $apple-text;
    letter-spacing: -0.5rpx;
  }
  .date-text {
    font-size: 26rpx;
    color: $apple-text-secondary;
    margin-left: 16rpx;
  }
}

.streak-badge {
  display: flex;
  align-items: center;
  background: $apple-orange;
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  
  .streak-icon {
    font-size: 24rpx;
    margin-right: 8rpx;
  }
  .streak-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 600;
  }
}

.weight-card {
  background: linear-gradient(135deg, $apple-blue 0%, $apple-cyan 100%);
  color: #fff;
  padding: 48rpx;
  border-radius: 32rpx;
  box-shadow: 
    0 8rpx 32rpx rgba(0, 122, 255, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
}

.weight-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 32rpx;
  
  .weight-value {
    font-size: 96rpx;
    font-weight: 200;
    letter-spacing: -2rpx;
  }
  .weight-unit {
    font-size: 36rpx;
    margin-left: 8rpx;
    opacity: 0.8;
  }
}

.weight-meta {
  display: flex;
  justify-content: space-around;
  margin-bottom: 32rpx;
  
  .meta-item {
    text-align: center;
    
    .meta-label {
      font-size: 24rpx;
      opacity: 0.7;
      display: block;
      margin-bottom: 12rpx;
    }
    .meta-value {
      font-size: 32rpx;
      font-weight: 600;
    }
  }
}

.progress-section {
  .progress-bar {
    height: 8rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4rpx;
    overflow: hidden;
    margin-bottom: 16rpx;
  }
  .progress-fill {
    height: 100%;
    background: #fff;
    border-radius: 4rpx;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .progress-text {
    font-size: 24rpx;
    opacity: 0.8;
    text-align: center;
    display: block;
  }
}

.stats-card {
  display: flex;
  gap: 24rpx;
  
  .stat-item {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: $apple-white;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  }
  .stat-icon-wrapper {
    width: 88rpx;
    height: 88rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    
    &.success {
      background: rgba(52, 199, 89, 0.12);
    }
    &.warning {
      background: rgba(255, 149, 0, 0.12);
    }
  }
  .stat-icon {
    font-size: 40rpx;
  }
  .stat-content {
    .stat-value {
      font-size: 36rpx;
      font-weight: 700;
      display: block;
      color: $apple-text;
    }
    .stat-label {
      font-size: 24rpx;
      color: $apple-text-secondary;
    }
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $apple-text;
  margin-bottom: 24rpx;
  display: block;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.achievement-count {
  font-size: 26rpx;
  color: $apple-text-muted;
}

.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.action-item {
  width: calc(25% - 18rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0;
  background: $apple-white;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  
  &:active {
    background: $apple-light-gray;
  }
  
  .action-icon {
    font-size: 56rpx;
    margin-bottom: 16rpx;
  }
  .action-text {
    font-size: 24rpx;
    color: $apple-text-secondary;
    font-weight: 500;
  }
}

.achievements-scroll {
  white-space: nowrap;
}

.achievements-list {
  display: inline-flex;
}

.achievement-item {
  width: 128rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  
  &.unlocked {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.12), rgba(255, 142, 83, 0.12));
    border: 1rpx solid rgba(255, 107, 107, 0.25);
  }
  
  &.locked {
    background: $apple-light-gray;
    opacity: 0.5;
  }
  
  .achievement-icon {
    font-size: 48rpx;
    margin-bottom: 12rpx;
  }
  
  .achievement-name {
    font-size: 22rpx;
    color: $apple-text-secondary;
    text-align: center;
    font-weight: 500;
  }
}

.today-card {
  background: linear-gradient(135deg, $apple-purple 0%, $apple-blue 100%);
  color: #fff;
  padding: 40rpx;
  border-radius: 32rpx;
  box-shadow: 
    0 8rpx 32rpx rgba(175, 82, 222, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
  
  &.checked-in {
    text-align: center;
    padding: 60rpx 40rpx;
  }
}

.checkin-prompt {
  text-align: center;
  margin-bottom: 32rpx;
  
  .checkin-title {
    font-size: 36rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .checkin-desc {
    font-size: 26rpx;
    opacity: 0.8;
  }
}

.checkin-input {
  .input-wrapper {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20rpx;
    padding: 24rpx 28rpx;
    margin-bottom: 20rpx;
  }
  
  .weight-input {
    flex: 1;
    font-size: 40rpx;
    font-weight: 300;
    color: #fff;
    background: transparent;
    letter-spacing: -1rpx;
  }
  
  .input-unit {
    font-size: 32rpx;
    opacity: 0.7;
    font-weight: 500;
  }
  
  .note-input {
    margin-bottom: 28rpx;
  }
  
  .note-field {
    width: 100%;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20rpx;
    padding: 24rpx 28rpx;
    font-size: 28rpx;
    color: #fff;
  }
  
  .checkin-btn {
    width: 100%;
    background: #fff;
    color: $apple-purple;
    font-weight: 600;
    border-radius: 44rpx;
    padding: 28rpx;
    
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}

.checked-in-content {
  .checked-icon {
    font-size: 80rpx;
    display: block;
    margin-bottom: 24rpx;
  }
  
  .checked-title {
    font-size: 36rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .checked-desc {
    font-size: 28rpx;
    opacity: 0.8;
  }
}

.group-card {
  background: $apple-white;
  color: $apple-text;
  padding: 32rpx;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .group-info {
    display: flex;
    align-items: center;
    
    .group-icon {
      font-size: 48rpx;
      margin-right: 20rpx;
    }
    
    .group-detail {
      .group-name {
        font-size: 32rpx;
        font-weight: 600;
        display: block;
      }
      
      .group-code {
        font-size: 24rpx;
        color: $apple-text-muted;
        font-family: SF Mono, monospace;
      }
    }
  }
  
  .group-switch {
    width: 64rpx;
    height: 64rpx;
    background: $apple-light-gray;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:active {
      background: $apple-border;
    }
    
    .switch-icon {
      font-size: 28rpx;
    }
  }
}

.group-input {
  .input-group {
    display: flex;
    align-items: center;
    
    .group-code-input {
      flex: 1;
      background: $apple-light-gray;
      border-radius: 20rpx;
      padding: 24rpx 28rpx;
      font-size: 32rpx;
      color: $apple-text;
      margin-right: 20rpx;
      border: 1rpx solid $apple-border;
      font-family: SF Mono, monospace;
      letter-spacing: 4rpx;
      
      &:focus {
        border-color: $apple-blue;
      }
    }
    
    .join-btn {
      background: $apple-blue;
      color: #fff;
      font-size: 28rpx;
      font-weight: 600;
      padding: 24rpx 40rpx;
      border-radius: 40rpx;
      
      &:active {
        opacity: 0.8;
        transform: scale(0.98);
      }
    }
  }
  
  .create-hint {
    display: block;
    text-align: center;
    font-size: 26rpx;
    color: $apple-blue;
    margin-top: 20rpx;
    font-weight: 500;
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
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $apple-text;
  text-align: center;
  margin-bottom: 36rpx;
  display: block;
}

.modal-form {
  flex: 1;
  margin-bottom: 36rpx;
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
  display: block;
  margin-bottom: 12rpx;
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

.modal-actions {
  display: flex;
  gap: 28rpx;
  
  .modal-btn {
    flex: 1;
  }
}

.group-list {
  flex: 1;
  max-height: 400rpx;
  margin-bottom: 28rpx;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 28rpx;
  background: $apple-light-gray;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
  
  &.active {
    background: rgba(52, 199, 89, 0.15);
    border-color: $apple-green;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:active {
    background: $apple-border;
  }
  
  .group-item-icon {
    font-size: 40rpx;
    margin-right: 20rpx;
  }
  
  .group-item-info {
    flex: 1;
    
    .group-item-name {
      font-size: 30rpx;
      font-weight: 600;
      color: $apple-text;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .group-item-count {
      font-size: 24rpx;
      color: $apple-text-muted;
    }
  }
  
  .group-item-code {
    font-size: 28rpx;
    font-weight: 700;
    color: $apple-blue;
    font-family: SF Mono, monospace;
    letter-spacing: 2rpx;
  }
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  
  .empty-text {
    font-size: 28rpx;
    color: $apple-text-muted;
  }
}
</style>
