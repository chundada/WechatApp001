<template>
  <view class="page">
    <view class="add-section">
      <view class="add-card card">
        <text class="add-title">添加体重记录</text>
        <view class="input-group">
          <view class="weight-input-wrapper">
            <input 
              class="weight-input" 
              type="digit" 
              placeholder="请输入体重" 
              v-model="inputWeight"
            />
            <text class="weight-unit">kg</text>
          </view>
          <input 
            class="note-input" 
            placeholder="今日备注（可选）" 
            v-model="inputNote"
          />
        </view>
        <button class="submit-btn btn-primary" @click="addRecord">保存记录</button>
      </view>
    </view>

    <view class="history-section">
      <view class="section-header">
        <text class="section-title">历史记录</text>
        <text class="record-count">共 {{ userStore.weightRecords.length }} 条</text>
      </view>
      
      <view class="record-list">
        <view 
          class="record-item card" 
          v-for="(record, index) in sortedRecords" 
          :key="record.id"
        >
          <view class="record-header">
            <text class="record-date">{{ formatDate(record.date) }}</text>
            <text class="record-weight">{{ record.weight }}kg</text>
          </view>
          <text class="record-note" v-if="record.note">{{ record.note }}</text>
          <view class="record-trend" v-if="index < sortedRecords.length - 1">
            <text 
              class="trend-text" 
              :class="getTrendClass(record.weight, sortedRecords[index + 1].weight)"
            >
              {{ getTrendText(record.weight, sortedRecords[index + 1].weight) }}
            </text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="userStore.weightRecords.length === 0">
        <text class="empty-icon">📝</text>
        <text class="empty-text">还没有体重记录</text>
        <text class="empty-hint">开始记录你的减肥之旅吧</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const inputWeight = ref('')
const inputNote = ref('')

const sortedRecords = computed(() => {
  return [...userStore.weightRecords].sort((a, b) => b.date.localeCompare(a.date))
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = '日一二三四五六'[date.getDay()]
  return `${month}月${day}日 周${weekDay}`
}

function getTrendClass(current: number, previous: number) {
  if (current < previous) return 'trend-down'
  if (current > previous) return 'trend-up'
  return 'trend-same'
}

function getTrendText(current: number, previous: number) {
  const diff = previous - current
  if (diff > 0) return `↓${diff.toFixed(1)}kg`
  if (diff < 0) return `↑${Math.abs(diff).toFixed(1)}kg`
  return '→ 持平'
}

function addRecord() {
  const weight = parseFloat(inputWeight.value)
  if (!weight || weight <= 0) {
    uni.showToast({ title: '请输入有效体重', icon: 'none' })
    return
  }
  
  userStore.addWeightRecord(weight, inputNote.value)
  uni.showToast({ title: '记录成功', icon: 'success' })
  inputWeight.value = ''
  inputNote.value = ''
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

.add-section {
  margin-bottom: 40rpx;
}

.add-card {
  background: linear-gradient(135deg, $apple-purple 0%, $apple-blue 100%);
  color: #fff;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 
    0 8rpx 32rpx rgba(175, 82, 222, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
  
  .add-title {
    font-size: 36rpx;
    font-weight: 700;
    margin-bottom: 32rpx;
    display: block;
  }
}

.input-group {
  margin-bottom: 28rpx;
}

.weight-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.weight-input {
  flex: 1;
  font-size: 48rpx;
  font-weight: 300;
  color: #fff;
  background: transparent;
  letter-spacing: -1rpx;
}

.weight-unit {
  font-size: 36rpx;
  opacity: 0.7;
  font-weight: 500;
}

.note-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  padding: 28rpx;
  font-size: 30rpx;
  color: #fff;
}

.submit-btn {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $apple-text;
}

.record-count {
  font-size: 26rpx;
  color: $apple-text-muted;
}

.record-list {
  .record-item {
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  
  .record-date {
    font-size: 30rpx;
    color: $apple-text-secondary;
  }
  
  .record-weight {
    font-size: 40rpx;
    font-weight: 700;
    color: $apple-blue;
  }
}

.record-note {
  font-size: 28rpx;
  color: $apple-text-muted;
  margin-bottom: 16rpx;
  display: block;
}

.record-trend {
  .trend-text {
    font-size: 24rpx;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-weight: 500;
    
    &.trend-down {
      color: $apple-green;
      background: rgba(52, 199, 89, 0.15);
    }
    
    &.trend-up {
      color: $apple-red;
      background: rgba(255, 59, 48, 0.15);
    }
    
    &.trend-same {
      color: $apple-text-muted;
      background: $apple-light-gray;
    }
  }
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
</style>
