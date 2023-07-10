<script>
/*global dysonVueStore */

import { dispatchWrapper } from './dispatchWrapper.js'
export default {
  props: ['account'],
  data() {
    return {
      baseAmount: '',
      baseDenom: '',
      dysAmount: '',
      error: '',
      txResult: null
    }
  },
  computed: {
    address: function () {
      return this.account?.bech32Address
    },
    coins: function () {
      return this.baseAmount + ' ' + this.baseDenom + ' , ' + this.dysAmount + ' dys'
    }
  },
  methods: {
    async createPool() {
      this.txResult = null
      this.error = null
      console.log('createPool')
      let command = 'dyson/sendMsgRun'
      let data = {
        value: {
          creator: this.address,
          address: 'whaleswap.dys',
          function_name: 'create_pool',
          coins: this.coins
        },
        fee: [
          {
            amount: '223',
            denom: 'dys'
          }
        ],
        gas: '2230000'
      }
      try {
        console.log(data)
        this.txResult = await dispatchWrapper(command, data)
        this.baseAmount = ''
        this.baseDenom = ''
        this.dysAmount = ''
        console.log(this.txResult)
      } catch (e) {
        console.log(e.toString())
        this.error = e.toString()
      }
    }
  }
}
</script>
<template>
  <div class="alert alert-success mx-auto my-4 w-1/2" v-if="txResult?.result">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>

    <p>
      New pool created: Pool ID {{ txResult.result.pool_id }}<br />
      You received liquidity shares: {{ txResult.result.total_shares }} {{ txResult.result.shares_denom }}! <br />
      Transaction Hash: {{ txResult.transactionHash }}
    </p>
  </div>
  <div class="card w-3/12 bg-base-200 m-auto">
    <form @submit.prevent="createPool">
      <div class="card-body items-center text-center">
        <h2 class="card-title">Create Pool</h2>

        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Base Amount</span>
          </label>
          <input v-model="baseAmount" type="text" class="input input-bordered join-item input-primary" />
        </div>

        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Base Denom</span>
          </label>
          <input v-model="baseDenom" type="text" class="input input-bordered join-item input-primary" />
        </div>
        =

        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Quote Amount in DYS</span>
          </label>
          <input v-model="dysAmount" type="text" class="input input-bordered join-item input-primary" />
        </div>

        <div class="text-red-500" v-if="error">Error: {{ error }}</div>
        <div class="card-actions ">
          <input class="btn btn-primary" type="submit" />
        </div>
      </div>
    </form>
  </div>
</template>
