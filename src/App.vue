<script>
/*global  dysonUseKeplr dysonVueStore */
import { RouterLink, RouterView } from "vue-router"
import { themeChange } from "theme-change"

export default {
  data() {
    return {
      account: null,
      data: null,
    }
  },
  computed: {
    address: function () {
      return this.account?.bech32Address
    },
  },
  methods: {
    onMessage(ws, e) {
      console.log("onMessage", ws, e)
    },
    async refreshAccount() {},
    async accountChanged(account) {
      this.account = account
      return this.refreshAccount()
    },
    async connectWallet() {
      try {
        this.account = await dysonUseKeplr(this.accountChanged)
      } catch (e) {
        this.runResponse = e.toString()
      }
    },
  },
  components: {
    RouterLink,
    RouterView,
  },
  created() {},
  mounted() {
    themeChange(false)
  },
}
</script>

<template>
  <div class="navbar bg-base-100">
    <div class="navbar-start">
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </label>
        <ul
          tabindex="0"
          class="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li><RouterLink :to="{ name: 'home' }">Swap</RouterLink></li>
          <li><RouterLink :to="{ name: 'pool-list' }">All Pools</RouterLink></li>
          <li><RouterLink :to="{ name: 'create-pool' }">Create Pool</RouterLink></li>
        </ul>
      </div>
      <RouterLink class="btn btn-ghost normal-case text-xl" :to="{ name: 'home' }"
        >WhaleSwap.dys</RouterLink
      >
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-lg menu-horizontal px-1">
        <li><RouterLink :to="{ name: 'home' }">Swap</RouterLink></li>
        <li><RouterLink :to="{ name: 'pool-list' }">All Pools</RouterLink></li>
        <li><RouterLink :to="{ name: 'create-pool' }">Create Pool</RouterLink></li>
      </ul>
    </div>
    <div class="navbar-end">
      <span v-if="account">{{ account.name }}</span>
      <a v-else class="btn btn-primary" @click="connectWallet">Connect Wallet</a>

      <input data-toggle-theme="dark,light" class="toggle m-2" type="checkbox" />
    </div>
  </div>
  <RouterView :account="account" />
</template>

<style scoped></style>
