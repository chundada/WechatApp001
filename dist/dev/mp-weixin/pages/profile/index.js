"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const stores_friends = require("../../stores/friends.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const friendsStore = stores_friends.useFriendsStore();
    const showEditModal = common_vendor.ref(false);
    const showShareModal = common_vendor.ref(false);
    const editInfo = common_vendor.reactive({
      nickname: userStore.userInfo.nickname,
      height: userStore.userInfo.height.toString(),
      targetWeight: userStore.userInfo.targetWeight.toString()
    });
    const unlockedCount = common_vendor.computed(() => {
      return userStore.achievements.filter((a) => a.unlocked).length;
    });
    function saveEdit() {
      userStore.updateUserInfo({
        nickname: editInfo.nickname,
        height: parseInt(editInfo.height) || userStore.userInfo.height,
        targetWeight: parseFloat(editInfo.targetWeight) || userStore.userInfo.targetWeight
      });
      common_vendor.index.showToast({ title: "保存成功", icon: "success" });
      showEditModal.value = false;
    }
    function goToAchievements() {
      common_vendor.index.navigateTo({ url: "/pages/achievements/index" });
    }
    function goToChart() {
      common_vendor.index.navigateTo({ url: "/pages/chart/index" });
    }
    function goToCompetition() {
      common_vendor.index.navigateTo({ url: "/pages/competition/index" });
    }
    function showSettings() {
      common_vendor.index.showToast({ title: "设置功能开发中", icon: "none" });
    }
    function showAbout() {
      common_vendor.index.showModal({
        title: "关于瘦身搭档",
        content: "版本 1.0.0\n\n瘦身搭档是一款帮助你记录体重变化、与好友一起减肥的小程序。坚持打卡，遇见更好的自己！💪",
        showCancel: false
      });
    }
    function share() {
      common_vendor.index.showToast({ title: "分享功能开发中", icon: "none" });
      showShareModal.value = false;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(userStore).userInfo.nickname),
        b: common_vendor.t(common_vendor.unref(userStore).userInfo.id),
        c: common_vendor.o(($event) => showEditModal.value = true, "42"),
        d: common_vendor.t(common_vendor.unref(userStore).userInfo.currentWeight),
        e: common_vendor.t(common_vendor.unref(userStore).userInfo.targetWeight),
        f: common_vendor.t(common_vendor.unref(userStore).totalWeightLost),
        g: common_vendor.t(unlockedCount.value),
        h: common_vendor.t(common_vendor.unref(userStore).achievements.length),
        i: common_vendor.o(goToAchievements, "6d"),
        j: common_vendor.o(goToChart, "b9"),
        k: common_vendor.t(common_vendor.unref(friendsStore).joinedCompetitions.length),
        l: common_vendor.o(goToCompetition, "55"),
        m: common_vendor.o(($event) => showShareModal.value = true, "f3"),
        n: common_vendor.o(showSettings, "72"),
        o: common_vendor.o(showAbout, "49"),
        p: common_vendor.unref(userStore).progress,
        q: common_vendor.t(common_vendor.unref(userStore).progress),
        r: common_vendor.t(common_vendor.unref(userStore).userInfo.startWeight),
        s: common_vendor.t(common_vendor.unref(userStore).userInfo.currentWeight),
        t: common_vendor.t(common_vendor.unref(userStore).userInfo.targetWeight),
        v: common_vendor.t(common_vendor.unref(userStore).userInfo.height),
        w: showEditModal.value
      }, showEditModal.value ? {
        x: editInfo.nickname,
        y: common_vendor.o(($event) => editInfo.nickname = $event.detail.value, "67"),
        z: editInfo.height,
        A: common_vendor.o(($event) => editInfo.height = $event.detail.value, "76"),
        B: editInfo.targetWeight,
        C: common_vendor.o(($event) => editInfo.targetWeight = $event.detail.value, "5e"),
        D: common_vendor.o(($event) => showEditModal.value = false, "e6"),
        E: common_vendor.o(saveEdit, "7b"),
        F: common_vendor.o(() => {
        }, "07"),
        G: common_vendor.o(($event) => showEditModal.value = false, "bf")
      } : {}, {
        H: showShareModal.value
      }, showShareModal.value ? {
        I: common_vendor.t(common_vendor.unref(userStore).totalWeightLost),
        J: common_vendor.t(common_vendor.unref(userStore).streakDays),
        K: common_vendor.t(common_vendor.unref(userStore).progress),
        L: common_vendor.o(($event) => showShareModal.value = false, "9a"),
        M: common_vendor.o(share, "3c"),
        N: common_vendor.o(() => {
        }, "9b"),
        O: common_vendor.o(($event) => showShareModal.value = false, "32")
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f97f9319"]]);
wx.createPage(MiniProgramPage);
