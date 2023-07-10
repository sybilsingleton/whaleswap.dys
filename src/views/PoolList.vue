<script>
/*global DYSON_PROTOCOL dysonVueStore*/
import { useWebSocket } from '@vueuse/core'
import PoolListItem from './PoolListItem.vue'
import Swap from './Swap.vue'
import JoinPool from './JoinPool.vue'
import ExitPool from './ExitPool.vue'

function getPoolIndex(poolId) {
  return `${DYSON_PROTOCOL.SCRIPT_ADDRESS}/pools/${String(poolId).padStart(15, '0')}`
}

function getPoolId(poolIndex) {
  return parseInt(poolIndex.split('/').pop())
}

let nonce = 0
export default {
  props: ['account'],
  data() {
    return {
      pools: [],
      pagination: null,
      wsData: null,
      wsSend: null,
      swapPool: null,
      joinPool: null,
      exitPool: null,
    }
  },
  methods: {
    swap(pool) {
      console.log('emited event swap', pool)
      this.swapPool = pool
      this.window.swapModal.showModal()
    },
    join(pool) {
      console.log('emited event join', pool)
      this.joinPool = pool
      this.window.joinModal.showModal()
    },
    exit(pool) {
      console.log('emited event exit', pool)
      this.exitPool = pool
      this.window.exitModal.showModal()
    },
    processPool(data) {
      let pool = JSON.parse(data.data)
      pool.base.price = pool.quote.balance / pool.base.balance
      pool.quote.price = pool.base.balance / pool.quote.balance

      return pool
    },

    subscribeToPool() {
      console.log('subscribing to pools')
      this.wsSend(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'subscribe',
          id: nonce++,
          params: {
            query: `${DYSON_PROTOCOL.SCRIPT_ADDRESS}.poolupdate EXISTS`,
          },
        }),
      )
    },
    async fetchPool(id) {
      let command = 'dyson/QueryStorage'
      let data = {
        query: {
          index: getPoolIndex(id),
        },
        params: {},
      }
      try {
        let result = await dysonVueStore.dispatch(command, data)
        this.pools = this.pools.map((pool) => {
          if (pool.index === result.storage.index) {
            return result.storage
          }
          return pool
        })
      } catch (e) {
        // delete pool if it doesn't exist anymore
        if (e.toString().includes('not found')) {
          this.pools = this.pools.filter((pool) => pool.index !== getPoolIndex(id))
        } else {
          alert(e.toString())
        }
      }
    },
    async fetchPools() {
      let command = 'dyson/QueryPrefixStorage'
      let data = {
        query: {
          prefix: `${DYSON_PROTOCOL.SCRIPT_ADDRESS}/pools/`,
          'pagination.limit': 100,
          'pagination.key': this.pagination?.next_key,
          'pagination.reverse': true,
        },
        params: {},
      }
      try {
        let result = await dysonVueStore.dispatch(command, data)
        this.pools = this.pools.concat(result.storage)
        this.pagination = result.pagination
        if (result.pagination?.next_key) {
          await this.fetchPools()
        }
      } catch (e) {
        alert(e.toString())
      }
    },
  },
  components: { PoolListItem, Swap, JoinPool, ExitPool },
  watch: {
    wsData: {
      handler: function (val) {
        if (!val) {
          return
        }
        const data = JSON.parse(val)
        const events = data.result?.events
        if (events && events[`${DYSON_PROTOCOL.SCRIPT_ADDRESS}.poolupdate`]) {
          const pool_ids = events[`${DYSON_PROTOCOL.SCRIPT_ADDRESS}.poolupdate`]
          console.log('pools to update', pool_ids)
          for (let i = 0; i < pool_ids.length; i++) {
            this.fetchPool(pool_ids[i])
          }
        }
      },
      deep: true,
    },
  },
  created() {
    const { status, data, send, open, close } = useWebSocket(DYSON_PROTOCOL.WS_TENDERMINT, {
      autoReconnect: {
        retries: 10,
        delay: 1000,
        onFailed() {
          alert('Failed to connect WebSocket after 10 retries')
        },
      },
    })

    this.wsSend = send
    this.wsData = data
    this.fetchPools()
    this.subscribeToPool()
  },
}
</script>

<template>
  <PoolListItem
    :pool="processPool(pool)"
    v-for="pool in pools"
    :key="pool.data"
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
