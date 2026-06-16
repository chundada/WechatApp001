<template>
  <view class="page">
    <view class="group-banner" v-if="groupsStore.currentGroup">
      <view class="group-info">
        <text class="group-icon">👥</text>
        <view class="group-detail">
          <text class="group-name">{{ groupsStore.currentGroup.name }}</text>
          <text class="group-members">{{ groupsStore.currentGroup.members.length }} 名群成员</text>
        </view>
      </view>
      <text class="group-code">群号: {{ groupsStore.currentGroup.code }}</text>
    </view>

    <view class="leaderboard-section">
      <view class="section-header">
        <text class="section-title">减重排行榜</text>
        <text class="update-time">今日更新</text>
      </view>
      
      <view class="leaderboard-list">
        <view 
          class="leaderboard-item card" 
          v-for="(item, index) in friendsStore.leaderboard" 
          :key="item.id"
        >
          <view class="rank-badge" :class="getRankClass(index)">
            {{ index + 1 }}
          </view>
          <view class="friend-avatar">
            <text class="avatar-icon">{{ item.id === '1' ? '👤' : '👥' }}</text>
          </view>
          <view class="friend-info">
            <text class="friend-name">{{ item.nickname }}</text>
            <view class="friend-progress">
              <view class="mini-progress-bar">
                <view 
                  class="mini-progress-fill" 
                  :style="{ width: getFriendProgress(item) + '%' }"
                ></view>
              </view>
              <text class="progress-text">{{ getFriendProgress(item) }}%</text>
            </view>
          </view>
          <view class="friend-stats">
            <text class="friend-weight">{{ item.currentWeight }}kg</text>
            <text class="friend-loss" :class="{ highlight: item.id === '1' }">
              -{{ item.totalWeightLost }}kg
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="compare-section">
      <text class="section-title">好友对比</text>
      
      <view class="compare-card card">
        <view class="compare-header">
          <text class="compare-title">与好友对比</text>
        </view>
        
        <view class="compare-list">
          <view 
            class="compare-item" 
            v-for="friend in friendsStore.groupFriends" 
            :key="friend.id"
          >
            <view class="friend-avatar small">
              <text class="avatar-icon">👥</text>
            </view>
            <view class="compare-info">
              <text class="friend-name">{{ friend.nickname }}</text>
              <text class="friend-detail">
                当前 {{ friend.currentWeight }}kg · 目标 {{ friend.targetWeight }}kg
              </text>
            </view>
            <view class="compare-result">
              <text 
                class="compare-text" 
                :class="getCompareClass(friend)"
              >
                {{ getCompareText(friend) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="my-rank card">
      <view class="rank-header">
        <text class="rank-icon">🏆</text>
        <text class="rank-title">我的排名</text>
      </view>
      <view class="rank-content">
        <view class="rank-position">
          <text class="rank-number">{{ myRank }}</text>
          <text class="rank-label">名</text>
        </view>
        <view class="rank-stats">
          <view class="rank-stat">
            <text class="stat-value">{{ userStore.totalWeightLost }}kg</text>
            <text class="stat-label">累计减重</text>
          </view>
          <view class="rank-stat">
            <text class="stat-value">{{ userStore.streakDays }}天</text>
            <text class="stat-label">连续打卡</text>
          </view>
        </view>
      </view>
    </view>

    <view class="action-section">
      <button class="invite-btn btn-primary" @click="inviteFriends">
        <text class="btn-icon">👋</text>
        邀请好友一起减肥
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useFriendsStore } from '@/stores/friends'
import { useGroupsStore } from '@/stores/groups'

const userStore = useUserStore()
const friendsStore = useFriendsStore()
const groupsStore = useGroupsStore()

const myRank = computed(() => {
  const leaderboard = friendsStore.leaderboard
  const myIndex = leaderboard.findIndex(item => item.id === userStore.userInfo.id)
  return myIndex >= 0 ? myIndex + 1 : '--'
})

function getRankClass(index: number) {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}

function getFriendProgress(friend: { startWeight: number; targetWeight: number; currentWeight: number }) {
  const total = friend.startWeight - friend.targetWeight
  const lost = friend.startWeight - friend.currentWeight
  if (total <= 0) return 100
  return Math.min(Math.round((lost / total) * 100), 100)
}

function getCompareClass(friend: { totalWeightLost: number }) {
  const myLost = parseFloat(userStore.totalWeightLost)
  if (friend.totalWeightLost > myLost) return 'behind'
  if (friend.totalWeightLost < myLost) return 'ahead'
  return 'equal'
}

function getCompareText(friend: { totalWeightLost: number }) {
  const myLost = parseFloat(userStore.totalWeightLost)
  const diff = myLost - friend.totalWeightLost
  
  if (diff > 0) return `领先 ${diff.toFixed(1)}kg`
  if (diff < 0) return `落后 ${Math.abs(diff).toFixed(1)}kg`
  return '持平'
}

function inviteFriends() {
  uni.showToast({
    title: '邀请功能开发中',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/global.scss';

.page {
  min-height: 100vh;
  background: $apple-light-gray;
  padding: 32rpx;
  padding-bottom: 180rpx;
}

.group-banner {
  background: $apple-white;
  color: $apple-text;
  padding: 28rpx;
  border-radius: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  
  .group-info {
    display: flex;
    align-items: center;
    
    .group-icon {
      font-size: 44rpx;
      margin-right: 20rpx;
    }
    
    .group-detail {
      .group-name {
        font-size: 32rpx;
        font-weight: 600;
        display: block;
      }
      
      .group-members {
        font-size: 24rpx;
        color: $apple-text-muted;
      }
    }
  }
  
  .group-code {
    font-size: 26rpx;
    font-weight: 700;
    font-family: SF Mono, monospace;
    color: $apple-blue;
    letter-spacing: 2rpx;
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

.update-time {
  font-size: 26rpx;
  color: $apple-text-muted;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: $apple-white;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:active {
    background: $apple-light-gray;
  }
}

.rank-badge {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: $apple-light-gray;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  color: $apple-text-secondary;
  margin-right: 24rpx;
  
  &.gold {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(255, 215, 0, 0.4);
  }
  
  &.silver {
    background: linear-gradient(135deg, #E8E8E8, #C0C0C0);
    color: $apple-text;
    box-shadow: 0 4rpx 16rpx rgba(200, 200, 200, 0.4);
  }
  
  &.bronze {
    background: linear-gradient(135deg, #CD7F32, #B87333);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(205, 127, 50, 0.4);
  }
}

.friend-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $apple-blue, $apple-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  
  &.small {
    width: 72rpx;
    height: 72rpx;
  }
  
  .avatar-icon {
    font-size: 44rpx;
  }
}

.friend-info {
  flex: 1;
  
  .friend-name {
    font-size: 32rpx;
    font-weight: 600;
    color: $apple-text;
    display: block;
    margin-bottom: 12rpx;
  }
}

.friend-progress {
  display: flex;
  align-items: center;
  
  .mini-progress-bar {
    flex: 1;
    height: 8rpx;
    background: $apple-light-gray;
    border-radius: 4rpx;
    overflow: hidden;
    margin-right: 16rpx;
  }
  
  .mini-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, $apple-blue, $apple-cyan);
    border-radius: 4rpx;
  }
  
  .progress-text {
    font-size: 24rpx;
    color: $apple-text-muted;
    width: 72rpx;
    text-align: right;
  }
}

.friend-stats {
  text-align: right;
  
  .friend-weight {
    font-size: 28rpx;
    color: $apple-text-secondary;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .friend-loss {
    font-size: 32rpx;
    font-weight: 700;
    color: $apple-green;
    
    &.highlight {
      color: $apple-blue;
    }
  }
}

.compare-card {
  margin-bottom: 32rpx;
}

.compare-header {
  margin-bottom: 24rpx;
  
  .compare-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $apple-text;
  }
}

.compare-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $apple-border;
  
  &:last-child {
    border-bottom: none;
  }
}

.compare-info {
  flex: 1;
  margin-left: 20rpx;
  
  .friend-name {
    font-size: 30rpx;
    font-weight: 600;
    color: $apple-text;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .friend-detail {
    font-size: 24rpx;
    color: $apple-text-muted;
  }
}

.compare-result {
  .compare-text {
    font-size: 26rpx;
    padding: 10rpx 20rpx;
    border-radius: 24rpx;
    font-weight: 500;
    
    &.ahead {
      color: $apple-green;
      background: rgba(52, 199, 89, 0.15);
    }
    
    &.behind {
      color: $apple-red;
      background: rgba(255, 59, 48, 0.15);
    }
    
    &.equal {
      color: $apple-text-muted;
      background: $apple-light-gray;
    }
  }
}

.my-rank {
  background: linear-gradient(135deg, $apple-blue 0%, $apple-cyan 100%);
  color: #fff;
  text-align: center;
  padding: 40rpx;
  margin-bottom: 32rpx;
  border-radius: 32rpx;
  box-shadow: 
    0 8rpx 32rpx rgba(0, 122, 255, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
}

.rank-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  
  .rank-icon {
    font-size: 36rpx;
    margin-right: 16rpx;
  }
  
  .rank-title {
    font-size: 30rpx;
    font-weight: 600;
  }
}

.rank-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-position {
  margin-right: 60rpx;
  
  .rank-number {
    font-size: 80rpx;
    font-weight: 200;
    display: block;
    letter-spacing: -2rpx;
  }
  
  .rank-label {
    font-size: 26rpx;
    opacity: 0.8;
  }
}

.rank-stats {
  display: flex;
  
  .rank-stat {
    text-align: center;
    margin-left: 40rpx;
    
    &:first-child {
      margin-left: 0;
    }
    
    .stat-value {
      font-size: 36rpx;
      font-weight: 700;
      display: block;
    }
    
    .stat-label {
      font-size: 24rpx;
      opacity: 0.8;
    }
  }
}

.action-section {
  padding-top: 24rpx;
}

.invite-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .btn-icon {
    margin-right: 16rpx;
    font-size: 32rpx;
  }
}
</style>