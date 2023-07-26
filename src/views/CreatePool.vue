<script>
/*global dysonVueStore */

import { dispatchWrapper } from "./dispatchWrapper.js"

export default {
  props: ["account"],
  data() {
    return {
      baseAmount: "",
      baseDenom: "",
      dysAmount: "",
      error: "",
      txResult: null,
      bgUrl: new URL("../assets/img/create-bg.jpg", import.meta.url).href,
    }
  },
  components: {
  },
  computed: {
    address: function () {
      return this.account?.bech32Address
    },
    coins: function () {
      return this.baseAmount + " " + this.baseDenom + " , " + this.dysAmount + " dys"
    },
  },
  methods: {
    async createPool() {
      this.txResult = null
      this.error = null
      console.log("createPool")
      let command = "dyson/sendMsgRun"
      let data = {
        value: {
          creator: this.address,
          address: "whaleswap.dys",
          function_name: "create_pool",
          coins: this.coins,
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
        this.baseAmount = ""
        this.baseDenom = ""
        this.dysAmount = ""
        console.log(this.txResult)
      } catch (e) {
        console.log(e.toString())
        this.error = e.toString()
      }
    },
  },
}
</script>
<template>
  <div class="hero min-h-screen" :style="{ backgroundImage: `url(${bgUrl})` }">
    <div class="hero-overlay bg-opacity-50"></div>
    <div class="hero-content text-center">
      <div class="py-10 lg:pl-72">
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="max-w-md">
            <div class="text-success" v-if="txResult?.result">
              <p>
                Congratulations! A new pool has been successfully created with Pool ID
                {{ txResult.result.pool_id }}. You have received {{ txResult.result.total_shares }}
                {{ txResult.result.shares_denom }} liquidity shares. The transaction hash is
                {{ txResult.transactionHash }}.
              </p>
            </div>
            <div class="card md:w-96 bg-base-200 m-auto">
              <form @submit.prevent="createPool">
                <div class="card-body items-center text-center">
                  <h2 class="card-title">Create Pool</h2>

                  <div class="form-control w-full">
                    <label class="label">
                      <span class="label-text">Base Amount</span>
                    </label>
                    <input
                      v-model="baseAmount"
                      type="text"
                      class="input input-bordered join-item input-primary"
                    />
                  </div>

                  <div class="form-control w-full">
                    <label class="label">
                      <span class="label-text">Base Denom</span>
                    </label>
                    <input
                      v-model="baseDenom"
                      type="text"
                      class="input input-bordered join-item input-primary"
                    />
                  </div>
                  =

                  <div class="form-control w-full">
                    <label class="label">
                      <span class="label-text">Quote Amount in DYS</span>
                    </label>
                    <input
                      v-model="dysAmount"
                      type="text"
                      class="input input-bordered join-item input-primary"
                    />
                  </div>

                  <div class="text-red-500" v-if="error">Error: {{ error }}</div>
                  <div class="card-actions">
                    <button class="btn btn-primary" :disabled="!address" type="submit">
                      Create Pool
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
