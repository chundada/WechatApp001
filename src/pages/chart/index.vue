<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 按日期排序的记录
const sortedRecords = computed(() =>
  [...userStore.weightRecords].sort((a, b) => a.date.localeCompare(b.date))
)

// 图表数据（最近30条）
const chartData = computed(() => {
  const records = sortedRecords.value.slice(-30)
  if (records.length === 0) return { labels: [], values: [], min: 0, max: 100 }

  const values = records.map(r => r.weight)
  const min = Math.floor(Math.min(...values) - 2)
  const max = Math.ceil(Math.max(...values) + 2)
  const labels = records.map(r => r.date.slice(5)) // MM-DD

  return { labels, values, min, max }
})

// 计算变化趋势
const weeklyChange = computed(() => {
  const records = sortedRecords.value
  if (records.length < 2) return null
  const latest = records[records.length - 1]
  const weekAgo = records[Math.max(0, records.length - 8)]
  const diff = latest.weight - weekAgo.weight
  return diff.toFixed(1)
})

// 统计
const stats = computed(() => {
  const records = sortedRecords.value
  return {
    total: records.length,
    avg: records.length > 0
      ? (records.reduce((s, r) => s + r.weight, 0) / records.length).toFixed(1)
      : '--',
    lowest: records.length > 0
      ? Math.min(...records.map(r => r.weight)).toFixed(1)
      : '--'
  }
})

// 简易柱状图高度百分比
function barHeight(value: number): string {
  const { min, max } = chartData.value
  if (max === min) return '50%'
  return ((value - min) / (max - min) * 80 + 10).toFixed(0) + '%'
}
</script>

<template>
  <view class="container">
    <!-- 统计卡片 -->
    <view class="stats-row">
      <view class="stat-card">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">记录次数</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.avg }}</text>
        <text class="stat-label">平均体重 kg</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.lowest }}</text>
        <text class="stat-label">最低体重 kg</text>
      </view>
    </view>

    <!-- 体重趋势 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">📈 体重趋势</text>
        <text v-if="weeklyChange" class="trend-badge" :class="parseFloat(weeklyChange) <= 0 ? 'down' : 'up'">
          {{ parseFloat(weeklyChange) <= 0 ? '⬇' : '⬆' }} {{ Math.abs(parseFloat(weeklyChange)) }} kg/周
        </text>
      </view>

      <view v-if="chartData.values.length < 2" class="empty-state">
        <text class="empty-icon">📊</text>
        <text class="empty-text">至少需要2条记录才能显示趋势图</text>
      </view>

      <view v-else class="chart-area">
        <!-- Y轴标签 -->
        <view class="chart-yaxis">
          <text class="axis-label">{{ chartData.max }}</text>
          <text class="axis-label">{{ chartData.min }}</text>
        </view>

        <!-- 柱状图 -->
        <view class="chart-bars">
          <view
            v-for="(val, idx) in chartData.values"
            :key="idx"
            class="bar-wrapper"
          >
            <text class="bar-value" v-if="idx % 3 === 0 || idx === chartData.values.length - 1">{{ val }}</text>
            <view
              class="bar"
              :style="{ height: barHeight(val) }"
            >
              <view class="bar-fill"></view>
            </view>
            <text class="bar-label" v-if="idx % 3 === 0 || idx === chartData.values.length - 1">{{ chartData.labels[idx] }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 进度条 -->
    <view class="card" v-if="userStore.userInfo.startWeight > 0">
      <text class="card-title">🎯 减重进度</text>
      <view class="progress-info">
        <text>已减 {{ userStore.totalWeightLost }} kg</text>
        <text>目标 {{ userStore.remainingWeight }} kg</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: userStore.progress + '%' }"></view>
      </view>
      <text class="progress-text">{{ userStore.progress }}% 完成</text>
    </view>

    <!-- 身体数据 -->
    <view class="card">
      <text class="card-title">📏 身体数据</text>
      <view class="body-data">
        <view class="body-item">
          <text class="body-label">BMI</text>
          <text class="body-value">{{ userStore.bmi }}</text>
        </view>
        <view class="body-item">
          <text class="body-label">连续打卡</text>
          <text class="body-value">{{ userStore.streakDays }} 天</text>
        </view>
        <view class="body-item">
          <text class="body-label">总减重</text>
          <text class="body-value">{{ userStore.totalWeightLost }} kg</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #007AFF;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #86868B;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1D1D1F;
  display: block;
}

.trend-badge {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 500;

  &.down {
    background: rgba(52, 199, 89, 0.1);
    color: #34C759;
  }

  &.up {
    background: rgba(255, 59, 48, 0.1);
    color: #FF3B30;
  }
}

.chart-area {
  display: flex;
  height: 360rpx;
  gap: 12rpx;
}

.chart-yaxis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 48rpx;
}

.axis-label {
  font-size: 20rpx;
  color: #AEAEB2;
  text-align: right;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 4rpx;
  flex: 1;
  overflow-x: auto;
  padding-bottom: 32rpx;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40rpx;
  flex-shrink: 0;
}

.bar-value {
  font-size: 18rpx;
  color: #86868B;
  margin-bottom: 4rpx;
}

.bar {
  width: 28rpx;
  height: 100%;
  display: flex;
  align-items: flex-end;
  border-radius: 8rpx 8rpx 0 0;
  overflow: hidden;
  background: rgba(0, 122, 255, 0.08);
}

.bar-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #007AFF, #5AC8FA);
  border-radius: 8rpx 8rpx 0 0;
  animation: growUp 0.6s ease;
}

@keyframes growUp {
  from { height: 0; }
}

.bar-label {
  font-size: 18rpx;
  color: #AEAEB2;
  margin-top: 4rpx;
  position: absolute;
  bottom: 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #86868B;
  margin-bottom: 16rpx;
}

.progress-bar {
  height: 12rpx;
  background: #E5E5EA;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5AC8FA);
  border-radius: 6rpx;
  transition: width 0.6s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #007AFF;
  font-weight: 500;
}

.body-data {
  display: flex;
  justify-content: space-around;
}

.body-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.body-label {
  font-size: 24rpx;
  color: #86868B;
  margin-bottom: 8rpx;
}

.body-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1D1D1F;
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
  color: #AEAEB2;
}
</style>
