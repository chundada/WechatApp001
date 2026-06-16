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

export interface Competition {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  participants: string[]
  status: 'ongoing' | 'ended'
  winner?: string
}

export const useFriendsStore = defineStore('friends', () => {
  const friends = ref<Friend[]>([])

  const competitions = ref<Competition[]>([])

  const leaderboard = computed(() => {
    const userStore = useUserStore()
    const groupsStore = useGroupsStore()
    
    const userData: Friend = {
      id: userStore.userInfo.id,
      nickname: userStore.userInfo.nickname || '我',
      avatar: userStore.userInfo.avatar,
      currentWeight: userStore.userInfo.currentWeight,
      targetWeight: userStore.userInfo.targetWeight,
      startWeight: userStore.userInfo.startWeight,
      totalWeightLost: parseFloat(userStore.totalWeightLost),
      streakDays: userStore.streakDays
    }
    
    let filteredFriends = [...friends.value]
    
    if (groupsStore.currentGroup) {
      filteredFriends = filteredFriends.filter(f => 
        groupsStore.currentGroup!.members.includes(f.id)
      )
    }
    
    return [...filteredFriends, userData].sort((a, b) => b.totalWeightLost - a.totalWeightLost)
  })

  const groupFriends = computed(() => {
    const groupsStore = useGroupsStore()
    
    if (!groupsStore.currentGroup) {
      return friends.value
    }
    
    return friends.value.filter(f => 
      groupsStore.currentGroup!.members.includes(f.id)
    )
  })

  const ongoingCompetitions = computed(() => {
    return competitions.value.filter(c => c.status === 'ongoing')
  })

  const joinedCompetitions = computed(() => {
    const userStore = useUserStore()
    return competitions.value.filter(c => c.participants.includes(userStore.userInfo.id))
  })

  async function loadFriends() {
    try {
      const db = uni.cloud.database()
      const userStore = useUserStore()
      
      const res = await db.collection('users').where({
        _openid: db.command.neq(userStore.userInfo.id)
      }).get()
      
      if (res.data) {
        friends.value = res.data.map((user: any) => ({
          id: user._openid || user._id,
          nickname: user.nickname,
          avatar: user.avatar,
          currentWeight: user.currentWeight,
          targetWeight: user.targetWeight,
          startWeight: user.startWeight,
          totalWeightLost: user.startWeight - user.currentWeight,
          streakDays: 0
        }))
      }
    } catch (e) {
      console.log('加载好友失败', e)
    }
  }

  async function loadCompetitions() {
    try {
      const db = uni.cloud.database()
      const res = await db.collection('competitions').get()
      if (res.data) {
        competitions.value = res.data
      }
    } catch (e) {
      console.log('加载挑战赛失败', e)
    }
  }

  async function joinCompetition(competitionId: string) {
    const userStore = useUserStore()
    const competition = competitions.value.find(c => c.id === competitionId)
    if (competition && !competition.participants.includes(userStore.userInfo.id)) {
      competition.participants.push(userStore.userInfo.id)
      
      try {
        const db = uni.cloud.database()
        await db.collection('competitions').doc(competitionId).update({
          participants: competition.participants
        })
      } catch (e) {
        console.log('加入挑战失败', e)
      }
    }
  }

  async function createCompetition(name: string, description: string, endDate: string) {
    const userStore = useUserStore()
    const today = new Date().toISOString().split('T')[0]
    const newCompetition: Competition = {
      id: Date.now().toString(),
      name,
      description,
      startDate: today,
      endDate,
      participants: [userStore.userInfo.id],
      status: 'ongoing'
    }
    competitions.value.push(newCompetition)
    
    try {
      const db = uni.cloud.database()
      await db.collection('competitions').add(newCompetition)
    } catch (e) {
      console.log('创建挑战失败', e)
    }
  }

  return {
    friends,
    groupFriends,
    competitions,
    leaderboard,
    ongoingCompetitions,
    joinedCompetitions,
    loadFriends,
    loadCompetitions,
    joinCompetition,
    createCompetition
  }
})
