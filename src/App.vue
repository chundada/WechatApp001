<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useFriendsStore } from '@/stores/friends'
import { useGroupsStore } from '@/stores/groups'

onLaunch(async () => {
  console.log('App Launch')
  
  try {
    await uni.cloud.init({
      env: 'prod-xxx'
    })
    
    const userStore = useUserStore()
    const friendsStore = useFriendsStore()
    const groupsStore = useGroupsStore()
    
    const loginRes = await uni.login({})
    if (loginRes.code) {
      try {
        const res = await uni.cloud.callFunction({
          name: 'login',
          data: {
            code: loginRes.code
          }
        })
        
        const openid = res.result.openid
        
        await userStore.initUser(openid, '', '')
        
        await friendsStore.loadFriends()
        await friendsStore.loadCompetitions()
        await groupsStore.loadGroups()
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
      } catch (cloudError) {
        console.log('云函数调用失败', cloudError)
        const openid = 'test-user-' + Date.now()
        await userStore.initUser(openid, '测试用户', '')
        
        await friendsStore.loadFriends()
        await friendsStore.loadCompetitions()
        await groupsStore.loadGroups()
        
        uni.showToast({
          title: '离线模式',
          icon: 'none'
        })
      }
    }
  } catch (e) {
    console.log('初始化失败', e)
    
    const userStore = useUserStore()
    const friendsStore = useFriendsStore()
    const groupsStore = useGroupsStore()
    
    const openid = 'test-user-' + Date.now()
    await userStore.initUser(openid, '测试用户', '')
    await friendsStore.loadFriends()
    await friendsStore.loadCompetitions()
    await groupsStore.loadGroups()
    
    uni.showToast({
      title: '离线模式',
      icon: 'none'
    })
  }
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
