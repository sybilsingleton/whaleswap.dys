<script>
/* global dysonVueStore */
/**
 * Calculation utility functions
 */

// import dispatchWrapper
import { dispatchWrapper } from './dispatchWrapper.js'

// Calculate swap-in scenario
function calculateSwapIn(balanceA, balanceB, swapInA) {
  const constantProduct = balanceA * balanceB
  const newBalanceA = balanceA + swapInA
  const newBalanceB = constantProduct / newBalanceA
  const swapOutB = Math.floor(balanceB - newBalanceB)
  return { newBalanceA, newBalanceB, swapOutB }
}

// Calculate swap-out scenario
function calculateSwapOut(balanceA, balanceB, desiredSwapOutB) {
  const constantProduct = balanceA * balanceB
  const newBalanceB = balanceB - desiredSwapOutB
  const newBalanceA = constantProduct / newBalanceB
  const swapInA = Math.ceil(newBalanceA - balanceA)
  return { newBalanceA, newBalanceB, swapInA }
}

/**
 * Pool operations
 */

// Simulate swap
function simulateSwap(pool, coinsString) {
  // Clone pool object to avoid mutations
  pool = { ...pool }

  // Parse coinsString
  const [inputAmountStr, inputDenom] = coinsString.split(' ')
  const inputAmount = Number(inputAmountStr)

  // Determine if base or quote
  const isBase = inputDenom === pool.base.denom

  // Perform calculation and update balances
  const { newBalanceA, newBalanceB, swapOutB } = calculateSwapIn(
    isBase ? pool.base.balance : pool.quote.balance,
    isBase ? pool.quote.balance : pool.base.balance,
    inputAmount
  )
  if (isBase) {
    pool.base.balance = newBalanceA
    pool.quote.balance = newBalanceB
  } else {
    pool.quote.balance = newBalanceA
    pool.base.balance = newBalanceB
  }

  if (swapOutB <= 0) throw 'Invalid swap amount'
  if (pool.base.balance <= 0) throw 'Swap size too large'
  if (pool.quote.balance <= 0) throw 'Swap size too large'

  // Return result
  return {
    output_amount: swapOutB,
    output_denom: isBase ? pool.quote.denom : pool.base.denom
  }
}

// Simulate inverse swap
function simulateSwapInverse(pool, desiredOutputAmount, desiredOutputDenom) {
  // Determine if base or quote
  const isBase = desiredOutputDenom === pool.base.denom

  // Perform calculation and update balances
  const { newBalanceA, newBalanceB, swapInA } = calculateSwapOut(
    isBase ? pool.base.balance : pool.quote.balance,
    isBase ? pool.quote.balance : pool.base.balance,
    desiredOutputAmount
  )
  if (isBase) {
    pool.base.balance = newBalanceA
    pool.quote.balance = newBalanceB
  } else {
    pool.quote.balance = newBalanceA
    pool.base.balance = newBalanceB
  }
  if (swapInA <= 0) throw 'Invalid swap amount'
  if (pool.base.balance <= 0) throw 'Swap size too large'
  if (pool.quote.balance <= 0) throw 'Swap size too large'
  // Return result
  return `${swapInA} ${isBase ? pool.base.denom : pool.quote.denom}`
}

export default {
  props: ['pool', 'account'],
  data() {
    return {
      pool_ids: this.pool.pool_id,
      coins: '',
      minimum_swap_out_amount: '',
      swap_out_denom: this.pool.quote.denom,
      sim: '',
      slipagePct: '',
      slippageAmount: '',
      error: '',
      inFlight: false,
      txResult: null
    }
  },
  computed: {
    address: function () {
      return this.account?.bech32Address
    },
    baseAmount: {
      set(amount) {
        this.error = ''
        this.swap_out_denom = this.pool.quote.denom
        if (amount === '') {
          this.minimum_swap_out_amount = ''
        } else {
          let pool = JSON.parse(JSON.stringify(this.pool))
          try {
            let sim = this.simulateSwap(pool, amount + ' ' + this.pool.base.denom)
            if (sim.output_amount > 0) {
              this.minimum_swap_out_amount = sim.output_amount
            }
          } catch (e) {
            console.log(e)

            this.error = e.toString()
            this.minimum_swap_out_amount = ''
          }
        }
        this.coins = amount + ' ' + this.pool.base.denom
        this.swap_out_denom = this.pool.quote.denom
      },
      get() {
        return this.coins.split(' ')[0]
      }
    },
    quoteAmount: {
      set(amount) {
        this.error = ''
        if (amount === '') {
          this.coins = ''
        } else {
          //this.coins = amount * this.pool.quote.price + ' ' + this.pool.base.denom
          let pool = JSON.parse(JSON.stringify(this.pool))
          try {
            let sim = this.simulateSwapInverse(pool, amount, this.pool.base.denom)
            this.coins = sim
          } catch (e) {
            this.coins = ''
            this.error = e.toString()
            console.log(e)
          }
        }
        this.minimum_swap_out_amount = amount
        this.swap_out_denom = this.pool.quote.denom
      },
      get() {
        return this.minimum_swap_out_amount
      }
    }
  },
  component: {},
  methods: {
    simulateSwap: simulateSwap,
    simulateSwapInverse: simulateSwapInverse,
    swapBaseQuote() {
      ;[this.pool['base'], this.pool['quote']] = [this.pool['quote'], this.pool['base']]
      this.swap_out_denom = this.pool.quote.denom
      this.baseAmount = ''
      this.quoteAmount = ''
    },
    async swap(pool_ids, coins, minimum_swap_out_amount, swap_out_denom) {
      this.inFlight = true
      this.error = ''
      let command = 'dyson/sendMsgRun'
      let data = {
        value: {
          creator: this.address,
          address: 'whaleswap.dys',
          function_name: 'swap',
          kwargs: JSON.stringify({
            pool_ids: pool_ids,
            minimum_swap_out_amount: minimum_swap_out_amount,
            swap_out_denom: swap_out_denom
          }),
          coins: coins,
          nfts: ''
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
        this.txResult = await dispatchWrapper(command, data)

        console.log(this.txResult)
      } catch (e) {
        console.log(e.toString())
        this.error = e.toString()
      }
      this.inFlight = false
    }
  },
  created() {
    this.swapBaseQuote()
  }
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
      <p>
        You received: {{ txResult.result.output_amount }} {{ txResult.result.output_denom }}<br />
        Transaction Hash: {{ txResult.transactionHash }}
      </p>
    </div>
  </div>
  <div v-else class="flex flex-col w-full border-opacity-50 ">
    <h1 class="text-2xl font-bold text-base-content">Swap Pool {{ pool.pool_id}}</h1>
    <div class="grid flex-grow  card ">
      <div class="form-control">
        <label class="label">
          <span class="label-text text-lg">Send Exactly </span>
        </label>
        <input
          type="text"
          placeholder=""
          class="input input-bordered input-primary"
          v-model="baseAmount"
        />
        <label class="label">
          <span class="text-lg label-text">{{ pool.base.denom }}</span>
        </label>
      </div>
    </div>
    <div class="divider">
      <button class="btn" @click.prevent="swapBaseQuote">⇅</button>
    </div>
    <div class="grid flex-grow card ">
      <div class="form-control">
        <label class="label">
          <span class="label-text text-lg">Receive at least</span>
        </label>
        <input
          type="text"
          placeholder=""
          class="input input-bordered input-primary"
          v-model="quoteAmount"
        />
        <label class="label">
          <span class="text-lg label-text">{{ pool.quote.denom }}</span>
        </label>
      </div>
    </div>
    <p class="py-4 text-red-500">
      {{ error }}
    </p>

    <p class="py-4" v-if="!error && minimum_swap_out_amount && coins">
      Send exactly <strong>{{ coins }}</strong> and receive at least
      <strong>{{ minimum_swap_out_amount }} {{ swap_out_denom }}</strong>
    </p>
    <button
      class="btn btn-lg btn-block btn-primary"
      @click.prevent="swap(pool.pool_id, coins, minimum_swap_out_amount, swap_out_denom)"
      :disabled="!address || inFlight"
    >
      Swap Coins
    </button>
  </div>
</template>
