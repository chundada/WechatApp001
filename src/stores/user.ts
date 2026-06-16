import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

export const useUserStore = defineStore('user', () => {
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

  const achievements = ref<Achievement[]>([
    { id: '1', type: 'first', name: '初次打卡', description: '完成第一次体重记录', icon: '🌟', unlocked: false },
    { id: '2', type: 'week', name: '坚持一周', description: '连续打卡7天', icon: '📅', unlocked: false },
    { id: '3', type: 'month', name: '坚持一月', description: '连续打卡30天', icon: '🏆', unlocked: false },
    { id: '4', type: 'lose5', name: '减重5kg', description: '成功减重5公斤', icon: '🔥', unlocked: false },
    { id: '5', type: 'lose10', name: '减重10kg', description: '成功减重10公斤', icon: '💪', unlocked: false },
    { id: '6', type: 'perfect', name: '完美身材', description: '达到理想体重', icon: '👑', unlocked: false },
  ])

  const bmi = computed(() => {
    const heightInMeters = userInfo.value.height / 100
    if (heightInMeters <= 0) return '0.0'
    return (userInfo.value.currentWeight / (heightInMeters * heightInMeters)).toFixed(1)
  })

  const totalWeightLost = computed(() => {
    return (userInfo.value.startWeight - userInfo.value.currentWeight).toFixed(1)
  })

  const remainingWeight = computed(() => {
    return (userInfo.value.currentWeight - userInfo.value.targetWeight).toFixed(1)
  })

  const progress = computed(() => {
    const total = userInfo.value.startWeight - userInfo.value.targetWeight
    const lost = userInfo.value.startWeight - userInfo.value.currentWeight
    if (total <= 0) return 100
    return Math.min(Math.round((lost / total) * 100), 100)
  })

  const streakDays = computed(() => {
    if (weightRecords.value.length === 0) return 0
    const sortedRecords = [...weightRecords.value].sort((a, b) => b.date.localeCompare(a.date))
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].date)
      recordDate.setHours(0, 0, 0, 0)
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      
      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }
    return streak
  })

  function addWeightRecord(weight: number, note: string = '') {
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
  }

  function updateUserInfo(info: Partial<UserInfo>) {
    userInfo.value = { ...userInfo.value, ...info }
    saveToCloud()
  }

  function updateAchievements() {
    const lost = userInfo.value.startWeight - userInfo.value.currentWeight
    
    achievements.value.forEach(achievement => {
      if (!achievement.unlocked) {
        switch (achievement.type) {
          case 'first':
            if (weightRecords.value.length >= 1) {
              achievement.unlocked = true
              achievement.unlockedTime = Date.now()
            }
            break
          case 'week':
            if (streakDays.value >= 7) {
              achievement.unlocked = true
              achievement.unlockedTime = Date.now()
            }
            break
          case 'month':
            if (streakDays.value >= 30) {
              achievement.unlocked = true
              achievement.unlockedTime = Date.now()
            }
            break
          case 'lose5':
            if (lost >= 5) {
              achievement.unlocked = true
              achievement.unlockedTime = Date.now()
            }
            break
          case 'lose10':
            if (lost >= 10) {
              achievement.unlocked = true
              achievement.unlockedTime = Date.now()
            }
            break
          case 'perfect':
            if (userInfo.value.currentWeight <= userInfo.value.targetWeight) {
              achievement.unlocked = true
              achievement.unlockedTime = Date.now()
            }
            break
        }
      }
    })
  }

  async function saveToCloud() {
    try {
      const db = uni.cloud.database()
      await db.collection('users').doc(userInfo.value.id).set(userInfo.value)
      await db.collection('records').where({ userId: userInfo.value.id }).remove()
      for (const record of weightRecords.value) {
        await db.collection('records').add(record)
      }
    } catch (e) {
      console.log('保存失败', e)
    }
  }

  async function loadFromCloud(userId: string) {
    try {
      const db = uni.cloud.database()
      const userRes = await db.collection('users').doc(userId).get()
      if (userRes.data && userRes.data.length > 0) {
        userInfo.value = userRes.data[0]
      }
      
      const recordsRes = await db.collection('records').where({ userId }).get()
      if (recordsRes.data) {
        weightRecords.value = recordsRes.data.sort((a: WeightRecord, b: WeightRecord) => a.date.localeCompare(b.date))
      }
      updateAchievements()
    } catch (e) {
      console.log('加载失败', e)
    }
  }

  async function initUser(openid: string, nickname: string, avatar: string) {
    try {
      const db = uni.cloud.database()
      const res = await db.collection('users').doc(openid).get()
      
      if (res.data && res.data.length > 0) {
        userInfo.value = res.data[0]
        const recordsRes = await db.collection('records').where({ userId: openid }).get()
        if (recordsRes.data) {
          weightRecords.value = recordsRes.data.sort((a: WeightRecord, b: WeightRecord) => a.date.localeCompare(b.date))
        }
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
        await db.collection('users').doc(openid).set(userInfo.value)
      }
      updateAchievements()
    } catch (e) {
      console.log('初始化失败', e)
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
    addWeightRecord,
    updateUserInfo,
    updateAchievements,
    loadFromCloud,
    initUser
  }
})
