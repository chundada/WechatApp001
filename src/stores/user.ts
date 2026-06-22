import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ===== 类型定义 =====
export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  currentWeight: number
  targetWeight: number
  startWeight: number
  height: number
  createTime: number
}

export interface WeightRecord {
  id: string
  userId: string
  weight: number
  date: string
  note: string
}

export interface Achievement {
  id: string
  type: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedTime?: number
}

// ===== 默认成就列表 =====
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first', type: 'first', name: '初次打卡', description: '完成第一次体重记录', icon: '🌟', unlocked: false },
  { id: 'week', type: 'week', name: '坚持一周', description: '连续打卡7天', icon: '📅', unlocked: false },
  { id: 'month', type: 'month', name: '坚持一月', description: '连续打卡30天', icon: '🏆', unlocked: false },
  { id: 'lose5', type: 'lose5', name: '减重5kg', description: '成功减重5公斤', icon: '🔥', unlocked: false },
  { id: 'lose10', type: 'lose10', name: '减重10kg', description: '成功减重10公斤', icon: '💪', unlocked: false },
  { id: 'perfect', type: 'perfect', name: '完美身材', description: '达到理想体重', icon: '👑', unlocked: false },
]

export const useUserStore = defineStore('user', () => {
  // ===== 状态 =====
  const userInfo = ref<UserInfo>({
    id: '',
    nickname: '',
    avatar: '',
    currentWeight: 0,
    targetWeight: 0,
    startWeight: 0,
    height: 0,
    createTime: Date.now()
  })

  const weightRecords = ref<WeightRecord[]>([])
  const achievements = ref<Achievement[]>(DEFAULT_ACHIEVEMENTS.map(a => ({ ...a })))

  // ===== 计算属性 =====
  const bmi = computed(() => {
    const h = userInfo.value.height / 100
    if (h <= 0 || !userInfo.value.currentWeight) return '--'
    return (userInfo.value.currentWeight / (h * h)).toFixed(1)
  })

  const totalWeightLost = computed(() => {
    if (!userInfo.value.startWeight || !userInfo.value.currentWeight) return '0'
    return (userInfo.value.startWeight - userInfo.value.currentWeight).toFixed(1)
  })

  const remainingWeight = computed(() => {
    if (!userInfo.value.currentWeight || !userInfo.value.targetWeight) return '0'
    return (userInfo.value.currentWeight - userInfo.value.targetWeight).toFixed(1)
  })

  const progress = computed(() => {
    const total = userInfo.value.startWeight - userInfo.value.targetWeight
    const lost = userInfo.value.startWeight - userInfo.value.currentWeight
    if (total <= 0) return userInfo.value.currentWeight <= userInfo.value.targetWeight ? 100 : 0
    return Math.min(Math.round((lost / total) * 100), 100)
  })

  const streakDays = computed(() => {
    if (weightRecords.value.length === 0) return 0
    const sorted = [...weightRecords.value].sort((a, b) => b.date.localeCompare(a.date))
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i].date)
      d.setHours(0, 0, 0, 0)
      const expected = new Date(today)
      expected.setDate(expected.getDate() - i)
      if (d.getTime() === expected.getTime()) {
        streak++
      } else {
        break
      }
    }
    return streak
  })

  const unlockedAchievements = computed(() =>
    achievements.value.filter(a => a.unlocked)
  )

  // ===== 方法 =====
  function addWeightRecord(weight: number, note = '') {
    const today = new Date().toISOString().split('T')[0]
    const record: WeightRecord = {
      id: Date.now().toString(),
      userId: userInfo.value.id,
      weight,
      date: today,
      note
    }
    weightRecords.value.push(record)
    userInfo.value.currentWeight = weight
    updateAchievements()
    saveToCloud()
    return record
  }

  function updateUserInfo(info: Partial<UserInfo>) {
    Object.assign(userInfo.value, info)
    updateAchievements()
    saveToCloud()
  }

  function updateAchievements() {
    const lost = parseFloat(totalWeightLost.value)
    const list = achievements.value

    list.forEach(a => {
      if (a.unlocked) return
      switch (a.type) {
        case 'first':
          if (weightRecords.value.length >= 1) a.unlocked = true
          break
        case 'week':
          if (streakDays.value >= 7) a.unlocked = true
          break
        case 'month':
          if (streakDays.value >= 30) a.unlocked = true
          break
        case 'lose5':
          if (lost >= 5) a.unlocked = true
          break
        case 'lose10':
          if (lost >= 10) a.unlocked = true
          break
        case 'perfect':
          if (userInfo.value.currentWeight > 0 &&
              userInfo.value.currentWeight <= userInfo.value.targetWeight) {
            a.unlocked = true
          }
          break
      }
      if (a.unlocked) a.unlockedTime = Date.now()
    })
  }

  async function saveToCloud() {
    try {
      const db = uni.cloud.database()
      const { id, ...data } = userInfo.value
      await db.collection('users').doc(id).set({ data })
    } catch (e) {
      console.warn('[UserStore] 保存失败', e)
    }
  }

  async function loadFromCloud(userId: string) {
    try {
      const db = uni.cloud.database()
      const userRes = await db.collection('users').doc(userId).get()
      if (userRes.data && (userRes.data as any).length > 0) {
        userInfo.value = (userRes.data as any)[0]
      }

      const recordsRes = await db.collection('records').where({ userId }).get()
      if (recordsRes.data) {
        weightRecords.value = (recordsRes.data as WeightRecord[])
          .sort((a, b) => a.date.localeCompare(b.date))
      }
      updateAchievements()
    } catch (e) {
      console.warn('[UserStore] 加载失败', e)
    }
  }

  async function initUser(openid: string, nickname: string, avatar: string) {
    if (!openid) return
    try {
      const db = uni.cloud.database()
      const res = await db.collection('users').doc(openid).get()
      if (res.data && (res.data as any).length > 0) {
        userInfo.value = (res.data as any)[0]
      } else {
        userInfo.value = {
          id: openid,
          nickname,
          avatar,
          currentWeight: 0,
          targetWeight: 0,
          startWeight: 0,
          height: 0,
          createTime: Date.now()
        }
        const { id, ...data } = userInfo.value
        await db.collection('users').doc(openid).set({ data })
      }
      await loadFromCloud(openid)
    } catch (e) {
      console.warn('[UserStore] 初始化失败', e)
    }
  }

  return {
    userInfo,
    weightRecords,
    achievements,
    bmi,
    totalWeightLost,
    remainingWeight,
    progress,
    streakDays,
    unlockedAchievements,
    addWeightRecord,
    updateUserInfo,
    updateAchievements,
    loadFromCloud,
    initUser
  }
})
