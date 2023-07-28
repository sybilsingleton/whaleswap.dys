<script>
/*global */
import PoolListItem from "./PoolListItem.vue"
import JoinPool from "./JoinPool.vue"
import ExitPool from "./ExitPool.vue"
import { usePoolsStore } from "../stores/pools"

const poolStore = usePoolsStore()

export default {
  props: ["account"],
  data() {
    return {
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
      return poolStore.numPools || 0
    },
    numSwaps() {
      return poolStore.numTrades || 0
    },
    tvl() {
      return poolStore.tvl || 0
    },
  },
  methods: {
    join(pool) {
      this.joinPool = pool
      this.window.joinModal.showModal()
    },
    exit(pool) {
      this.exitPool = pool
      this.window.exitModal.showModal()
    },
  },
  components: { PoolListItem, JoinPool, ExitPool },
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
          <div class="stat-value">{{ numPools.toLocaleString()  }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Number of Swaps</div>
          <div class="stat-value">{{ numSwaps .toLocaleString() }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Total Value</div>
          <div class="stat-value">
            {{ tvl.toLocaleString() }}
            DYS
          </div>
        </div>
      </div>

      <PoolListItem
        :pool="pool"
        v-for="pool in pools"
        :key="pool"
        :account="account"
        @join="join"
        @exit="exit"
      />
    </div>
  </main>

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
