"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const stores_groups = require("../../stores/groups.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const groupsStore = stores_groups.useGroupsStore();
    const inputWeight = common_vendor.ref("");
    const inputNote = common_vendor.ref("");
    const groupCode = common_vendor.ref("");
    const showGroupModal = common_vendor.ref(false);
    const showCreateGroupModal = common_vendor.ref(false);
    const initForm = common_vendor.reactive({
      currentWeight: "",
      targetWeight: "",
      height: ""
    });
    const newGroup = common_vendor.reactive({
      name: "",
      description: ""
    });
    common_vendor.onMounted(() => {
      groupsStore.loadGroups();
    });
    const isInitialized = common_vendor.computed(() => {
      return userStore.userInfo.currentWeight > 0 && userStore.userInfo.targetWeight > 0;
    });
    const currentDate = common_vendor.computed(() => {
      const now = /* @__PURE__ */ new Date();
      const weekDays = "日一二三四五六";
      return `${now.getMonth() + 1}月${now.getDate()}日 周${weekDays[now.getDay()]}`;
    });
    const hasCheckedInToday = common_vendor.computed(() => {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return userStore.weightRecords.some((record) => record.date === today);
    });
    const unlockedCount = common_vendor.computed(() => {
      return userStore.achievements.filter((a) => a.unlocked).length;
    });
    function handleInit() {
      const currentWeight = parseFloat(initForm.currentWeight);
      const targetWeight = parseFloat(initForm.targetWeight);
      const height = parseInt(initForm.height);
      if (!currentWeight || currentWeight <= 0) {
        common_vendor.index.showToast({ title: "请输入有效体重", icon: "none" });
        return;
      }
      if (!targetWeight || targetWeight <= 0) {
        common_vendor.index.showToast({ title: "请输入目标体重", icon: "none" });
        return;
      }
      if (!height || height <= 0) {
        common_vendor.index.showToast({ title: "请输入身高", icon: "none" });
        return;
      }
      userStore.updateUserInfo({
        currentWeight,
        targetWeight,
        startWeight: currentWeight,
        height
      });
      common_vendor.index.showToast({ title: "设置成功", icon: "success" });
    }
    function goToRecord() {
      common_vendor.index.switchTab({ url: "/pages/record/index" });
    }
    function goToChart() {
      common_vendor.index.navigateTo({ url: "/pages/chart/index" });
    }
    function goToFriends() {
      common_vendor.index.switchTab({ url: "/pages/friends/index" });
    }
    function goToCompetition() {
      common_vendor.index.navigateTo({ url: "/pages/competition/index" });
    }
    function handleCheckin() {
      const weight = parseFloat(inputWeight.value);
      if (!weight || weight <= 0) {
        common_vendor.index.showToast({ title: "请输入有效体重", icon: "none" });
        return;
      }
      userStore.addWeightRecord(weight, inputNote.value);
      common_vendor.index.showToast({ title: "打卡成功", icon: "success" });
      inputWeight.value = "";
      inputNote.value = "";
    }
    async function handleJoinGroup() {
      if (!groupCode.value.trim()) {
        common_vendor.index.showToast({ title: "请输入群号", icon: "none" });
        return;
      }
      const result = await groupsStore.joinGroup(groupCode.value);
      common_vendor.index.showToast({ title: result.message, icon: result.success ? "success" : "none" });
      if (result.success) {
        groupCode.value = "";
      }
    }
    async function handleCreateGroup() {
      if (!newGroup.name.trim()) {
        common_vendor.index.showToast({ title: "请输入群名称", icon: "none" });
        return;
      }
      const result = await groupsStore.createGroup(newGroup.name, newGroup.description);
      common_vendor.index.showToast({ title: result.message, icon: result.success ? "success" : "none" });
      if (result.success) {
        newGroup.name = "";
        newGroup.description = "";
        showCreateGroupModal.value = false;
      }
    }
    function selectGroup(group) {
      groupsStore.setCurrentGroup(group);
      showGroupModal.value = false;
      common_vendor.index.showToast({ title: `已切换到 ${group.name}`, icon: "success" });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isInitialized.value
      }, !isInitialized.value ? {
        b: initForm.currentWeight,
        c: common_vendor.o(($event) => initForm.currentWeight = $event.detail.value, "0f"),
        d: initForm.targetWeight,
        e: common_vendor.o(($event) => initForm.targetWeight = $event.detail.value, "4d"),
        f: initForm.height,
        g: common_vendor.o(($event) => initForm.height = $event.detail.value, "1b"),
        h: common_vendor.o(handleInit, "b8")
      } : common_vendor.e({
        i: common_vendor.t(currentDate.value),
        j: common_vendor.unref(userStore).streakDays > 0
      }, common_vendor.unref(userStore).streakDays > 0 ? {
        k: common_vendor.t(common_vendor.unref(userStore).streakDays)
      } : {}, {
        l: common_vendor.t(common_vendor.unref(userStore).userInfo.currentWeight),
        m: common_vendor.t(common_vendor.unref(userStore).userInfo.targetWeight),
        n: common_vendor.t(common_vendor.unref(userStore).bmi),
        o: common_vendor.unref(userStore).progress + "%",
        p: common_vendor.t(common_vendor.unref(userStore).progress),
        q: common_vendor.t(common_vendor.unref(userStore).totalWeightLost),
        r: common_vendor.t(common_vendor.unref(userStore).remainingWeight),
        s: common_vendor.unref(groupsStore).currentGroup
      }, common_vendor.unref(groupsStore).currentGroup ? {
        t: common_vendor.t(common_vendor.unref(groupsStore).currentGroup.name),
        v: common_vendor.t(common_vendor.unref(groupsStore).currentGroup.code),
        w: common_vendor.o(($event) => showGroupModal.value = true, "c7")
      } : {
        x: groupCode.value,
        y: common_vendor.o(($event) => groupCode.value = $event.detail.value, "e7"),
        z: common_vendor.o(handleJoinGroup, "c0"),
        A: common_vendor.o(($event) => showCreateGroupModal.value = true, "a3")
      }, {
        B: common_vendor.o(goToRecord, "cc"),
        C: common_vendor.o(goToChart, "af"),
        D: common_vendor.o(goToFriends, "04"),
        E: common_vendor.o(goToCompetition, "7f"),
        F: common_vendor.t(unlockedCount.value),
        G: common_vendor.t(common_vendor.unref(userStore).achievements.length),
        H: common_vendor.f(common_vendor.unref(userStore).achievements, (achievement, k0, i0) => {
          return {
            a: common_vendor.t(achievement.icon),
            b: common_vendor.t(achievement.name),
            c: achievement.unlocked ? 1 : "",
            d: !achievement.unlocked ? 1 : "",
            e: achievement.id
          };
        }),
        I: !hasCheckedInToday.value
      }, !hasCheckedInToday.value ? {
        J: common_vendor.o(handleCheckin, "6f"),
        K: inputWeight.value,
        L: common_vendor.o(($event) => inputWeight.value = $event.detail.value, "fd"),
        M: inputNote.value,
        N: common_vendor.o(($event) => inputNote.value = $event.detail.value, "33"),
        O: common_vendor.o(handleCheckin, "13")
      } : {}), {
        P: showGroupModal.value
      }, showGroupModal.value ? common_vendor.e({
        Q: common_vendor.f(common_vendor.unref(groupsStore).myGroups, (group, k0, i0) => {
          var _a;
          return {
            a: common_vendor.t(group.name),
            b: common_vendor.t(group.members.length),
            c: common_vendor.t(group.code),
            d: ((_a = common_vendor.unref(groupsStore).currentGroup) == null ? void 0 : _a.id) === group.id ? 1 : "",
            e: group.id,
            f: common_vendor.o(($event) => selectGroup(group), group.id)
          };
        }),
        R: common_vendor.unref(groupsStore).myGroups.length === 0
      }, common_vendor.unref(groupsStore).myGroups.length === 0 ? {} : {}, {
        S: common_vendor.o(($event) => showGroupModal.value = false, "a3"),
        T: common_vendor.o(($event) => {
          showCreateGroupModal.value = true;
          showGroupModal.value = false;
        }, "4b"),
        U: common_vendor.o(() => {
        }, "8e"),
        V: common_vendor.o(($event) => showGroupModal.value = false, "54")
      }) : {}, {
        W: showCreateGroupModal.value
      }, showCreateGroupModal.value ? {
        X: newGroup.name,
        Y: common_vendor.o(($event) => newGroup.name = $event.detail.value, "fe"),
        Z: newGroup.description,
        aa: common_vendor.o(($event) => newGroup.description = $event.detail.value, "86"),
        ab: common_vendor.o(($event) => showCreateGroupModal.value = false, "4d"),
        ac: common_vendor.o(handleCreateGroup, "2b"),
        ad: common_vendor.o(() => {
        }, "c3"),
        ae: common_vendor.o(($event) => showCreateGroupModal.value = false, "75")
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
