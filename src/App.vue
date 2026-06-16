<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(async () => {
  console.log('App Launch')
  
  try {
    await uni.cloud.init({
      env: 'prod-xxx'
    })
    
    const userStore = useUserStore()
    
    const loginRes = await uni.login({})
    if (loginRes.code) {
      const res = await uni.cloud.callFunction({
        name: 'login',
        data: {
          code: loginRes.code
        }
      })
      
      const openid = res.result.openid
      
      const userInfoRes = await uni.getUserProfile({
        desc: '用于完善会员资料'
      })
      
      await userStore.initUser(openid, userInfoRes.userInfo.nickName, userInfoRes.userInfo.avatarUrl)
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }
  } catch (e) {
    console.log('登录失败', e)
    uni.showToast({
      title: '登录失败，请重试',
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
