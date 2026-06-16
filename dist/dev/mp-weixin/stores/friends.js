"use strict";
const common_vendor = require("../common/vendor.js");
const stores_user = require("./user.js");
const stores_groups = require("./groups.js");
const useFriendsStore = common_vendor.defineStore("friends", () => {
  const friends = common_vendor.ref([]);
  const competitions = common_vendor.ref([]);
  const leaderboard = common_vendor.computed(() => {
    const userStore = stores_user.useUserStore();
    const groupsStore = stores_groups.useGroupsStore();
    const userData = {
      id: userStore.userInfo.id,
      nickname: userStore.userInfo.nickname || "我",
      avatar: userStore.userInfo.avatar,
      currentWeight: userStore.userInfo.currentWeight,
      targetWeight: userStore.userInfo.targetWeight,
      startWeight: userStore.userInfo.startWeight,
      totalWeightLost: parseFloat(userStore.totalWeightLost),
      streakDays: userStore.streakDays
    };
    let filteredFriends = [...friends.value];
    if (groupsStore.currentGroup) {
      filteredFriends = filteredFriends.filter(
        (f) => groupsStore.currentGroup.members.includes(f.id)
      );
    }
    return [...filteredFriends, userData].sort((a, b) => b.totalWeightLost - a.totalWeightLost);
  });
  const groupFriends = common_vendor.computed(() => {
    const groupsStore = stores_groups.useGroupsStore();
    if (!groupsStore.currentGroup) {
      return friends.value;
    }
    return friends.value.filter(
      (f) => groupsStore.currentGroup.members.includes(f.id)
    );
  });
  const ongoingCompetitions = common_vendor.computed(() => {
    return competitions.value.filter((c) => c.status === "ongoing");
  });
  const joinedCompetitions = common_vendor.computed(() => {
    const userStore = stores_user.useUserStore();
    return competitions.value.filter((c) => c.participants.includes(userStore.userInfo.id));
  });
  async function loadFriends() {
    try {
      const db = common_vendor.index.cloud.database();
      const userStore = stores_user.useUserStore();
      const res = await db.collection("users").where({
        _openid: db.command.neq(userStore.userInfo.id)
      }).get();
      if (res.data) {
        friends.value = res.data.map((user) => ({
          id: user._openid || user._id,
          nickname: user.nickname,
          avatar: user.avatar,
          currentWeight: user.currentWeight,
          targetWeight: user.targetWeight,
          startWeight: user.startWeight,
          totalWeightLost: user.startWeight - user.currentWeight,
          streakDays: 0
        }));
      }
    } catch (e) {
      console.log("加载好友失败", e);
    }
  }
  async function loadCompetitions() {
    try {
      const db = common_vendor.index.cloud.database();
      const res = await db.collection("competitions").get();
      if (res.data) {
        competitions.value = res.data;
      }
    } catch (e) {
      console.log("加载挑战赛失败", e);
    }
  }
  async function joinCompetition(competitionId) {
    const userStore = stores_user.useUserStore();
    const competition = competitions.value.find((c) => c.id === competitionId);
    if (competition && !competition.participants.includes(userStore.userInfo.id)) {
      competition.participants.push(userStore.userInfo.id);
      try {
        const db = common_vendor.index.cloud.database();
        await db.collection("competitions").doc(competitionId).update({
          participants: competition.participants
        });
      } catch (e) {
        console.log("加入挑战失败", e);
      }
    }
  }
  async function createCompetition(name, description, endDate) {
    const userStore = stores_user.useUserStore();
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const newCompetition = {
      id: Date.now().toString(),
      name,
      description,
      startDate: today,
      endDate,
      participants: [userStore.userInfo.id],
      status: "ongoing"
    };
    competitions.value.push(newCompetition);
    try {
      const db = common_vendor.index.cloud.database();
      await db.collection("competitions").add(newCompetition);
    } catch (e) {
      console.log("创建挑战失败", e);
    }
  }
  return {
    friends,
    groupFriends,
    competitions,
    leaderboard,
    ongoingCompetitions,
    joinedCompetitions,
    loadFriends,
    loadCompetitions,
    joinCompetition,
    createCompetition
  };
});
exports.useFriendsStore = useFriendsStore;
