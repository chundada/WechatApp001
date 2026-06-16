"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const inputWeight = common_vendor.ref("");
    const inputNote = common_vendor.ref("");
    const sortedRecords = common_vendor.computed(() => {
      return [...userStore.weightRecords].sort((a, b) => b.date.localeCompare(a.date));
    });
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDay = "日一二三四五六"[date.getDay()];
      return `${month}月${day}日 周${weekDay}`;
    }
    function getTrendClass(current, previous) {
      if (current < previous)
        return "trend-down";
      if (current > previous)
        return "trend-up";
      return "trend-same";
    }
    function getTrendText(current, previous) {
      const diff = previous - current;
      if (diff > 0)
        return `↓${diff.toFixed(1)}kg`;
      if (diff < 0)
        return `↑${Math.abs(diff).toFixed(1)}kg`;
      return "→ 持平";
    }
    function addRecord() {
      const weight = parseFloat(inputWeight.value);
      if (!weight || weight <= 0) {
        common_vendor.index.showToast({ title: "请输入有效体重", icon: "none" });
        return;
      }
      userStore.addWeightRecord(weight, inputNote.value);
      common_vendor.index.showToast({ title: "记录成功", icon: "success" });
      inputWeight.value = "";
      inputNote.value = "";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: inputWeight.value,
        b: common_vendor.o(($event) => inputWeight.value = $event.detail.value, "cf"),
        c: inputNote.value,
        d: common_vendor.o(($event) => inputNote.value = $event.detail.value, "b7"),
        e: common_vendor.o(addRecord, "1d"),
        f: common_vendor.t(common_vendor.unref(userStore).weightRecords.length),
        g: common_vendor.f(sortedRecords.value, (record, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(formatDate(record.date)),
            b: common_vendor.t(record.weight),
            c: record.note
          }, record.note ? {
            d: common_vendor.t(record.note)
          } : {}, {
            e: index < sortedRecords.value.length - 1
          }, index < sortedRecords.value.length - 1 ? {
            f: common_vendor.t(getTrendText(record.weight, sortedRecords.value[index + 1].weight)),
            g: common_vendor.n(getTrendClass(record.weight, sortedRecords.value[index + 1].weight))
          } : {}, {
            h: record.id
          });
        }),
        h: common_vendor.unref(userStore).weightRecords.length === 0
      }, common_vendor.unref(userStore).weightRecords.length === 0 ? {} : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e218755a"]]);
wx.createPage(MiniProgramPage);
