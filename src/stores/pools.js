/* global DYSON_PROTOCOL dysonVueStore*/
// src/stores/pools.js

import { useWebSocket } from "@vueuse/core"
import { defineStore } from "pinia"

let nonce = 0

function getPoolIndex(poolId) {
  return `${DYSON_PROTOCOL.SCRIPT_ADDRESS}/pools/${String(poolId).padStart(15, "0")}`
}

function getPoolId(poolIndex) {
  return parseInt(poolIndex.split("/").pop())
}

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

function allPaths(pools, DenomA, DenomB) {
  let paths = []

  function find_paths(pool_id, denom, path) {
    path.push(pool_id)
    if (denom === DenomB) {
      paths.push([...path])
    } else {
      for (let next_pool_id in pools) {
        if (!path.includes(next_pool_id)) {
          if (
            [pools[next_pool_id]["base"]["denom"], pools[next_pool_id]["quote"]["denom"]].includes(
              denom,
            )
          ) {
            let next_denom =
              denom === pools[next_pool_id]["base"]["denom"]
                ? pools[next_pool_id]["quote"]["denom"]
                : pools[next_pool_id]["base"]["denom"]
            find_paths(next_pool_id, next_denom, [...path])
          }
        }
      }
    }
  }

  for (let start_pool_id in pools) {
    if (
      [pools[start_pool_id]["base"]["denom"], pools[start_pool_id]["quote"]["denom"]].includes(
        DenomA,
      )
    ) {
      let start_denom =
        DenomA === pools[start_pool_id]["base"]["denom"]
          ? pools[start_pool_id]["quote"]["denom"]
          : pools[start_pool_id]["base"]["denom"]
      find_paths(start_pool_id, start_denom, [])
    }
  }

  return paths
}

function estimateSwapIn(pool_ids, pools, swap_in_amount, swap_in_denom) {
  let result = []
  for (let pool_id of pool_ids) {
    let pool = pools[pool_id]
    let input_balance, output_balance, swap_out_denom, current_price

    if (pool["base"]["denom"] === swap_in_denom) {
      input_balance = pool["base"]["balance"]
      output_balance = pool["quote"]["balance"]
      swap_out_denom = pool["quote"]["denom"]
      current_price = pool["base"]["price"]
    } else {
      input_balance = pool["quote"]["balance"]
      output_balance = pool["base"]["balance"]
      swap_out_denom = pool["base"]["denom"]
      current_price = pool["quote"]["price"]
    }

    let { swapOutB: output_amount } = calculateSwapIn(input_balance, output_balance, swap_in_amount)

    let expected_output_amount = swap_in_amount * current_price

    // calculate slippage assuming output_amount is the expected amount
    let slippage = ((expected_output_amount - output_amount) / expected_output_amount) * 100


    result.push({
      pool_id: pool_id,
      in: { amount: swap_in_amount, denom: swap_in_denom },
      out: { amount: output_amount, denom: swap_out_denom },
      slippage: slippage,
    })

    swap_in_amount = output_amount // the output becomes the input for the next pool
    swap_in_denom = swap_out_denom // the output denom becomes the input denom for the next pool
  }

  return result
}

function estimateSwapOut(pool_ids, pools, swap_out_amount, swap_out_denom) {
  let result = []
  for (let i = pool_ids.length - 1; i >= 0; i--) {
    let pool_id = pool_ids[i]
    let pool = pools[pool_id]
    let output_balance, input_balance, swap_in_denom, current_price

    if (pool["base"]["denom"] === swap_out_denom) {
      output_balance = pool["base"]["balance"]
      current_price = pool["quote"]["price"]
      input_balance = pool["quote"]["balance"]
      swap_in_denom = pool["quote"]["denom"]
    } else {
      output_balance = pool["quote"]["balance"]
      current_price = pool["base"]["price"]
      input_balance = pool["base"]["balance"]
      swap_in_denom = pool["base"]["denom"]
    }

    let { swapInA: input_amount } = calculateSwapOut(input_balance, output_balance, swap_out_amount)

    let expected_output_amount = input_amount * current_price

    // calculate slippage assuming output_amount is the expected amount
    let slippage = ((expected_output_amount - swap_out_amount) / expected_output_amount) * 100

    result.unshift({
      pool_id: pool_id,
      in: { amount: input_amount, denom: swap_in_denom },
      out: { amount: swap_out_amount, denom: swap_out_denom },
      slippage: slippage,
    })

    swap_out_amount = input_amount // the input becomes the output for the previous pool
    swap_out_denom = swap_in_denom // the input denom becomes the output denom for the previous pool
  }

  return result
}

function allSwapIns(pools, swap_in_amount, swap_in_denom, swap_out_denom) {
  // Get all paths from swap_in_denom to swap_out_denom
  let paths = allPaths(pools, swap_in_denom, swap_out_denom)

  // Estimate the swap for each path
  let swaps = paths.map((path) => estimateSwapIn(path, pools, swap_in_amount, swap_in_denom))

  // remove swaps that have negative output
  swaps = swaps.filter((swap) => swap[swap.length - 1].out.amount > 0)

  return swaps
}

function allSwapOuts(pools, swap_in_denom, swap_out_amount, swap_out_denom) {
  // Get all paths from swap_in_denom to swap_out_denom
  let paths = allPaths(pools, swap_in_denom, swap_out_denom)

  // Estimate the swap for each path
  let swaps = paths.map((path) => estimateSwapOut(path, pools, swap_out_amount, swap_out_denom))

  // remove swaps that have negative input
  swaps = swaps.filter((swap) => swap[0].in.amount > 0)
  return swaps
}

export const usePoolsStore = defineStore("pools", {
  state: () => ({
    pools: {},
    pagination: null,
    ws: null,
    denoms: [],
  }),
  getters: {
    numPools: (state) => {
      console.log("numPools", Object.keys(state.pools).length)
      return Object.keys(state.pools).length
    },
    tvl: (state) => {
      let tvl = 0
      for (let pool_id in state.pools) {
        let pool = state.pools[pool_id]
        tvl += pool.base.balance * pool.base.price
        tvl += pool.quote.balance
      }
      return tvl  
    },
    numTrades: (state) => {
      let numTrades = 0
      for (let pool_id in state.pools) {
        let pool = state.pools[pool_id]
        numTrades += pool.num_trades || 0
      }
      return numTrades
    },
    allSwapIns: (state) => (swap_in_amount, swap_in_denom, swap_out_denom) => {
      return allSwapIns(state.pools, swap_in_amount, swap_in_denom, swap_out_denom)
    },
    allSwapOuts: (state) => (swap_in_denom, swap_out_amount, swap_out_denom) => {
      return allSwapOuts(state.pools, swap_in_denom, swap_out_amount, swap_out_denom)
    },
    bestSwapIn: (state, getters) => (swap_in_amount, swap_in_denom, swap_out_denom) => {
      const swaps = allSwapIns(state.pools, swap_in_amount, swap_in_denom, swap_out_denom)
      let maxSwapAmount = -Infinity
      let bestSwap = []

      for (let i = 0; i < swaps.length; i++) {
        let swapPath = swaps[i]
        let lastSwapInPath = swapPath[swapPath.length - 1]
        if (lastSwapInPath.out.amount > maxSwapAmount) {
          maxSwapAmount = lastSwapInPath.out.amount
          bestSwap = swapPath
        }
      }
      const pool_ids = bestSwap.map((swap) => swap.pool_id).join(" ")
      return {
        pool_ids: pool_ids,
        bestSwapPath: bestSwap,
        maxSwapAmount: maxSwapAmount,
      }
    },
  },
  actions: {
    async fetchPool(id) {
      let command = "dyson/QueryStorage"
      let data = {
        query: {
          index: getPoolIndex(id),
        },
        params: {},
      }
      try {
        let result = await dysonVueStore.dispatch(command, data)

        let pool = this.processPool(result.storage)
        this.pools[pool.pool_id] = pool
      } catch (e) {
        // delete pool if it doesn't exist anymore
        if (e.toString().includes("not found")) {
          delete this.pools[id]
        } else {
          alert(e.toString())
        }
      }
      this.calculateUniqueDenoms()
    },
    calculateUniqueDenoms() {
      this.denoms = [
        ...new Set(
          Object.values(this.pools).flatMap((pool) => [pool.base.denom, pool.quote.denom]),
        ),
      ]
    },

    async fetchPools() {
      let command = "dyson/QueryPrefixStorage"
      let data = {
        query: {
          prefix: `${DYSON_PROTOCOL.SCRIPT_ADDRESS}/pools/`,
          "pagination.limit": 100,
          "pagination.key": this.pagination?.next_key,
          "pagination.reverse": true,
        },
        params: {},
      }
      let result = await dysonVueStore.dispatch(command, data)
      this.pagination = result.pagination

      result.storage.map((pool) => {
        let p = this.processPool(pool)
        this.pools[p.pool_id] = p
      })

      if (result.pagination?.next_key) {
        await this.fetchPools()
      }

      this.calculateUniqueDenoms()
    },

    processPool(data) {
      let pool = JSON.parse(data.data)
      pool.base.price = pool.quote.balance / pool.base.balance
      pool.quote.price = pool.base.balance / pool.quote.balance
      pool.index = data.index

      return pool
    },
    async setupWebsocket() {
      if (this.ws) {
        console.log("websocket already connected")
        return
      }
      let that = this
      this.ws = useWebSocket(DYSON_PROTOCOL.WS_TENDERMINT, {
        onConnected() {
          console.log("connected to websocket")
          that.ws.send(
            JSON.stringify({
              jsonrpc: "2.0",
              method: "subscribe",
              id: nonce++,
              params: {
                query: `${DYSON_PROTOCOL.SCRIPT_ADDRESS}.poolupdate EXISTS`,
              },
            }),
          )
        },
        onMessage(ws, event) {
          const data = JSON.parse(event.data)
          const events = data.result?.events
          if (events && events[`${DYSON_PROTOCOL.SCRIPT_ADDRESS}.poolupdate`]) {
            const pool_ids = events[`${DYSON_PROTOCOL.SCRIPT_ADDRESS}.poolupdate`]
            console.log("pools to update", pool_ids)
            for (let i = 0; i < pool_ids.length; i++) {
              that.fetchPool(pool_ids[i])
            }
          }
        },
        autoReconnect: {
          retries: 10,
          delay: 1000,
          onFailed() {
            alert("Failed to connect WebSocket after 10 retries, please refresh the page")
          },
        },
      })
      await this.fetchPools()
    },
  },
})
