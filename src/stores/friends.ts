import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import { useGroupsStore } from './groups'

export interface Friend {
  id: string
  nickname: string
  avatar: string
  currentWeight: number
  targetWeight: number
  startWeight: number
  totalWeightLost: number
  streakDays: number
}

export const useFriendsStore = defineStore('friends', () => {
  const friends = ref<Friend[]>([])

  // 排行榜 - 如果选了群组则只显示群成员 + 自己
  const leaderboard = computed(() => {
    const userStore = useUserStore()
    const groupsStore = useGroupsStore()

    const me: Friend = {
      id: userStore.userInfo.id,
      nickname: userStore.userInfo.nickname || '我',
      avatar: userStore.userInfo.avatar,
      currentWeight: userStore.userInfo.currentWeight,
      targetWeight: userStore.userInfo.targetWeight,
      startWeight: userStore.userInfo.startWeight,
      totalWeightLost: parseFloat(userStore.totalWeightLost) || 0,
      streakDays: userStore.streakDays
    }

    // 如果选中了群组，只显示群成员
    let list = [...friends.value]
    if (groupsStore.currentGroup) {
      list = list.filter(f => groupsStore.currentGroup!.members.includes(f.id))
    }

    return [...list, me].sort((a, b) => b.totalWeightLost - a.totalWeightLost)
  })

  async function loadFriends() {
    try {
      const userStore = useUserStore()
      const db = uni.cloud.database()
      const res = await db.collection('users')
        .where({ id: db.command.neq(userStore.userInfo.id) })
        .get()

      if (res.data) {
        friends.value = (res.data as any[]).map(user => ({
          id: user.id,
          nickname: user.nickname || '用户',
          avatar: user.avatar || '',
          currentWeight: user.currentWeight || 0,
          targetWeight: user.targetWeight || 0,
          startWeight: user.startWeight || 0,
          totalWeightLost: (user.startWeight || 0) - (user.currentWeight || 0),
          streakDays: 0
        }))
      }
    } catch (e) {
      console.warn('[FriendsStore] 加载好友失败', e)
    }
  }

  return {
    friends,
    leaderboard,
    loadFriends
  }
})
