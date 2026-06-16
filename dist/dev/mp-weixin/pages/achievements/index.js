"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const unlockedCount = common_vendor.computed(() => {
      return userStore.achievements.filter((a) => a.unlocked).length;
    });
    function formatDate(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(unlockedCount.value),
        b: common_vendor.t(common_vendor.unref(userStore).achievements.length),
        c: unlockedCount.value / common_vendor.unref(userStore).achievements.length * 100 + "%",
        d: common_vendor.f(common_vendor.unref(userStore).achievements, (achievement, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(achievement.icon),
            b: !achievement.unlocked
          }, !achievement.unlocked ? {} : {}, {
            c: common_vendor.t(achievement.name),
            d: common_vendor.t(achievement.description),
            e: achievement.unlocked
          }, achievement.unlocked ? {
            f: common_vendor.t(formatDate(achievement.unlockedTime))
          } : {}, {
            g: achievement.id,
            h: achievement.unlocked ? 1 : "",
            i: !achievement.unlocked ? 1 : ""
          });
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4a7a9692"]]);
wx.createPage(MiniProgramPage);
