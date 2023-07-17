<script>
/*global dysonVueStore */
import { dispatchWrapper } from "./dispatchWrapper.js"
import { usePoolsStore } from "../stores/pools"
export default {
  name: "HomeView",
  props: ["account"],
  data() {
    return {
      inDenom: "",
      outDenom: "",
      coins: "",
      pool_ids: [],
      minimum_swap_out_amount: null,
      swap_out_denom: "",
      bestSwap: [],
      error: "",
      inFlight: false,
      txResult: null,
      poolStore: usePoolsStore(),
    }
  },
  // watch when poolStore.pools changes
  watch: {
    poolStore: {
      handler: function (newVal, oldVal) {
        console.log("poolStore changed")
        this.calculateSwapIn().then((swapOutAmount) => {
          this.minimum_swap_out_amount = swapOutAmount
        })
      },
      deep: true,
    },
    inDenom: {
      handler: function (newVal, oldVal) {
        this.coins = this.inAmount + " " + this.inDenom
        if (this.outDenom) {
          this.calculateSwapOut().then((swapInAmount) => {
            this.coins = swapInAmount + " " + this.inDenom
          })
        }
      },
      deep: true,
    },
    outDenom: {
      handler: function (newVal, oldVal) {
        this.swap_out_denom = newVal
        if (this.inDenom && this.inAmount) {
          this.calculateSwapIn().then((swapOutAmount) => {
            if (swapOutAmount > 0) {
              this.minimum_swap_out_amount = swapOutAmount
            }
          })
        }
      },
      deep: true,
    },
  },

  computed: {
    address: function () {
      return this.account?.bech32Address
    },
    inAmount: {
      set(newVal) {
        this.coins = newVal + " " + this.inDenom
        this.swap_out_denom = this.outDenom
        this.calculateSwapIn().then((swapOutAmount) => {
          this.minimum_swap_out_amount = swapOutAmount
        })
      },
      get() {
        return parseInt(this.coins.split(" ")[0])
      },
    },
    outAmount: {
      set(newVal) {
        this.minimum_swap_out_amount = newVal
        this.swap_out_denom = this.outDenom
        this.calculateSwapOut().then((swapInAmount) => {
          this.coins = swapInAmount + " " + this.inDenom
        })
      },
      get() {
        return this.minimum_swap_out_amount
      },
    },
  },
  methods: {
    async calculateSwapIn() {
      const swaps = await this.poolStore.allSwapIns(this.inAmount, this.inDenom, this.outDenom)
      this.swaps = swaps
      let maxSwapAmount = -Infinity
      let bestSwap = []
      this.bestSwap = bestSwap
      this.pool_ids = []

      for (let i = 0; i < swaps.length; i++) {
        const swapPath = swaps[i]
        const lastSwapInPath = swapPath[swapPath.length - 1]
        if (lastSwapInPath.out.amount > maxSwapAmount) {
          maxSwapAmount = lastSwapInPath.out.amount
          bestSwap = swapPath
        }
      }
      if (bestSwap === null) {
        return 0
      }

      this.pool_ids = bestSwap.map((swap) => swap.pool_id)
      this.pool_ids = this.pool_ids.join(" ")
      this.bestSwap = bestSwap
      return maxSwapAmount
    },
    async calculateSwapOut() {
      const swaps = await this.poolStore.allSwapOuts(this.inDenom, this.outAmount, this.outDenom)
      this.swaps = swaps
      let minSwapAmount = Infinity
      let bestSwap = []
      this.bestSwap = bestSwap
      this.pool_ids = []

      for (let i = 0; i < swaps.length; i++) {
        const swapPath = swaps[i]
        const firstSwapInPath = swapPath[0]
        if (firstSwapInPath.in.amount < minSwapAmount) {
          minSwapAmount = firstSwapInPath.in.amount
          bestSwap = swapPath
        }
      }

      this.pool_ids = bestSwap.map((swap) => swap.pool_id)
      // pool_ids should be a string
      this.pool_ids = this.pool_ids.join(" ")

      this.bestSwap = bestSwap
      return minSwapAmount
    },

    async swap(pool_ids, coins, minimum_swap_out_amount, swap_out_denom) {
      this.inFlight = true
      this.error = ""
      this.txResult = null
      let command = "dyson/sendMsgRun"
      let data = {
        value: {
          creator: this.address,
          address: "whaleswap.dys",
          function_name: "swap",
          kwargs: JSON.stringify({
            pool_ids: pool_ids,
            minimum_swap_out_amount: minimum_swap_out_amount,
            swap_out_denom: swap_out_denom,
          }),
          coins: coins,
          nfts: "",
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
        this.txResult = await dispatchWrapper(command, data)

        console.log(this.txResult)
      } catch (e) {
        console.log(e.toString())
        this.error = e.toString()
      }
      this.inFlight = false
    },
  },
  mounted() {
    this.poolStore.setupWebsocket()
  },
}
// :style="{ backgroundImage: `url(${home1url})` }"
</script>
<style scoped> 

.bg1 {
  background-image: url("@/assets/img/home-1.jpg");
  background-size: cover;
  background-position: center;
}

</style>
<template>
  <div
    class="hero min-h-screen bg1"
  >
    <div class="hero-overlay bg-opacity-10"></div>
    <div class="hero-content text-center text-neutral-content">
      <div class="max-w-md">
        <div class="">
          <div class="card lg:w-96 bg-base-200 m-auto md:m-8">
            <form class="card-body items-center">
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Swap In amount</span>
                </label>
                <input
                  class="input w-full input-lg input-bordered input-primary"
                  v-model.number="inAmount"
                  type="number"
                  min="0"
                  placeholder="Input Amount"
                />
              </div>
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Swap Out Denom</span>
                </label>
                <select
                  v-model="inDenom"
                  class="select w-full input-lg input-bordered input-primary"
                >
                  <option disabled value="">Select coin</option>
                  <option v-for="denom in poolStore.denoms" :key="denom" :value="denom">
                    {{ denom }}
                  </option>
                </select>
              </div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Minimum Swap Out Amount</span>
                </label>
                <input
                  class="input w-full input-lg input-bordered input-primary"
                  v-model.number="outAmount"
                  type="number"
                  placeholder="Output Amount"
                  min="0"
                />
              </div>
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Swap Out Denom</span>
                </label>
                <select
                  v-model="outDenom"
                  class="select w-full input-lg input-bordered input-primary"
                >
                  <option disabled value="">Select coin</option>
                  <option v-for="denom in poolStore.denoms" :key="denom" :value="denom">
                    {{ denom }}
                  </option>
                </select>
              </div>

              <div class="divider"></div>
              <h2 class="card-title">Best Swap Route</h2>
              <span v-if="bestSwap.length === 0">No route found with sufficient liquidity </span>
              <span v-else>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Pool</th>
                      <th>Input</th>
                      <th>Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(swap, index) in bestSwap" :key="index">
                      <td>{{ swap.pool_id }}</td>
                      <td>
                        {{ swap.in.amount }}
                        <span class="text-secondary">{{ swap.in.denom }}</span>
                      </td>
                      <td>
                        {{ swap.out.amount }}
                        <span class="text-accent">{{ swap.out.denom }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </span>
              <div class="divider"></div>

              <div v-if="txResult" class="">
                <div class="alert text-success">
                  <div class="break-words break-all">
                    You recieved: {{ txResult.result.output_amount }}
                    {{ txResult.result.output_denom }}
                    <br />
                    {{ txResult.transactionHash }}
                  </div>
                </div>
              </div>
              <div v-if="error" class="">
                <div class="alert text-error">
                  <div class="flex-1">
                    <label>Error</label>
                    <div class="">{{ error }}</div>
                  </div>
                </div>
              </div>
              <div v-if="bestSwap.length !== 0">
                Swap {{ coins }} for at least
                {{ minimum_swap_out_amount }}
                {{ swap_out_denom }}
              </div>
              <button
                :disabled="bestSwap.length === 0 || inFlight"
                @click.prevent="swap(pool_ids, coins, minimum_swap_out_amount, swap_out_denom)"
                class="btn btn-primary btn-block"
              >
                Swap
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
