/* global DYSON_PROTOCOL dysonVueStore*/

import { useWebSocket } from "@vueuse/core"
import { defineStore } from "pinia"

export const useBalanceStore =
  defineStore({
    id: "balance",
    state: () => ({
      balances: {},
      pagination: null,
    }),
    getters: {
      getBalance: (state) => (denom) => {
        return state.balances[denom]
      },
    },
    actions: {
      async fetchBalances(address) {
        this.balances = {}
        if (!address) {
          return
        }
        let command = "cosmos.bank.v1beta1/QueryAllBalances"
        let data = {
          params: {
            address: address,
          },
          query: {
            "pagination.limit": 1000,
            "pagination.key": this.pagination?.next_key,
            "pagination.reverse": true,
          },
        }
        let result = await dysonVueStore.dispatch(command, data)
        this.pagination = result.pagination

        result.balances.map((balance) => {
          this.balances[balance.denom] = parseInt(balance.amount)
        })

        if (result.pagination?.next_key) {
          await this.fetchBalances(address)
        }
      },
    },
  })
