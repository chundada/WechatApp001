"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const stores_friends = require("../../stores/friends.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const friendsStore = stores_friends.useFriendsStore();
    const showCreateModal = common_vendor.ref(false);
    const newCompetition = common_vendor.reactive({
      name: "",
      description: "",
      endDate: ""
    });
    const availableCompetitions = common_vendor.computed(() => {
      return friendsStore.competitions.filter((c) => !c.participants.includes("1"));
    });
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    function onDateChange(e) {
      newCompetition.endDate = e.detail.value;
    }
    function createCompetition() {
      if (!newCompetition.name) {
        common_vendor.index.showToast({ title: "请输入挑战名称", icon: "none" });
        return;
      }
      if (!newCompetition.endDate) {
        common_vendor.index.showToast({ title: "请选择结束日期", icon: "none" });
        return;
      }
      friendsStore.createCompetition(newCompetition.name, newCompetition.description, newCompetition.endDate);
      common_vendor.index.showToast({ title: "创建成功", icon: "success" });
      showCreateModal.value = false;
      newCompetition.name = "";
      newCompetition.description = "";
      newCompetition.endDate = "";
    }
    function joinCompetition(competitionId) {
      friendsStore.joinCompetition(competitionId);
      common_vendor.index.showToast({ title: "参与成功", icon: "success" });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => showCreateModal.value = true, "97"),
        b: common_vendor.f(common_vendor.unref(friendsStore).joinedCompetitions, (competition, k0, i0) => {
          return {
            a: common_vendor.t(competition.name),
            b: common_vendor.t(competition.description),
            c: common_vendor.t(formatDate(competition.startDate)),
            d: common_vendor.t(formatDate(competition.endDate)),
            e: common_vendor.t(competition.participants.length),
            f: competition.id
          };
        }),
        c: common_vendor.t(common_vendor.unref(userStore).progress),
        d: common_vendor.unref(userStore).progress + "%",
        e: common_vendor.unref(friendsStore).joinedCompetitions.length === 0
      }, common_vendor.unref(friendsStore).joinedCompetitions.length === 0 ? {} : {}, {
        f: common_vendor.f(availableCompetitions.value, (competition, k0, i0) => {
          return {
            a: common_vendor.t(competition.name),
            b: common_vendor.t(competition.description),
            c: common_vendor.t(formatDate(competition.startDate)),
            d: common_vendor.t(formatDate(competition.endDate)),
            e: common_vendor.t(competition.participants.length),
            f: common_vendor.o(($event) => joinCompetition(competition.id), competition.id),
            g: competition.id
          };
        }),
        g: showCreateModal.value
      }, showCreateModal.value ? {
        h: newCompetition.name,
        i: common_vendor.o(($event) => newCompetition.name = $event.detail.value, "07"),
        j: newCompetition.description,
        k: common_vendor.o(($event) => newCompetition.description = $event.detail.value, "29"),
        l: common_vendor.t(newCompetition.endDate || "选择日期"),
        m: newCompetition.endDate,
        n: common_vendor.o(onDateChange, "f4"),
        o: common_vendor.o(($event) => showCreateModal.value = false, "52"),
        p: common_vendor.o(createCompetition, "38"),
        q: common_vendor.o(() => {
        }, "4f"),
        r: common_vendor.o(($event) => showCreateModal.value = false, "17")
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3e564a22"]]);
wx.createPage(MiniProgramPage);
