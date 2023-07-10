<script>
/*global  dysonUseKeplr dysonVueStore */
import { RouterLink, RouterView } from 'vue-router'
import { themeChange } from 'theme-change'

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
      console.log('onMessage', ws, e)
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
  <div>
    <div class="navbar bg-base-100">
      <div class="flex-1">
        <RouterLink class="btn btn-ghost normal-case text-xl" :to="{ name: 'home' }"
          >WhaleSwap.dys</RouterLink
        >
      </div>
      <div class="flex-1">
        <ul class="menu menu-horizontal px-1">
          <li><RouterLink :to="{ name: 'pool-list' }">Pools</RouterLink></li>
          <li><RouterLink :to="{ name: 'create-pool' }">Create Pool</RouterLink></li>
        </ul>
      </div>

      <div class="flex-none">
        <span v-if="account">{{ address }}</span>
        <a v-else class="btn btn-primary" @click="connectWallet">Connect Wallet</a>

        <input data-toggle-theme="dark,light" class="toggle m-2" type="checkbox" />
      </div>
    </div>
    <RouterView :account="account" />
  </div>
</template>

<style scoped></style>
