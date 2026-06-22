import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'

// ===== 类型定义 =====
export interface Group {
  id: string
  name: string
  code: string
  description: string
  members: string[]
  createTime: number
}

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)

  // ===== 计算属性 =====
  const myGroups = computed(() => {
    const userStore = useUserStore()
    return groups.value.filter(g => g.members.includes(userStore.userInfo.id))
  })

  // ===== 方法 =====
  function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async function loadGroups() {
    try {
      const db = uni.cloud.database()
      const res = await db.collection('groups').get()
      if (res.data) {
        groups.value = res.data as Group[]
      }
    } catch (e) {
      console.warn('[GroupsStore] 加载群组失败', e)
    }
  }

  async function createGroup(name: string, description: string) {
    const userStore = useUserStore()
    const code = generateCode()
    const group: Group = {
      id: Date.now().toString(),
      name,
      code,
      description,
      members: [userStore.userInfo.id],
      createTime: Date.now()
    }
    groups.value.push(group)
    currentGroup.value = group

    try {
      const db = uni.cloud.database()
      await db.collection('groups').add({ data: group })
      return { success: true, message: '创建成功', group }
    } catch (e) {
      console.warn('[GroupsStore] 创建群组失败', e)
      return { success: false, message: '创建失败' }
    }
  }

  async function joinGroup(code: string) {
    const userStore = useUserStore()
    const group = groups.value.find(g => g.code.toUpperCase() === code.toUpperCase())

    if (!group) return { success: false, message: '群号不存在' }
    if (group.members.includes(userStore.userInfo.id)) return { success: false, message: '已经在群中' }

    group.members.push(userStore.userInfo.id)
    currentGroup.value = group

    try {
      const db = uni.cloud.database()
      await db.collection('groups').doc(group.id).update({
        data: { members: group.members }
      })
      return { success: true, message: '加入成功', group }
    } catch (e) {
      console.warn('[GroupsStore] 加入群组失败', e)
      return { success: false, message: '加入失败' }
    }
  }

  function leaveGroup(groupId: string) {
    const userStore = useUserStore()
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return false

    group.members = group.members.filter(id => id !== userStore.userInfo.id)
    if (currentGroup.value?.id === groupId) {
      currentGroup.value = null
    }
    return true
  }

  function setCurrentGroup(group: Group | null) {
    currentGroup.value = group
  }

  function isInSameGroup(userId: string): boolean {
    if (!currentGroup.value) return false
    return currentGroup.value.members.includes(userId)
  }

  return {
    groups,
    currentGroup,
    myGroups,
    loadGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    setCurrentGroup,
    isInSameGroup
  }
})
