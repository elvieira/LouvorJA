import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Main from "@/views/Main.vue";
import Popup from "@/views/Popup.vue";
import StageMonitor from "@/views/StageMonitor.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Main",
    component: Main,
  },
  {
    path: "/popup",
    name: "Popup",
    component: Popup,
  },
  {
    path: "/stage-monitor",
    name: "StageMonitor",
    component: StageMonitor,
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL ?? "/"),
  routes,
});

export default router;
