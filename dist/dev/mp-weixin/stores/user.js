"use strict";
const common_vendor = require("../common/vendor.js");
const useUserStore = common_vendor.defineStore("user", () => {
  const userInfo = common_vendor.ref({
    id: "",
    nickname: "",
    avatar: "",
    currentWeight: 0,
    targetWeight: 0,
    startWeight: 0,
    height: 0,
    createTime: Date.now()
  });
  const weightRecords = common_vendor.ref([]);
  const achievements = common_vendor.ref([
    { id: "1", type: "first", name: "初次打卡", description: "完成第一次体重记录", icon: "🌟", unlocked: false },
    { id: "2", type: "week", name: "坚持一周", description: "连续打卡7天", icon: "📅", unlocked: false },
    { id: "3", type: "month", name: "坚持一月", description: "连续打卡30天", icon: "🏆", unlocked: false },
    { id: "4", type: "lose5", name: "减重5kg", description: "成功减重5公斤", icon: "🔥", unlocked: false },
    { id: "5", type: "lose10", name: "减重10kg", description: "成功减重10公斤", icon: "💪", unlocked: false },
    { id: "6", type: "perfect", name: "完美身材", description: "达到理想体重", icon: "👑", unlocked: false }
  ]);
  const bmi = common_vendor.computed(() => {
    const heightInMeters = userInfo.value.height / 100;
    if (heightInMeters <= 0)
      return "0.0";
    return (userInfo.value.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
  });
  const totalWeightLost = common_vendor.computed(() => {
    return (userInfo.value.startWeight - userInfo.value.currentWeight).toFixed(1);
  });
  const remainingWeight = common_vendor.computed(() => {
    return (userInfo.value.currentWeight - userInfo.value.targetWeight).toFixed(1);
  });
  const progress = common_vendor.computed(() => {
    const total = userInfo.value.startWeight - userInfo.value.targetWeight;
    const lost = userInfo.value.startWeight - userInfo.value.currentWeight;
    if (total <= 0)
      return 100;
    return Math.min(Math.round(lost / total * 100), 100);
  });
  const streakDays = common_vendor.computed(() => {
    if (weightRecords.value.length === 0)
      return 0;
    const sortedRecords = [...weightRecords.value].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].date);
      recordDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  });
  function addWeightRecord(weight, note = "") {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const record = {
      id: Date.now().toString(),
      userId: userInfo.value.id,
      weight,
      date: today,
      note
    };
    weightRecords.value.push(record);
    userInfo.value.currentWeight = weight;
    updateAchievements();
    saveToCloud();
  }
  function updateUserInfo(info) {
    userInfo.value = { ...userInfo.value, ...info };
    saveToCloud();
  }
  function updateAchievements() {
    const lost = userInfo.value.startWeight - userInfo.value.currentWeight;
    achievements.value.forEach((achievement) => {
      if (!achievement.unlocked) {
        switch (achievement.type) {
          case "first":
            if (weightRecords.value.length >= 1) {
              achievement.unlocked = true;
              achievement.unlockedTime = Date.now();
            }
            break;
          case "week":
            if (streakDays.value >= 7) {
              achievement.unlocked = true;
              achievement.unlockedTime = Date.now();
            }
            break;
          case "month":
            if (streakDays.value >= 30) {
              achievement.unlocked = true;
              achievement.unlockedTime = Date.now();
            }
            break;
          case "lose5":
            if (lost >= 5) {
              achievement.unlocked = true;
              achievement.unlockedTime = Date.now();
            }
            break;
          case "lose10":
            if (lost >= 10) {
              achievement.unlocked = true;
              achievement.unlockedTime = Date.now();
            }
            break;
          case "perfect":
            if (userInfo.value.currentWeight <= userInfo.value.targetWeight) {
              achievement.unlocked = true;
              achievement.unlockedTime = Date.now();
            }
            break;
        }
      }
    });
  }
  async function saveToCloud() {
    try {
      const db = common_vendor.index.cloud.database();
      await db.collection("users").doc(userInfo.value.id).set({
        data: userInfo.value
      });
      await db.collection("records").where({ userId: userInfo.value.id }).remove();
      for (const record of weightRecords.value) {
        await db.collection("records").add(record);
      }
    } catch (e) {
      console.log("保存失败", e);
    }
  }
  async function loadFromCloud(userId) {
    try {
      const db = common_vendor.index.cloud.database();
      const userRes = await db.collection("users").doc(userId).get();
      if (userRes.data && userRes.data.length > 0) {
        userInfo.value = userRes.data[0];
      }
      const recordsRes = await db.collection("records").where({ userId }).get();
      if (recordsRes.data) {
        weightRecords.value = recordsRes.data.sort((a, b) => a.date.localeCompare(b.date));
      }
      updateAchievements();
    } catch (e) {
      console.log("加载失败", e);
    }
  }
  async function initUser(openid, nickname, avatar) {
    try {
      const db = common_vendor.index.cloud.database();
      const res = await db.collection("users").doc(openid).get();
      if (res.data && res.data.length > 0) {
        userInfo.value = res.data[0];
        const recordsRes = await db.collection("records").where({ userId: openid }).get();
        if (recordsRes.data) {
          weightRecords.value = recordsRes.data.sort((a, b) => a.date.localeCompare(b.date));
        }
      } else {
        userInfo.value = {
          id: openid,
          nickname,
          avatar,
          currentWeight: 0,
          targetWeight: 0,
          startWeight: 0,
          height: 0,
          createTime: Date.now()
        };
        await db.collection("users").doc(openid).set({
          data: userInfo.value
        });
      }
      updateAchievements();
    } catch (e) {
      console.log("初始化失败", e);
    }
  }
  return {
    userInfo,
    weightRecords,
    achievements,
    bmi,
    totalWeightLost,
    remainingWeight,
    progress,
    streakDays,
    addWeightRecord,
    updateUserInfo,
    updateAchievements,
    loadFromCloud,
    initUser
  };
});
exports.useUserStore = useUserStore;
