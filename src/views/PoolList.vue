<script>
/*global */
import PoolListItem from "./PoolListItem.vue"
import Swap from "./Swap.vue"
import JoinPool from "./JoinPool.vue"
import ExitPool from "./ExitPool.vue"
import { usePoolsStore } from "../stores/pools"

const poolStore = usePoolsStore()

export default {
  props: ["account"],
  data() {
    return {
      swapPool: null,
      joinPool: null,
      exitPool: null,
      bgUrl: new URL("../assets/img/swap-bg.jpg", import.meta.url).href,
    }
  },
  computed: {
    
    pools() {
      // sort pools by quote.balance, pools is an object of pool_id: pool
      const sortedPools = Object.values(poolStore.pools).sort((a, b) => {
        const aBalance = a.quote.balance
        const bBalance = b.quote.balance
        if (aBalance > bBalance) return -1
        if (aBalance < bBalance) return 1
        return 0
      })

      return sortedPools
    },
    numPools() {
      return poolStore.numPools
    },
    numTrades() {
      return poolStore.numTrades
    },
    tvl() {
      return poolStore.tvl
    },
  },
  methods: {
    swap(pool) {
      this.swapPool = pool
      this.window.swapModal.showModal()
    },
    join(pool) {
      this.joinPool = pool
      this.window.joinModal.showModal()
    },
    exit(pool) {
      this.exitPool = pool
      this.window.exitModal.showModal()
    },
  },
  components: { PoolListItem, Swap, JoinPool, ExitPool },
  async created() {
    await poolStore.setupWebsocket()
  },
}
</script>

<template>
  <main class="py-10 lg:pl-72">
    <div class="px-4 sm:px-6 lg:px-8 grid gap-4 grid-cols-1">
      <div class="stats lg:stats-horizontal">
        <div class="stat">
          <div class="stat-title">Number of Pools</div>
          <div class="stat-value">{{ numPools }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Number of Trades</div>
          <div class="stat-value">{{ numTrades }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Total Value</div>
          <div class="stat-value">{{ tvl }} dys</div>
        </div>
      </div>

      <PoolListItem
        :pool="pool"
        v-for="pool in pools"
        :key="pool"
        :account="account"
        @swap="swap"
        @join="join"
        @exit="exit"
      />
    </div>
  </main>
  <dialog id="swapModal" class="modal">
    <form method="dialog" class="modal-box">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="swapPool = null"
      >
        ✕
      </button>
      <Swap v-if="swapPool" :pool="{ ...swapPool }" :account="account" />
    </form>
    <form method="dialog" class="modal-backdrop">
      <button @click="swapPool = null">close</button>
    </form>
  </dialog>

  <dialog id="joinModal" class="modal">
    <form method="dialog" class="modal-box">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="join = null">
        ✕
      </button>
      <JoinPool v-if="joinPool" :pool="joinPool" :account="account" />
    </form>
    <form method="dialog" class="modal-backdrop">
      <button @click="joinPool = null"></button>
    </form>
  </dialog>

  <dialog id="exitModal" class="modal">
    <form method="dialog" class="modal-box w-6/12">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="exitPool = null"
      >
        ✕
      </button>
      <ExitPool v-if="exitPool" :pool="exitPool" :account="account" :key="exitPool.pool_id" />
    </form>
    <form method="dialog" class="modal-backdrop">
      <button @click="exitPool = null"></button>
    </form>
  </dialog>
</template>
