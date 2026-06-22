<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGroupsStore } from '@/stores/groups'
import CustomTabBar from '@/components/CustomTabBar.vue'

const userStore = useUserStore()
const groupsStore = useGroupsStore()

const showEditForm = ref(false)
const isFirstTime = ref(false)
const editHeight = ref('')
const editStartWeight = ref('')
const editTargetWeight = ref('')
const editCurrentWeight = ref('')

// 微信昵称和头像
const tempAvatar = ref(userStore.userInfo.avatar)

function onNicknameChange(e: any) {
  userStore.updateUserInfo({ nickname: e.detail.value })
}

function onChooseAvatar(e: any) {
  tempAvatar.value = e.detail.avatarUrl
  userStore.updateUserInfo({ avatar: e.detail.avatarUrl })
}

function openEditForm() {
  editHeight.value = userStore.userInfo.height ? String(userStore.userInfo.height) : ''
  editStartWeight.value = userStore.userInfo.startWeight ? String(userStore.userInfo.startWeight) : ''
  editTargetWeight.value = userStore.userInfo.targetWeight ? String(userStore.userInfo.targetWeight) : ''
  editCurrentWeight.value = userStore.userInfo.currentWeight ? String(userStore.userInfo.currentWeight) : ''
  tempAvatar.value = userStore.userInfo.avatar
  showEditForm.value = true
}

function saveProfile() {
  const height = parseFloat(editHeight.value)
  const start = parseFloat(editStartWeight.value)
  const target = parseFloat(editTargetWeight.value)
  const current = parseFloat(editCurrentWeight.value)

  if (!editHeight.value || isNaN(height) || height < 50 || height > 300) {
    uni.showToast({ title: '请输入有效身高(50-300cm)', icon: 'error' })
    return
  }
  if (!editStartWeight.value || isNaN(start) || start <= 0) {
    uni.showToast({ title: '请输入起始体重', icon: 'error' })
    return
  }
  if (!editTargetWeight.value || isNaN(target) || target <= 0) {
    uni.showToast({ title: '请输入目标体重', icon: 'error' })
    return
  }

  userStore.updateUserInfo({
    height,
    startWeight: start,
    targetWeight: target,
    currentWeight: current || userStore.userInfo.currentWeight
  })

  showEditForm.value = false
  isFirstTime.value = false
  uni.showToast({ title: '保存成功', icon: 'success' })
}

function handleSetup() {
  isFirstTime.value = true
  openEditForm()
}

onMounted(() => {
  uni.$on('open-setup', handleSetup)
  if (!userStore.userInfo.height || !userStore.userInfo.startWeight || !userStore.userInfo.targetWeight) {
    setTimeout(() => {
      isFirstTime.value = true
      openEditForm()
    }, 300)
  }
})

onUnmounted(() => {
  uni.$off('open-setup', handleSetup)
})

const bmiLabel = computed(() => {
  const b = parseFloat(userStore.bmi)
  if (isNaN(b)) return ''
  if (b < 18.5) return '偏瘦'
  if (b < 24) return '正常'
  if (b < 28) return '偏胖'
  return '肥胖'
})
</script>

<template>
  <view class="container">
    <!-- 首次使用欢迎 -->
    <view class="welcome-card" v-if="isFirstTime && showEditForm">
      <text class="welcome-icon">👋</text>
      <text class="welcome-title">欢迎使用瘦身搭档！</text>
      <text class="welcome-desc">请设置你的身体数据，开始瘦身之旅</text>
    </view>

    <!-- 用户头像卡片 -->
    <view class="card profile-card">
      <view class="avatar" @click="openEditForm">
        <image v-if="userStore.userInfo.avatar" class="avatar-img" :src="userStore.userInfo.avatar" mode="aspectFill" />
        <text v-else class="avatar-text">{{ userStore.userInfo.nickname?.charAt(0) || '?' }}</text>
      </view>
      <text class="nickname">{{ userStore.userInfo.nickname || '瘦身达人' }}</text>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ userStore.totalWeightLost }}kg</text>
          <text class="stat-label">已减</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ userStore.streakDays }}天</text>
          <text class="stat-label">连续打卡</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ userStore.bmi }}</text>
          <text class="stat-label">{{ bmiLabel || '--' }}</text>
        </view>
      </view>
      <view class="btn-tertiary mt-2 text-center" @click="openEditForm">
        {{ !userStore.userInfo.height ? '⚙️ 设置身体数据' : '编辑资料' }}
      </view>
    </view>

    <!-- 编辑表单 -->
    <view class="card form-card" v-if="showEditForm">
      <text class="card-title">{{ isFirstTime ? '📝 设置你的数据' : '📝 编辑资料' }}</text>

      <!-- 微信头像 -->
      <view class="form-group">
        <text class="form-label">头像</text>
        <button class="avatar-picker" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image v-if="tempAvatar" class="avatar-preview" :src="tempAvatar" mode="aspectFill" />
          <text v-else class="avatar-placeholder">点击获取微信头像</text>
        </button>
      </view>

      <!-- 微信昵称 -->
      <view class="form-group">
        <text class="form-label">昵称</text>
        <input
          class="form-input nickname-input"
          type="nickname"
          :value="userStore.userInfo.nickname"
          placeholder="点击获取微信昵称"
          placeholder-style="color:#AEAEB2;font-size:28rpx"
          @blur="onNicknameChange"
          @confirm="onNicknameChange"
        />
      </view>

      <view class="form-group">
        <text class="form-label">身高 (cm) *必填</text>
        <input class="form-input" v-model="editHeight" type="digit" placeholder="如 170" placeholder-style="color:#AEAEB2;font-size:28rpx" />
      </view>
      <view class="form-group">
        <text class="form-label">起始体重 (kg) *必填</text>
        <input class="form-input" v-model="editStartWeight" type="digit" placeholder="减肥开始时的体重" placeholder-style="color:#AEAEB2;font-size:28rpx" />
      </view>
      <view class="form-group">
        <text class="form-label">目标体重 (kg) *必填</text>
        <input class="form-input" v-model="editTargetWeight" type="digit" placeholder="理想体重" placeholder-style="color:#AEAEB2;font-size:28rpx" />
      </view>
      <view class="form-group">
        <text class="form-label">当前体重 (kg)</text>
        <input class="form-input" v-model="editCurrentWeight" type="digit" placeholder="最新体重" placeholder-style="color:#AEAEB2;font-size:28rpx" />
      </view>

      <view class="form-actions">
        <view v-if="!isFirstTime" class="btn-secondary" @click="showEditForm = false">取消</view>
        <view class="btn-primary" @click="saveProfile">
          {{ isFirstTime ? '✅ 开始使用' : '保存' }}
        </view>
      </view>
    </view>

    <!-- 减重进度 -->
    <view class="card" v-if="userStore.userInfo.height">
      <text class="card-title">📊 减重进度</text>
      <view class="progress-section">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: userStore.progress + '%' }" />
        </view>
        <text class="progress-text">{{ userStore.progress }}%</text>
      </view>
      <view class="progress-detail">
        <text class="detail-text">
          目标：{{ userStore.userInfo.startWeight }}kg → {{ userStore.userInfo.targetWeight }}kg
        </text>
        <text class="detail-text">还需减：{{ userStore.remainingWeight }}kg</text>
      </view>
    </view>

    <!-- 我的群组 -->
    <view class="card">
      <text class="card-title">👥 我的群组</text>
      <view v-if="groupsStore.myGroups.length === 0" class="empty-state">
        <text class="empty-text">还没有加入任何群组</text>
        <text class="empty-hint">去「好友」页面创建或加入吧</text>
      </view>
      <view v-else class="group-list">
        <view v-for="group in groupsStore.myGroups" :key="group.id" class="group-item">
          <view class="group-info">
            <text class="group-name">{{ group.name }}</text>
            <text class="group-code">群号: {{ group.code }} · {{ group.members.length }}人</text>
          </view>
          <view class="btn-tertiary" @click="groupsStore.leaveGroup(group.id)">退出</view>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="card about-card">
      <text class="card-title">ℹ️ 关于</text>
      <view class="about-item"><text>版本</text><text class="text-muted">1.0.0</text></view>
      <view class="about-item"><text>技术栈</text><text class="text-muted">UniApp + Vue 3 + TS</text></view>
    </view>

    <CustomTabBar current="pages/profile/index" />
  </view>
</template>

<style lang="scss" scoped>
.welcome-card {
  background: linear-gradient(135deg, #007AFF, #5856D6);
  border-radius: 20rpx;
  padding: 48rpx 32rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.welcome-icon { font-size: 64rpx; display: block; margin-bottom: 12rpx; }
.welcome-title { font-size: 34rpx; font-weight: 700; color: #FFF; display: block; margin-bottom: 8rpx; }
.welcome-desc { font-size: 26rpx; color: rgba(255,255,255,0.8); }

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx 32rpx;
  margin-bottom: 24rpx;
}

.avatar {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  display: flex; align-items: center; justify-content: center; margin-bottom: 16rpx;
  overflow: hidden;
}
.avatar-img {
  width: 100%; height: 100%; border-radius: 50%;
}
.avatar-text { color: #FFF; font-size: 48rpx; font-weight: 600; }
.nickname { font-size: 34rpx; font-weight: 600; color: #1D1D1F; margin-bottom: 28rpx; }

.stats-row { display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 24rpx; }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: 32rpx; font-weight: 700; color: #007AFF; margin-bottom: 4rpx; }
.stat-label { font-size: 22rpx; color: #AEAEB2; }
.stat-divider { width: 1rpx; height: 48rpx; background: #E5E5EA; }

.card-title { font-size: 30rpx; font-weight: 600; color: #1D1D1F; display: block; margin-bottom: 24rpx; }
.form-card { margin-bottom: 24rpx; }
.form-group { margin-bottom: 20rpx; }
.form-label { display: block; font-size: 26rpx; color: #86868B; margin-bottom: 10rpx; }
.form-input { background: #F2F2F7; border-radius: 12rpx; padding: 24rpx; font-size: 28rpx; color: #1D1D1F; width: 100%; line-height: 1.4; }

.nickname-input {
  /* type=nickname 输入框特殊样式 */
}

.avatar-picker {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  background: #F2F2F7;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  padding: 0; margin: 0; border: none;
  line-height: 1;

  &::after { border: none; }
}

.avatar-preview {
  width: 100%; height: 100%; border-radius: 50%;
}

.avatar-placeholder {
  font-size: 22rpx;
  color: #AEAEB2;
  text-align: center;
}

.form-actions { display: flex; gap: 16rpx; margin-top: 28rpx;
  .btn-secondary, .btn-primary { flex: 1; text-align: center; }
}

.progress-section { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.progress-bar { flex: 1; height: 12rpx; background: #F2F2F7; border-radius: 6rpx; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(135deg, #34C759, #30D158); border-radius: 6rpx; transition: width 0.5s ease; }
.progress-text { font-size: 28rpx; font-weight: 700; color: #34C759; width: 80rpx; text-align: right; }
.progress-detail { display: flex; flex-direction: column; gap: 6rpx; }
.detail-text { font-size: 24rpx; color: #86868B; }

.group-list { display: flex; flex-direction: column; gap: 8rpx; }
.group-item { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 0; border-bottom: 1rpx solid #F2F2F7;
  &:last-child { border-bottom: none; }
}
.group-info { flex: 1; }
.group-name { display: block; font-size: 28rpx; font-weight: 500; color: #1D1D1F; }
.group-code { display: block; font-size: 22rpx; color: #86868B; margin-top: 4rpx; }

.empty-state { text-align: center; padding: 32rpx 0; }
.empty-text { display: block; font-size: 28rpx; color: #AEAEB2; margin-bottom: 8rpx; }
.empty-hint { font-size: 24rpx; color: #AEAEB2; }

.about-card { margin-top: 24rpx; margin-bottom: 48rpx; }
.about-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; font-size: 28rpx; color: #1D1D1F;
  &:not(:last-child) { border-bottom: 1rpx solid #F2F2F7; }
}
</style>
