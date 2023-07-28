<script>
import { dispatchWrapper } from "./dispatchWrapper.js"
import DenomUnitConverter from "../components/DenomUnitConverter.vue"

export default {
  props: {
    pool: Object,
    account: Object,
  },
  data() {
    return {
      baseValue: "",
      quoteValue: "",
      txResult: null,
      inFlight: false,
      error: null,
      updating: null,
      availableShares: 0,
    }
  },
  components: {
    DenomUnitConverter,
  },
  computed: {
    sharesDenom: function () {
      return `pool-${this.pool.pool_id}.whaleswap.dys`
    },
    address: function () {
      return this.account?.bech32Address
    },
    baseAmount: {
      get() {
        return this.baseValue
      },
      set(value) {
        if (this.updating === "quote") return
        this.updating = "base"
        this.baseValue = value
        if (this.pool.base.balance && this.pool.quote.balance) {
          this.quoteValue = Math.ceil((value * this.pool.quote.balance) / this.pool.base.balance)
        }
        this.updating = null
      },
    },
    quoteAmount: {
      get() {
        return this.quoteValue
      },
      set(value) {
        if (this.updating === "base") return
        this.updating = "quote"
        this.quoteValue = value
        if (this.pool.base.balance && this.pool.quote.balance) {
          this.baseValue = Math.ceil((value * this.pool.base.balance) / this.pool.quote.balance)
        }
        this.updating = null
      },
    },
  },
  methods: {
    async fetchPoolShares() {
      console.log("fetching pool shares", this.sharesDenom)

      this.availableShares = 0
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
    async addLiquidity() {
      this.inFlight = true
      this.error = null

      const command = "dyson/sendMsgRun"
      const data = {
        value: {
          creator: this.address,
          address: "whaleswap.dys",
          function_name: "join_pool",
          kwargs: JSON.stringify({
            pool_id: this.pool.pool_id,
          }),
          coins: `${this.baseAmount} ${this.pool.base.denom}, ${this.quoteAmount} ${this.pool.quote.denom}`,
        },
        fee: [
          {
            amount: "223",
            denom: "dys",
          },
        ],
        gas: "2230000",
      }
      console.log("data", data)

      try {
        this.txResult = await dispatchWrapper(command, data)
      } catch (e) {
        this.error = e.toString()
      } finally {
        this.inFlight = false
      }
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
    "account.bech32Address": {
      handler: async function (account) {
        console.log("account changed", account.bech32Address)
        this.availableShares = await this.fetchPoolShares()
      },
      deep: true,
    },
  },
}
</script>

<template>
  <div v-if="txResult">
    <div v-if="error" class="flex flex-col w-full border-opacity-50">
      <h3 class="font-bold text-lg error">Error!</h3>
      <pre>{{ error }}</pre>
    </div>
    <div v-else class="flex flex-col w-full border-opacity-50">
      <h3 class="font-bold text-lg success">Success!</h3>
      <p>Transaction Hash: {{ txResult.transactionHash }}</p>
      <p>Shares Received: {{ txResult.result.shares }} {{ txResult.result.share_denom }}</p>
      <DenomUnitConverter
        v-if="txResult.result.refund.length > 0"
        :internalDenom="txResult.result.refund[0].denom"
        :internalAmount="txResult.result.refund[0].amount"
      >
        <template v-slot="{ displayAmount, displayDenom }">
          Refund Amount: {{ displayAmount }} {{ displayDenom }}
        </template>
      </DenomUnitConverter>
    </div>
  </div>
  <div v-else class="flex flex-col w-full border-opacity-50">
    <h1 class="text-2xl font-bold">Join Pool</h1>

    <div class="grid flex-grow card">
      <div class="alert">
        <span class="">
		  Your shares: {{ availableShares.toLocaleString() }} ({{
            (availableShares / pool.total_shares) * 100
          }}%)</span
        >
        <span class=""> Total shares: {{ pool.total_shares.toLocaleString() }} </span>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text text-lg">Add Exactly</span>
        </label>
        <DenomUnitConverter :internalDenom="pool.base.denom" v-model:internalAmount="baseAmount">
          <template v-slot="{ displayAmount, displayDenom, handleDisplayChange }">
            <input
              class="input input-bordered input-primary"
              :value="displayAmount"
              @input="(event) => handleDisplayChange(displayDenom, event.target.value)"
              placeholder=""
            />
            <label class="label">
              <span class="text-lg uppercase">{{ displayDenom }}</span>
            </label>
          </template>
        </DenomUnitConverter>
      </div>
    </div>

    <div class="divider">And</div>

    <div class="grid flex-grow card">
      <div class="form-control">
        <label class="label">
          <span class="label-text text-lg">Add Exactly</span>
        </label>

        <DenomUnitConverter :internalDenom="pool.quote.denom" v-model:internalAmount="quoteAmount">
          <template v-slot="{ displayAmount, displayDenom, handleDisplayChange }">
            <input
              class="input input-bordered input-primary"
              :value="displayAmount"
              @input="(event) => handleDisplayChange(displayDenom, event.target.value)"
              placeholder=""
            />
            <label class="label">
              <span class="text-lg uppercase">{{ displayDenom }}</span>
            </label>
          </template>
        </DenomUnitConverter>
      </div>
    </div>

    <p v-if="error" class="py-4 text-red-500">{{ error }}</p>

    <button
      class="btn btn-lg btn-block btn-primary"
      @click.prevent="addLiquidity"
      :disabled="!address || inFlight"
    >
      Add Liquidity
    </button>
  </div>
</template>
<style scoped></style>
