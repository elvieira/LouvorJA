import { createRouter, createWebHistory } from "vue-router";
import Main from "@/views/Main.vue";
import Popup from "@/views/Popup.vue";
import Home from "@/views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Main",
    component: Main,
    children: [
      {
        path: "",
        name: "home",
        component: Home,
      },
    ],
  },
  {
    path: "/popup",
    name: "Popup",
    component: Popup,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL ?? "/"),
  routes,
});

export default router;
