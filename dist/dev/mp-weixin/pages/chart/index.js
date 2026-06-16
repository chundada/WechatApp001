"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
if (!Array) {
  const _component_polyline = common_vendor.resolveComponent("polyline");
  const _component_stop = common_vendor.resolveComponent("stop");
  const _component_linearGradient = common_vendor.resolveComponent("linearGradient");
  const _component_defs = common_vendor.resolveComponent("defs");
  const _component_polygon = common_vendor.resolveComponent("polygon");
  const _component_svg = common_vendor.resolveComponent("svg");
  (_component_polyline + _component_stop + _component_linearGradient + _component_defs + _component_polygon + _component_svg)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const currentFilter = common_vendor.ref("week");
    const filteredRecords = common_vendor.computed(() => {
      const records = [...userStore.weightRecords].sort((a, b) => a.date.localeCompare(b.date));
      if (currentFilter.value === "week") {
        const weekAgo = /* @__PURE__ */ new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return records.filter((r) => new Date(r.date) >= weekAgo);
      } else if (currentFilter.value === "month") {
        const monthAgo = /* @__PURE__ */ new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return records.filter((r) => new Date(r.date) >= monthAgo);
      }
      return records;
    });
    const chartData = common_vendor.computed(() => {
      const records = filteredRecords.value;
      if (records.length === 0)
        return [];
      const weights = records.map((r) => r.weight);
      const minWeight = Math.min(...weights) - 1;
      const maxWeight = Math.max(...weights) + 1;
      return records.map((record, index) => ({
        date: record.date,
        weight: record.weight,
        x: index / (records.length - 1 || 1) * 90 + 5,
        y: (record.weight - minWeight) / (maxWeight - minWeight) * 80 + 5
      }));
    });
    const linePoints = common_vendor.computed(() => {
      return chartData.value.map((p) => `${p.x},${100 - p.y}`).join(" ");
    });
    const areaPoints = common_vendor.computed(() => {
      if (chartData.value.length === 0)
        return "";
      const points = chartData.value.map((p) => `${p.x},${100 - p.y}`).join(" ");
      const firstX = chartData.value[0].x;
      const lastX = chartData.value[chartData.value.length - 1].x;
      return `${firstX},100 ${points} ${lastX},100`;
    });
    const yLabels = common_vendor.computed(() => {
      const records = filteredRecords.value;
      if (records.length === 0)
        return ["0", "0", "0", "0", "0"];
      const weights = records.map((r) => r.weight);
      const minWeight = Math.floor(Math.min(...weights));
      const maxWeight = Math.ceil(Math.max(...weights));
      const step = (maxWeight - minWeight) / 4;
      return [maxWeight, maxWeight - step, maxWeight - 2 * step, maxWeight - 3 * step, minWeight].map((v) => Math.round(v));
    });
    const xLabels = common_vendor.computed(() => {
      const records = filteredRecords.value;
      if (records.length === 0)
        return [];
      const step = Math.ceil(records.length / 5);
      return records.filter((_, index) => index % step === 0 || index === records.length - 1).map((r) => {
        const date = new Date(r.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
    });
    const averageDailyLoss = common_vendor.computed(() => {
      const records = filteredRecords.value;
      if (records.length < 2)
        return "0.0";
      const firstWeight = records[0].weight;
      const lastWeight = records[records.length - 1].weight;
      const days = (new Date(records[records.length - 1].date).getTime() - new Date(records[0].date).getTime()) / (1e3 * 60 * 60 * 24);
      if (days <= 0)
        return "0.0";
      return ((firstWeight - lastWeight) / days).toFixed(2);
    });
    const maxDailyLoss = common_vendor.computed(() => {
      const records = filteredRecords.value;
      if (records.length < 2)
        return "0.0";
      let maxLoss = 0;
      for (let i = 1; i < records.length; i++) {
        const loss = records[i - 1].weight - records[i].weight;
        if (loss > maxLoss)
          maxLoss = loss;
      }
      return maxLoss.toFixed(1);
    });
    const estimatedDays = common_vendor.computed(() => {
      const avgLoss = parseFloat(averageDailyLoss.value);
      const remaining = parseFloat(userStore.remainingWeight);
      if (avgLoss <= 0)
        return "--";
      return Math.ceil(remaining / avgLoss);
    });
    const checkinRate = common_vendor.computed(() => {
      const records = userStore.weightRecords;
      if (records.length === 0)
        return "0";
      const firstDate = new Date(Math.min(...records.map((r) => new Date(r.date).getTime())));
      const today = /* @__PURE__ */ new Date();
      const totalDays = Math.ceil((today.getTime() - firstDate.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
      return Math.round(records.length / totalDays * 100);
    });
    const weekLoss = common_vendor.computed(() => {
      const today = /* @__PURE__ */ new Date();
      const weekAgo = /* @__PURE__ */ new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekRecords = userStore.weightRecords.filter(
        (r) => new Date(r.date) >= weekAgo && new Date(r.date) <= today
      ).sort((a, b) => a.date.localeCompare(b.date));
      if (weekRecords.length < 2)
        return 0;
      return weekRecords[0].weight - weekRecords[weekRecords.length - 1].weight;
    });
    function setFilter(filter) {
      currentFilter.value = filter;
    }
    function getDayWeight(dayName) {
      const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(dayName);
      const today = /* @__PURE__ */ new Date();
      const targetDate = new Date(today);
      while (targetDate.getDay() !== dayIndex) {
        targetDate.setDate(targetDate.getDate() - 1);
      }
      const record = userStore.weightRecords.find((r) => r.date === targetDate.toISOString().split("T")[0]);
      return record ? `${record.weight}kg` : "--";
    }
    return (_ctx, _cache) => {
      return {
        a: currentFilter.value === "week" ? 1 : "",
        b: common_vendor.o(($event) => setFilter("week"), "91"),
        c: currentFilter.value === "month" ? 1 : "",
        d: common_vendor.o(($event) => setFilter("month"), "8a"),
        e: currentFilter.value === "all" ? 1 : "",
        f: common_vendor.o(($event) => setFilter("all"), "dc"),
        g: common_vendor.f(yLabels.value, (label, k0, i0) => {
          return {
            a: common_vendor.t(label),
            b: label
          };
        }),
        h: common_vendor.f(5, (i, k0, i0) => {
          return {
            a: i
          };
        }),
        i: common_vendor.f(chartData.value, (point, index, i0) => {
          return {
            a: common_vendor.t(point.weight),
            b: index,
            c: point.x + "%",
            d: point.y + "%"
          };
        }),
        j: common_vendor.p({
          points: linePoints.value,
          fill: "none",
          stroke: "#007AFF",
          ["stroke-width"]: "0.5",
          ["stroke-linecap"]: "round",
          ["stroke-linejoin"]: "round"
        }),
        k: common_vendor.p({
          offset: "0%",
          ["stop-color"]: "#007AFF",
          ["stop-opacity"]: "0.3"
        }),
        l: common_vendor.p({
          offset: "100%",
          ["stop-color"]: "#007AFF",
          ["stop-opacity"]: "0.05"
        }),
        m: common_vendor.p({
          id: "areaGradient",
          x1: "0%",
          y1: "0%",
          x2: "0%",
          y2: "100%"
        }),
        n: common_vendor.p({
          points: areaPoints.value,
          fill: "url(#areaGradient)"
        }),
        o: common_vendor.p({
          viewBox: "0 0 100 100",
          preserveAspectRatio: "none"
        }),
        p: common_vendor.f(xLabels.value, (label, index, i0) => {
          return {
            a: common_vendor.t(label),
            b: index
          };
        }),
        q: common_vendor.t(averageDailyLoss.value),
        r: common_vendor.t(maxDailyLoss.value),
        s: common_vendor.t(estimatedDays.value),
        t: common_vendor.t(checkinRate.value),
        v: common_vendor.t(getDayWeight("Monday")),
        w: common_vendor.t(getDayWeight("Tuesday")),
        x: common_vendor.t(getDayWeight("Wednesday")),
        y: common_vendor.t(getDayWeight("Thursday")),
        z: common_vendor.t(getDayWeight("Friday")),
        A: common_vendor.t(getDayWeight("Saturday")),
        B: common_vendor.t(getDayWeight("Sunday")),
        C: common_vendor.t(weekLoss.value >= 0 ? "-" : "+"),
        D: common_vendor.t(Math.abs(weekLoss.value).toFixed(1)),
        E: common_vendor.n(weekLoss.value >= 0 ? "loss" : "gain")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04b1f8c0"]]);
wx.createPage(MiniProgramPage);
