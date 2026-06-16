"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_user = require("./stores/user.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/record/index.js";
  "./pages/chart/index.js";
  "./pages/friends/index.js";
  "./pages/competition/index.js";
  "./pages/achievements/index.js";
  "./pages/profile/index.js";
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(async () => {
      console.log("App Launch");
      try {
        await common_vendor.index.cloud.init({
          env: "prod-xxx"
        });
        const userStore = stores_user.useUserStore();
        const loginRes = await common_vendor.index.login({});
        if (loginRes.code) {
          const res = await common_vendor.index.cloud.callFunction({
            name: "login",
            data: {
              code: loginRes.code
            }
          });
          const openid = res.result.openid;
          const userInfoRes = await common_vendor.index.getUserProfile({
            desc: "用于完善会员资料"
          });
          await userStore.initUser(openid, userInfoRes.userInfo.nickName, userInfoRes.userInfo.avatarUrl);
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
        }
      } catch (e) {
        console.log("登录失败", e);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      }
    });
    common_vendor.onShow(() => {
      console.log("App Show");
    });
    common_vendor.onHide(() => {
      console.log("App Hide");
    });
    return () => {
    };
  }
});
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
