<script>
/*global DYSON_PROTOCOL dysonVueStore*/
import { useWebSocket } from "@vueuse/core"
import PoolListItem from "./PoolListItem.vue"
import Swap from "./Swap.vue"
import JoinPool from "./JoinPool.vue"
import ExitPool from "./ExitPool.vue"
import { usePoolsStore } from "../stores/pools"

function getPoolIndex(poolId) {
  return `${DYSON_PROTOCOL.SCRIPT_ADDRESS}/pools/${String(poolId).padStart(15, "0")}`
}

function getPoolId(poolIndex) {
  return parseInt(poolIndex.split("/").pop())
}
const poolStore = usePoolsStore()

export default {
  props: ["account"],
  data() {
    return {
      pools: poolStore.pools,
      swapPool: null,
      joinPool: null,
      exitPool: null,
    }
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
  <PoolListItem
    :pool="pool"
    v-for="pool in pools"
    :key="pool"
    :account="account"
    @swap="swap"
    @join="join"
    @exit="exit"
  />
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
