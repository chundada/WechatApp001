"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const stores_friends = require("../../stores/friends.js");
const stores_groups = require("../../stores/groups.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const friendsStore = stores_friends.useFriendsStore();
    const groupsStore = stores_groups.useGroupsStore();
    const myRank = common_vendor.computed(() => {
      const leaderboard = friendsStore.leaderboard;
      const myIndex = leaderboard.findIndex((item) => item.id === userStore.userInfo.id);
      return myIndex >= 0 ? myIndex + 1 : "--";
    });
    function getRankClass(index) {
      if (index === 0)
        return "gold";
      if (index === 1)
        return "silver";
      if (index === 2)
        return "bronze";
      return "";
    }
    function getFriendProgress(friend) {
      const total = friend.startWeight - friend.targetWeight;
      const lost = friend.startWeight - friend.currentWeight;
      if (total <= 0)
        return 100;
      return Math.min(Math.round(lost / total * 100), 100);
    }
    function getCompareClass(friend) {
      const myLost = parseFloat(userStore.totalWeightLost);
      if (friend.totalWeightLost > myLost)
        return "behind";
      if (friend.totalWeightLost < myLost)
        return "ahead";
      return "equal";
    }
    function getCompareText(friend) {
      const myLost = parseFloat(userStore.totalWeightLost);
      const diff = myLost - friend.totalWeightLost;
      if (diff > 0)
        return `领先 ${diff.toFixed(1)}kg`;
      if (diff < 0)
        return `落后 ${Math.abs(diff).toFixed(1)}kg`;
      return "持平";
    }
    function inviteFriends() {
      common_vendor.index.showToast({
        title: "邀请功能开发中",
        icon: "none"
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(groupsStore).currentGroup
      }, common_vendor.unref(groupsStore).currentGroup ? {
        b: common_vendor.t(common_vendor.unref(groupsStore).currentGroup.name),
        c: common_vendor.t(common_vendor.unref(groupsStore).currentGroup.members.length),
        d: common_vendor.t(common_vendor.unref(groupsStore).currentGroup.code)
      } : {}, {
        e: common_vendor.f(common_vendor.unref(friendsStore).leaderboard, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.n(getRankClass(index)),
            c: common_vendor.t(item.id === "1" ? "👤" : "👥"),
            d: common_vendor.t(item.nickname),
            e: getFriendProgress(item) + "%",
            f: common_vendor.t(getFriendProgress(item)),
            g: common_vendor.t(item.currentWeight),
            h: common_vendor.t(item.totalWeightLost),
            i: item.id === "1" ? 1 : "",
            j: item.id
          };
        }),
        f: common_vendor.f(common_vendor.unref(friendsStore).groupFriends, (friend, k0, i0) => {
          return {
            a: common_vendor.t(friend.nickname),
            b: common_vendor.t(friend.currentWeight),
            c: common_vendor.t(friend.targetWeight),
            d: common_vendor.t(getCompareText(friend)),
            e: common_vendor.n(getCompareClass(friend)),
            f: friend.id
          };
        }),
        g: common_vendor.t(myRank.value),
        h: common_vendor.t(common_vendor.unref(userStore).totalWeightLost),
        i: common_vendor.t(common_vendor.unref(userStore).streakDays),
        j: common_vendor.o(inviteFriends, "ee")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-65198498"]]);
wx.createPage(MiniProgramPage);
