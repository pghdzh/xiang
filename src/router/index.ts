import { createRouter, createWebHashHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
NProgress.configure({ showSpinner: false }); // NProgress Configuration 刷新页面头部进度条

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: () => import("@/views/HomeView/index.vue"),
    },
    {
      path: "/overview",
      component: () => import("@/views/overviewView/index.vue"),
    },
    {
      path: "/timeline",
      component: () => import("@/views/timelineView/index.vue"),
    },
    {
      path: "/gallery",
      component: () => import("@/views/galleryView/index.vue"),
    },
    {
      path: "/messages",
      component: () => import("@/views/messagesView/index.vue"),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
