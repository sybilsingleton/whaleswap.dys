import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: "btn-active",
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/pools",
      name: "pool-list",
      component: () => import("../views/PoolList.vue"),
    },
    {
      path: "/new",
      name: "create-pool",
      component: () => import("../views/CreatePool.vue"),
    },
  ],
})

export default router
