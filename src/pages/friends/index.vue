<script setup lang="ts">
import { ref } from 'vue'
import { useFriendsStore } from '@/stores/friends'
import { useGroupsStore } from '@/stores/groups'
import { useUserStore } from '@/stores/user'
import CustomTabBar from '@/components/CustomTabBar.vue'

const friendsStore = useFriendsStore()
const groupsStore = useGroupsStore()
const userStore = useUserStore()

// 群组表单
const showCreate = ref(false)
const showJoin = ref(false)
const groupName = ref('')
const groupDesc = ref('')
const joinCode = ref('')

async function doCreateGroup() {
  if (!groupName.value.trim()) {
    uni.showToast({ title: '请输入群名称', icon: 'error' })
    return
  }
  const r = await groupsStore.createGroup(groupName.value.trim(), groupDesc.value.trim())
  if (r.success) {
    uni.showToast({ title: '创建成功！群号: ' + r.group?.code, icon: 'success' })
    groupName.value = ''
    groupDesc.value = ''
    showCreate.value = false
  } else {
    uni.showToast({ title: r.message, icon: 'error' })
  }
}

async function doJoinGroup() {
  if (!joinCode.value.trim()) {
    uni.showToast({ title: '请输入群号', icon: 'error' })
    return
  }
  const r = await groupsStore.joinGroup(joinCode.value.trim())
  uni.showToast({ title: r.message, icon: r.success ? 'success' : 'error' })
  if (r.success) {
    joinCode.value = ''
    showJoin.value = false
  }
}
</script>

<template>
  <view class="container">
    <!-- 群组操作 -->
    <view class="action-row">
      <view class="action-btn" @click="showCreate = true; showJoin = false">
        <text class="action-icon">➕</text>
        <text class="action-label">创建群</text>
      </view>
      <view class="action-btn" @click="showJoin = true; showCreate = false">
        <text class="action-icon">🔗</text>
        <text class="action-label">加入群</text>
      </view>
      <view class="group-select" v-if="groupsStore.myGroups.length > 0">
        <text class="select-label">
          {{ groupsStore.currentGroup ? groupsStore.currentGroup.name : '全部用户' }}
        </text>
        <text class="select-arrow">▼</text>
      </view>
    </view>

    <!-- 群组列表切换 -->
    <view class="group-chips" v-if="groupsStore.myGroups.length > 0">
      <view
        class="chip"
        :class="{ active: !groupsStore.currentGroup }"
        @click="groupsStore.setCurrentGroup(null)"
      >全部</view>
      <view
        v-for="g in groupsStore.myGroups"
        :key="g.id"
        class="chip"
        :class="{ active: groupsStore.currentGroup?.id === g.id }"
        @click="groupsStore.setCurrentGroup(g)"
      >{{ g.name }}</view>
    </view>

    <!-- 创建群表单 -->
    <view class="card" v-if="showCreate">
      <text class="card-title">创建群组</text>
      <input class="form-input mb-2" v-model="groupName" placeholder="群名称" placeholder-style="color:#AEAEB2;font-size:28rpx" />
      <input class="form-input mb-2" v-model="groupDesc" placeholder="群描述（可选）" placeholder-style="color:#AEAEB2;font-size:28rpx" />
      <view class="form-btns">
        <view class="btn-secondary" @click="showCreate = false">取消</view>
        <view class="btn-primary" @click="doCreateGroup">创建</view>
      </view>
    </view>

    <!-- 加入群表单 -->
    <view class="card" v-if="showJoin">
      <text class="card-title">加入群组</text>
      <input class="form-input code-input mb-2" v-model="joinCode" placeholder="输入6位群号" placeholder-style="color:#AEAEB2;font-size:28rpx" maxlength="6" @confirm="doJoinGroup" />
      <view class="form-btns">
        <view class="btn-secondary" @click="showJoin = false">取消</view>
        <view class="btn-primary" @click="doJoinGroup">加入</view>
      </view>
    </view>

    <!-- 排行榜 -->
    <view class="card">
      <text class="card-title">🏆 减重排行</text>
      <text class="card-subtitle" v-if="groupsStore.currentGroup">
        {{ groupsStore.currentGroup.name }} · {{ groupsStore.currentGroup.members.length + 1 }}人
      </text>
      <text class="card-subtitle" v-else>以减重公斤数排序</text>

      <view v-if="friendsStore.leaderboard.length <= 1" class="empty-state">
        <text class="empty-icon">👋</text>
        <text class="empty-text">还没有好友数据</text>
        <text class="empty-hint">创建或加入群组，与好友一起减重！</text>
      </view>

      <view v-else class="rank-list">
        <view
          v-for="(friend, idx) in friendsStore.leaderboard"
          :key="friend.id"
          class="rank-item"
          :class="{ 'is-me': friend.id === userStore.userInfo.id }"
        >
          <view class="rank-num" :class="'rank-' + (idx + 1)">
            {{ idx + 1 }}
          </view>
          <view class="rank-avatar">
            <text class="avatar-text">{{ friend.nickname?.charAt(0) || '?' }}</text>
          </view>
          <view class="rank-info">
            <text class="rank-name">
              {{ friend.nickname || '用户' }}
              <text v-if="friend.id === userStore.userInfo.id" class="me-tag">我</text>
            </text>
            <text class="rank-detail">
              {{ friend.currentWeight || '--' }}kg
              <text class="rank-change" :class="friend.totalWeightLost > 0 ? 'down' : ''">
                {{ friend.totalWeightLost > 0 ? '↓' : '' }}{{ friend.totalWeightLost }}kg
              </text>
            </text>
          </view>
          <view class="rank-streak">{{ friend.streakDays }}天</view>
        </view>
      </view>
    </view>
  </view>
  <CustomTabBar current="pages/friends/index" />
</template>

<style lang="scss" scoped>
.action-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  &:active { background: #F2F2F7; transform: scale(0.97); }
}

.action-icon { font-size: 28rpx; }
.action-label { font-size: 24rpx; color: #1D1D1F; font-weight: 500; }

.group-select {
  flex: 1;
  text-align: right;
}

.select-label { font-size: 24rpx; color: #86868B; }
.select-arrow { font-size: 18rpx; color: #AEAEB2; margin-left: 4rpx; }

.group-chips {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  overflow-x: auto;
}

.chip {
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  background: #FFFFFF;
  color: #86868B;
  white-space: nowrap;
  flex-shrink: 0;

  &.active {
    background: #007AFF;
    color: #FFF;
  }
}

.card-title {
  font-size: 30rpx; font-weight: 600; color: #1D1D1F;
  display: block; margin-bottom: 24rpx;
}

.card-subtitle {
  display: block; font-size: 24rpx; color: #AEAEB2;
  margin-top: -16rpx; margin-bottom: 20rpx;
}

.form-input {
  background: #F2F2F7; border-radius: 12rpx; padding: 24rpx;
  font-size: 28rpx; color: #1D1D1F; width: 100%;
}
.code-input { font-size: 40rpx; text-align: center; letter-spacing: 12rpx; font-weight: 700; }

.form-btns { display: flex; gap: 16rpx;
  .btn-secondary, .btn-primary { flex: 1; text-align: center; }
}

.rank-list { display: flex; flex-direction: column; gap: 4rpx; }

.rank-item {
  display: flex; align-items: center; gap: 14rpx;
  padding: 18rpx 0; border-bottom: 1rpx solid #F2F2F7;
  &:last-child { border-bottom: none; }
  &.is-me {
    background: rgba(0, 122, 255, 0.04); margin: 0 -32rpx;
    padding: 18rpx 32rpx; border-radius: 12rpx;
  }
}

.rank-num {
  width: 44rpx; height: 44rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 24rpx; font-weight: 700; color: #86868B; background: #F2F2F7;
  flex-shrink: 0;
  &.rank-1 { background: #FFD700; color: #FFF; }
  &.rank-2 { background: #C0C0C0; color: #FFF; }
  &.rank-3 { background: #CD7F32; color: #FFF; }
}

.rank-avatar {
  width: 56rpx; height: 56rpx; border-radius: 50%;
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.avatar-text { color: #FFF; font-size: 24rpx; font-weight: 600; }

.rank-info { flex: 1; min-width: 0; }
.rank-name { font-size: 27rpx; color: #1D1D1F; font-weight: 500; }
.me-tag {
  font-size: 18rpx; color: #007AFF; background: rgba(0, 122, 255, 0.1);
  padding: 2rpx 8rpx; border-radius: 8rpx; margin-left: 6rpx;
}
.rank-detail { display: block; font-size: 22rpx; color: #86868B; margin-top: 3rpx; }
.rank-change { margin-left: 6rpx; &.down { color: #34C759; } }
.rank-streak { font-size: 22rpx; color: #AEAEB2; flex-shrink: 0; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 48rpx 0;
}
.empty-icon { font-size: 56rpx; margin-bottom: 12rpx; }
.empty-text { font-size: 27rpx; color: #AEAEB2; margin-bottom: 6rpx; }
.empty-hint { font-size: 23rpx; color: #AEAEB2; }
.page-content { padding-bottom: 120rpx; }
</style>
