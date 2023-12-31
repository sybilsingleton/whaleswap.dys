<script>
import { dispatchWrapper } from "./dispatchWrapper.js"

export default {
  props: ["pool", "account"],
  data() {
    return {
      coins: "",
      error: "",
      inFlight: false,
      txResult: null,
      availableShares:0,
    }
  },
  computed: {
    sharesDenom: function () {
      return `pool-${this.pool.pool_id}.whaleswap.dys`
    },
    address: function () {
      return this.account?.bech32Address
    },
  },
  methods: {
    async fetchPoolShares() {
      console.log("fetching pool shares", this.sharesDenom)
      let command = "cosmos.bank.v1beta1/QueryBalance"
      let data = {
        query: {
          denom: this.sharesDenom,
        },
        params: {
          address: this.address,
        },
      }
      return parseInt((await dysonVueStore.dispatch(command, data)).balance.amount)
    },

    async exitPool(pool_id, coins) {
      this.inFlight = true
      this.error = ""
      let command = "dyson/sendMsgRun"
      let data = {
        value: {
          creator: this.address,
          address: "whaleswap.dys",
          function_name: "exit_pool",
          kwargs: JSON.stringify({
            pool_id: pool_id,
          }),
          coins: coins + this.sharesDenom,
        },
        fee: [
          {
            amount: "223",
            denom: "dys",
          },
        ],
        gas: "2230000",
      }
      try {
        console.log(data)
        this.txResult = await dispatchWrapper(command, data)
        console.log(this.txResult)
      } catch (e) {
        console.log(e.toString())
        this.error = e.toString()
      }
      this.inFlight = false
    },
  },
  created: async function () {
    this.availableShares = await this.fetchPoolShares()
  },
  watch: {
    pool: {
      handler: async function (pool) {
        console.log("pool changed", pool.pool_id)
        this.availableShares = await this.fetchPoolShares()
      },
      deep: true,
    },
    account: {
      handler: async function (account) {
        console.log("account changed", account)
        this.availableShares = 0
        this.availableShares = await this.fetchPoolShares()
      },
      deep: true,
    },
  },
}
</script>

<template>
  <div v-if="txResult">
    <div v-if="txResult.error" class="flex flex-col w-full border-opacity-50">
      <h3 class="font-bold text-lg error">Error!</h3>
      <pre>{{ txResult.error }}</pre>
    </div>
    <div v-else class="flex flex-col w-full border-opacity-50">
      <h3 class="font-bold text-lg success">Success!</h3>
      <p>Transaction Hash: {{ txResult.transactionHash }}</p>
      <!-- loop ofver txResult.result list and show amount and ndenom-->
      <p>
        Sent: {{ coins }} {{ sharesDenom }}<br />
        You Recieved: {{ txResult.result[0].amount }} {{ txResult.result[0].denom }} and
        {{ txResult.result[1].amount }} {{ txResult.result[1].denom }}
      </p>
    </div>
  </div>
  <div v-else class="flex flex-col w-full border-opacity-50">
    <h1 class="text-2xl font-bold text-base-content">Exit Pool</h1>
    <div class="grid flex-grow card">
      <div class="alert">
        <span class="">
          Your shares: {{ availableShares.toLocaleString() }} ({{
            (availableShares / pool.total_shares) * 100
          }}%)
        </span >
        <span class=""> Total shares: {{ pool.total_shares.toLocaleString() }} </span>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text text-lg">Send Exactly </span>
        </label>
        <input
          type="text"
          placeholder=""
          class="input input-bordered input-primary"
          v-model="coins"
        />
        <label class="label">
          <span class="label-text text-lg uppercase">{{ sharesDenom }}</span>
        </label>
      </div>
    </div>
    <button
      class="btn btn-lg btn-block btn-primary"
      @click.prevent="exitPool(pool.pool_id, coins)"
      :disabled="!address || inFlight"
    >
      Sign Tx
    </button>
    <p class="py-4 text-red-500">
      {{ error }}
    </p>
  </div>
</template>
