<template>
  <view class="page">
    <view class="chart-card card">
      <view class="section-header">
        <text class="section-title">体重变化趋势</text>
        <view class="time-filter">
          <view 
            class="filter-item" 
            :class="{ active: currentFilter === 'week' }"
            @click="setFilter('week')"
          >
            近7天
          </view>
          <view 
            class="filter-item" 
            :class="{ active: currentFilter === 'month' }"
            @click="setFilter('month')"
          >
            近30天
          </view>
          <view 
            class="filter-item" 
            :class="{ active: currentFilter === 'all' }"
            @click="setFilter('all')"
          >
            全部
          </view>
        </view>
      </view>
      
      <view class="chart-container">
        <view class="y-axis">
          <text class="y-label" v-for="label in yLabels" :key="label">{{ label }}</text>
        </view>
        <view class="chart-area">
          <view class="grid-lines">
            <view class="grid-line" v-for="i in 5" :key="i"></view>
          </view>
          <view class="chart-line">
            <view 
              class="chart-point"
              v-for="(point, index) in chartData" 
              :key="index"
              :style="{ 
                left: point.x + '%', 
                bottom: point.y + '%' 
              }"
            >
              <view class="point-dot"></view>
              <view class="point-tooltip">{{ point.weight }}kg</view>
            </view>
            <svg class="line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline 
                :points="linePoints" 
                fill="none" 
                stroke="#007AFF" 
                stroke-width="0.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#007AFF" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#007AFF" stop-opacity="0.05"/>
                </linearGradient>
              </defs>
              <polygon :points="areaPoints" fill="url(#areaGradient)" />
            </svg>
          </view>
          <view class="x-axis">
            <text class="x-label" v-for="(label, index) in xLabels" :key="index">{{ label }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="stats-overview">
      <view class="stat-card card">
        <text class="stat-icon">📊</text>
        <text class="stat-label">平均每日减重</text>
        <text class="stat-value">{{ averageDailyLoss }}kg</text>
      </view>
      <view class="stat-card card">
        <text class="stat-icon">📈</text>
        <text class="stat-label">最大单日减重</text>
        <text class="stat-value">{{ maxDailyLoss }}kg</text>
      </view>
      <view class="stat-card card">
        <text class="stat-icon">🎯</text>
        <text class="stat-label">预计完成天数</text>
        <text class="stat-value">{{ estimatedDays }}天</text>
      </view>
      <view class="stat-card card">
        <text class="stat-icon">✅</text>
        <text class="stat-label">打卡率</text>
        <text class="stat-value">{{ checkinRate }}%</text>
      </view>
    </view>

    <view class="weekly-summary card">
      <text class="section-title">本周总结</text>
      <view class="summary-content">
        <view class="summary-item">
          <text class="summary-label">周一</text>
          <text class="summary-value">{{ getDayWeight('Monday') }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">周二</text>
          <text class="summary-value">{{ getDayWeight('Tuesday') }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">周三</text>
          <text class="summary-value">{{ getDayWeight('Wednesday') }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">周四</text>
          <text class="summary-value">{{ getDayWeight('Thursday') }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">周五</text>
          <text class="summary-value">{{ getDayWeight('Friday') }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">周六</text>
          <text class="summary-value">{{ getDayWeight('Saturday') }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">周日</text>
          <text class="summary-value">{{ getDayWeight('Sunday') }}</text>
        </view>
      </view>
      <view class="week-total">
        <text class="week-label">本周总计</text>
        <text class="week-value" :class="weekLoss >= 0 ? 'loss' : 'gain'">
          {{ weekLoss >= 0 ? '-' : '+' }}{{ Math.abs(weekLoss).toFixed(1) }}kg
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const currentFilter = ref('week')

const filteredRecords = computed(() => {
  const records = [...userStore.weightRecords].sort((a, b) => a.date.localeCompare(b.date))
  const now = new Date()
  
  if (currentFilter.value === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return records.filter(r => new Date(r.date) >= weekAgo)
  } else if (currentFilter.value === 'month') {
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    return records.filter(r => new Date(r.date) >= monthAgo)
  }
  return records
})

const chartData = computed(() => {
  const records = filteredRecords.value
  if (records.length === 0) return []
  
  const weights = records.map(r => r.weight)
  const minWeight = Math.min(...weights) - 1
  const maxWeight = Math.max(...weights) + 1
  
  return records.map((record, index) => ({
    date: record.date,
    weight: record.weight,
    x: (index / (records.length - 1 || 1)) * 90 + 5,
    y: ((record.weight - minWeight) / (maxWeight - minWeight)) * 80 + 5
  }))
})

const linePoints = computed(() => {
  return chartData.value.map(p => `${p.x},${100 - p.y}`).join(' ')
})

const areaPoints = computed(() => {
  if (chartData.value.length === 0) return ''
  const points = chartData.value.map(p => `${p.x},${100 - p.y}`).join(' ')
  const firstX = chartData.value[0].x
  const lastX = chartData.value[chartData.value.length - 1].x
  return `${firstX},100 ${points} ${lastX},100`
})

const yLabels = computed(() => {
  const records = filteredRecords.value
  if (records.length === 0) return ['0', '0', '0', '0', '0']
  
  const weights = records.map(r => r.weight)
  const minWeight = Math.floor(Math.min(...weights))
  const maxWeight = Math.ceil(Math.max(...weights))
  const step = (maxWeight - minWeight) / 4
  
  return [maxWeight, maxWeight - step, maxWeight - 2 * step, maxWeight - 3 * step, minWeight]
    .map(v => Math.round(v))
})

const xLabels = computed(() => {
  const records = filteredRecords.value
  if (records.length === 0) return []
  
  const step = Math.ceil(records.length / 5)
  return records.filter((_, index) => index % step === 0 || index === records.length - 1)
    .map(r => {
      const date = new Date(r.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })
})

const averageDailyLoss = computed(() => {
  const records = filteredRecords.value
  if (records.length < 2) return '0.0'
  
  const firstWeight = records[0].weight
  const lastWeight = records[records.length - 1].weight
  const days = (new Date(records[records.length - 1].date).getTime() - new Date(records[0].date).getTime()) / (1000 * 60 * 60 * 24)
  
  if (days <= 0) return '0.0'
  return ((firstWeight - lastWeight) / days).toFixed(2)
})

const maxDailyLoss = computed(() => {
  const records = filteredRecords.value
  if (records.length < 2) return '0.0'
  
  let maxLoss = 0
  for (let i = 1; i < records.length; i++) {
    const loss = records[i - 1].weight - records[i].weight
    if (loss > maxLoss) maxLoss = loss
  }
  return maxLoss.toFixed(1)
})

const estimatedDays = computed(() => {
  const avgLoss = parseFloat(averageDailyLoss.value)
  const remaining = parseFloat(userStore.remainingWeight)
  
  if (avgLoss <= 0) return '--'
  return Math.ceil(remaining / avgLoss)
})

const checkinRate = computed(() => {
  const records = userStore.weightRecords
  if (records.length === 0) return '0'
  
  const firstDate = new Date(Math.min(...records.map(r => new Date(r.date).getTime())))
  const today = new Date()
  const totalDays = Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  return Math.round((records.length / totalDays) * 100)
})

const weekLoss = computed(() => {
  const today = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const weekRecords = userStore.weightRecords.filter(
    r => new Date(r.date) >= weekAgo && new Date(r.date) <= today
  ).sort((a, b) => a.date.localeCompare(b.date))
  
  if (weekRecords.length < 2) return 0
  return weekRecords[0].weight - weekRecords[weekRecords.length - 1].weight
})

function setFilter(filter: string) {
  currentFilter.value = filter
}

function getDayWeight(dayName: string) {
  const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayName)
  const today = new Date()
  const targetDate = new Date(today)
  
  while (targetDate.getDay() !== dayIndex) {
    targetDate.setDate(targetDate.getDate() - 1)
  }
  
  const record = userStore.weightRecords.find(r => r.date === targetDate.toISOString().split('T')[0])
  return record ? `${record.weight}kg` : '--'
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.time-filter {
  display: flex;
  background: $apple-light-gray;
  border-radius: 12rpx;
  padding: 6rpx;
}

.filter-item {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: $apple-text-muted;
  border-radius: 8rpx;
  
  &.active {
    background: $apple-gray;
    color: $apple-blue;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  }
}

.chart-container {
  display: flex;
  height: 440rpx;
}

.y-axis {
  width: 72rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 16rpx;
  
  .y-label {
    font-size: 22rpx;
    color: $apple-text-muted;
    text-align: right;
  }
}

.chart-area {
  flex: 1;
  position: relative;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 48rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  .grid-line {
    height: 1rpx;
    background: $apple-border;
  }
}

.chart-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 48rpx;
}

.line-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.chart-point {
  position: absolute;
  transform: translate(-50%, 50%);
  
  .point-dot {
    width: 20rpx;
    height: 20rpx;
    background: $apple-blue;
    border-radius: 50%;
    border: 4rpx solid $apple-gray;
    box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.4);
  }
  
  .point-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-size: 22rpx;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    white-space: nowrap;
    margin-bottom: 12rpx;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover .point-tooltip {
    opacity: 1;
  }
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48rpx;
  display: flex;
  justify-content: space-between;
  
  .x-label {
    font-size: 22rpx;
    color: $apple-text-muted;
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  text-align: center;
  padding: 28rpx;
  
  .stat-icon {
    font-size: 48rpx;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .stat-label {
    font-size: 26rpx;
    color: $apple-text-muted;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .stat-value {
    font-size: 36rpx;
    font-weight: 700;
    color: $apple-blue;
  }
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.summary-item {
  text-align: center;
  
  .summary-label {
    font-size: 24rpx;
    color: $apple-text-muted;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .summary-value {
    font-size: 28rpx;
    font-weight: 600;
    color: $apple-text;
  }
}

.week-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  border-top: 1rpx solid $apple-border;
  
  .week-label {
    font-size: 30rpx;
    color: $apple-text-secondary;
  }
  
  .week-value {
    font-size: 40rpx;
    font-weight: 700;
    
    &.loss {
      color: $apple-green;
    }
    
    &.gain {
      color: $apple-red;
    }
  }
}
</style>
