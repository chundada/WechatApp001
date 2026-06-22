<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import CustomTabBar from '@/components/CustomTabBar.vue'

const userStore = useUserStore()

const weight = ref('')
const note = ref('')
const today = new Date().toISOString().split('T')[0]

// 上次记录
const lastRecord = computed(() => {
  const records = userStore.weightRecords
  return records.length > 0 ? records[records.length - 1] : null
})

// 与上次的差值
const diffFromLast = computed(() => {
  if (!lastRecord.value || !weight.value) return null
  const diff = parseFloat(weight.value) - lastRecord.value.weight
  return diff.toFixed(1)
})

// 今天是否已记录
const todayRecorded = computed(() => {
  return userStore.weightRecords.some(r => r.date === today)
})

function addDigit(d: string) {
  if (weight.value.length >= 5) return
  if (d === '.' && weight.value.includes('.')) return
  if (d === '.' && weight.value === '') {
    weight.value = '0.'
    return
  }
  weight.value += d
}

function delDigit() {
  weight.value = weight.value.slice(0, -1)
}

function clearWeight() {
  weight.value = ''
  note.value = ''
}

function submitRecord() {
  const w = parseFloat(weight.value)
  if (isNaN(w) || w <= 0 || w > 300) {
    uni.showToast({ title: '请输入有效体重', icon: 'error' })
    return
  }
  userStore.addWeightRecord(w, note.value)
  uni.showToast({ title: '记录成功！', icon: 'success' })
  weight.value = ''
  note.value = ''
}

// 已记录日期列表
const recordedDates = computed(() => {
  return userStore.weightRecords.map(r => r.date)
})
</script>

<template>
  <view class="page">
    <!-- 体重显示区 -->
    <view class="weight-area">
      <text class="today-label">{{ today }}</text>
      <view class="weight-display">
        <text v-if="weight" class="weight-value">{{ weight }}</text>
        <text v-else class="weight-placeholder">0.0</text>
        <text class="weight-unit">kg</text>
      </view>

      <!-- 差值提示 -->
      <view v-if="diffFromLast" class="diff-badge" :class="parseFloat(diffFromLast) <= 0 ? 'down' : 'up'">
        {{ parseFloat(diffFromLast) <= 0 ? '↓' : '↑' }} {{ Math.abs(parseFloat(diffFromLast)) }} kg 对比上次
      </view>
      <view v-else-if="lastRecord" class="diff-badge neutral">
        上次: {{ lastRecord.weight }} kg
      </view>

      <!-- 今日已记录标识 -->
      <view v-if="todayRecorded && !weight" class="recorded-tag">✅ 今日已记录</view>
    </view>

    <!-- 数字键盘 -->
    <view class="keypad">
      <view class="key-row">
        <view class="key" @click="addDigit('1')">1</view>
        <view class="key" @click="addDigit('2')">2</view>
        <view class="key" @click="addDigit('3')">3</view>
      </view>
      <view class="key-row">
        <view class="key" @click="addDigit('4')">4</view>
        <view class="key" @click="addDigit('5')">5</view>
        <view class="key" @click="addDigit('6')">6</view>
      </view>
      <view class="key-row">
        <view class="key" @click="addDigit('7')">7</view>
        <view class="key" @click="addDigit('8')">8</view>
        <view class="key" @click="addDigit('9')">9</view>
      </view>
      <view class="key-row">
        <view class="key key-func" @click="addDigit('.')">.</view>
        <view class="key" @click="addDigit('0')">0</view>
        <view class="key key-del" @click="delDigit">⌫</view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="note-bar">
      <input
        class="note-input"
        v-model="note"
        placeholder="添加备注 (如：空腹、运动后)"
        placeholder-style="color:rgba(255,255,255,0.5);font-size:28rpx"
      />
    </view>

    <!-- 操作按钮 -->
    <view class="action-btns">
      <view class="btn-clear" @click="clearWeight" v-if="weight">清除</view>
      <view class="btn-save" @click="submitRecord" :class="{ disabled: !weight }">
        💾 保存记录
      </view>
    </view>

    <!-- 最近记录预览 -->
    <view class="recent-preview">
      <text class="preview-title">📅 最近记录</text>
      <view class="preview-list">
        <view
          v-for="r in userStore.weightRecords.slice(-7).reverse()"
          :key="r.id"
          class="preview-item"
        >
          <text class="preview-date">{{ r.date.slice(5) }}</text>
          <text class="preview-weight">{{ r.weight }} kg</text>
          <text class="preview-note" v-if="r.note">{{ r.note }}</text>
        </view>
        <view v-if="userStore.weightRecords.length === 0" class="preview-empty">
          还没有记录，开始你的第一次打卡吧！
        </view>
      </view>
    </view>
  </view>
  <CustomTabBar current="pages/record/index" />
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #007AFF 0%, #5856D6 60%, #F2F2F7 60%);
  display: flex;
  flex-direction: column;
}

.weight-area {
  padding: 60rpx 48rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.today-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20rpx;
}

.weight-display {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.weight-value {
  font-size: 120rpx;
  font-weight: 200;
  color: #FFFFFF;
  font-family: 'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif;
  line-height: 1;
}

.weight-placeholder {
  font-size: 120rpx;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.3);
  line-height: 1;
}

.weight-unit {
  font-size: 48rpx;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
}

.diff-badge {
  font-size: 26rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-weight: 500;

  &.down {
    background: rgba(52, 199, 89, 0.2);
    color: #30D158;
  }
  &.up {
    background: rgba(255, 59, 48, 0.2);
    color: #FF453A;
  }
  &.neutral {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }
}

.recorded-tag {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.15);
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
}

/* 数字键盘 */
.keypad {
  padding: 0 48rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.key-row {
  display: flex;
  gap: 16rpx;
}

.key {
  flex: 1;
  height: 96rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 300;
  color: #FFFFFF;

  &:active {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0.95);
  }
}

.key-func, .key-del {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.7);
}

.note-bar {
  padding: 24rpx 48rpx;
}

.note-input { line-height: 1.4;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  width: 100%;
}

.action-btns {
  display: flex;
  gap: 16rpx;
  padding: 0 48rpx 24rpx;
}

.btn-clear {
  padding: 24rpx 40rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  text-align: center;
  flex-shrink: 0;
}

.btn-save {
  flex: 1;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #34C759;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
  text-align: center;

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }

  &.disabled {
    opacity: 0.4;
  }
}

/* 最近记录 */
.recent-preview {
  flex: 1;
  background: #F2F2F7;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 32rpx 48rpx;
}

.preview-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1D1D1F;
  margin-bottom: 16rpx;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.preview-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  gap: 16rpx;
}

.preview-date {
  font-size: 24rpx;
  color: #86868B;
  width: 100rpx;
}

.preview-weight {
  font-size: 28rpx;
  font-weight: 600;
  color: #1D1D1F;
  flex: 1;
}

.preview-note {
  font-size: 22rpx;
  color: #AEAEB2;
}

.preview-empty {
  text-align: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #AEAEB2;
}
.page-content { padding-bottom: 120rpx; }
</style>
