<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useFriendsStore } from '@/stores/friends'
import { useGroupsStore } from '@/stores/groups'

async function checkProfile() {
  const userStore = useUserStore()
  // 检查是否已设置基本参数
  if (!userStore.userInfo.height || !userStore.userInfo.startWeight || !userStore.userInfo.targetWeight) {
    // 延迟跳转，确保页面栈就绪
    setTimeout(() => {
      uni.switchTab({ url: '/pages/profile/index' })
      // 通知profile页自动打开编辑表单
      uni.$emit('open-setup')
    }, 500)
  }
}

onLaunch(async () => {
  console.log('[App] Launch')

  const userStore = useUserStore()
  const friendsStore = useFriendsStore()
  const groupsStore = useGroupsStore()

  let openid = ''
  let nickname = ''
  let avatar = ''

  try {
    await uni.cloud.init({ env: 'chundada-d2g0w4971983e4c2a' })
    const loginRes = await uni.login({})
    if (loginRes.code) {
      try {
        const res = await uni.cloud.callFunction({
          name: 'login',
          data: { code: loginRes.code }
        })
        openid = res.result?.openid || ''
      } catch (e) {
        console.warn('[App] 云函数调用失败，使用本地模式', e)
      }
    }
  } catch (e) {
    console.warn('[App] 云开发初始化失败，使用本地模式', e)
  }

  if (!openid) {
    openid = 'local-' + Date.now()
    nickname = '瘦身达人'
  }

  await userStore.initUser(openid, nickname, avatar)

  await Promise.allSettled([
    friendsStore.loadFriends(),
    groupsStore.loadGroups()
  ])

  // 首次使用检查
  checkProfile()
})

onShow(() => { console.log('[App] Show') })
onHide(() => { console.log('[App] Hide') })
</script>

<style lang="scss">
page {
  background-color: #F2F2F7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 28rpx;
  color: #1D1D1F;
  box-sizing: border-box;
  min-height: 100vh;
}

view, text { box-sizing: border-box; }

button {
  margin: 0; padding: 0; background: transparent; border: none;
  &::after { border: none; }
}

input, textarea { box-sizing: border-box; }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
</style>
