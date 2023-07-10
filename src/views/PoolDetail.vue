<script>
/*global DYSON_PROTOCOL */
import { useWebSocket } from '@vueuse/core'
import PoolListItem from './PoolListItem.vue'
import Swap from './Swap.vue'

function getPoolIndex(poolId) {
  return `${DYSON_PROTOCOL.SCRIPT_ADDRESS}/pools/${String(poolId).padStart(15, '0')}`
}

function getPoolId(poolIndex) {
  return parseInt(poolIndex.split('/').pop())
}

let nonce = 0
export default {
  props: ['account', 'id'],
  data() {
    return {
      pool: null,
      wsData: null,
      wsSend: null,
      swapPool: null
    }
  },
  methods: {
    swap(pool) {
      console.log('emited event swap', pool)
      this.swapPool = pool
      this.window.swapModal.showModal()
    },
    processPool(data) {
      let pool = JSON.parse(data.data)
      pool.base.price = pool.quote.balance / pool.base.balance
      pool.quote.price = pool.base.balance / pool.quote.balance

      return pool
    },

    subscribeToPool(id) {
      console.log('subscribing to pool id', id)
      this.wsSend(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'subscribe',
          id: nonce++,
          params: {
            query: `${DYSON_PROTOCOL.SCRIPT_ADDRESS}.poolupdate='${id}'`
          }
        })
      )
    },
    async fetchPool(id) {
      let command = 'dyson/QueryStorage'
      let data = {
        query: {
          index: getPoolIndex(id)
        },
        params: {}
      }
      try {
        let result = await dysonVueStore.dispatch(command, data)
        this.pool = result.storage
      } catch (e) {
        alert(e.toString())
      }
    },
    async fetchPools() {
      let command = 'dyson/QueryPrefixStorage'
      let data = {
        query: {
          prefix: `${DYSON_PROTOCOL.SCRIPT_ADDRESS}/pools/`
        },
        params: {}
      }
      try {
        let result = await dysonVueStore.dispatch(command, data)
        this.pools = result.storage
        this.pagination = result.pagination
      } catch (e) {
        alert(e.toString())
      }
    }
  },
  components: { PoolListItem, Swap },
  watch: {
    wsData: {
      handler: function (val) {
        if (!val) {
          return
        }
        const data = JSON.parse(val)
        const events = data.result?.events
        if (events && events[`${DYSON_PROTOCOL.SCRIPT_ADDRESS}.swap`]) {
          const pool_ids = events[`${DYSON_PROTOCOL.SCRIPT_ADDRESS}.swap`]
          console.log('pools to update', pool_ids)
          for (let i = 0; i < pool_ids.length; i++) {
            this.fetchPool(pool_ids[i])
          }
        }
      },
      deep: true
    }
  },
  created() {
    const { status, data, send, open, close } = useWebSocket(DYSON_PROTOCOL.WS_TENDERMINT, {
      autoReconnect: {
        retries: 3,
        delay: 1000,
        onFailed() {
          alert('Failed to connect WebSocket after 3 retries')
        }
      }
    })

    this.wsSend = send
    this.wsData = data
    this.fetchPool(this.id)
    this.subscribeToPool(this.id)
  }
}
</script>

<template>
  <PoolListItem
    v-if="pool"
    :pool="processPool(pool)"
    :key="pool.data"
    :account="account"
    @swap="swap"
  />
  <dialog id="swapModal" class="modal">
    <form method="dialog" class="modal-box">
      <Swap v-if="swapPool" :pool="{ ...swapPool }" :account="account" />
    </form>
    <form method="dialog" class="modal-backdrop">
      <button @click="swapPool = null">close</button>
    </form>
  </dialog>
  <dialog id="joinPoolModal" class="modal">
    <form method="dialog" class="modal-box">
      <Swap v-if="swapPool" :pool="{ ...swapPool }" :account="account" />
    </form>
    <form method="dialog" class="modal-backdrop">
      <button @click="swapPool = null">close</button>
    </form>
  </dialog>
</template>
