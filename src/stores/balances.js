import { useWebSocket } from "@vueuse/core"
import { defineStore } from "pinia"

let nonce = 0

export const useBalanceStore = defineStore({
  id: "balances",
  state: () => ({
    balances: {},
  }),
  getters: {
    getBalance: (state) => (denom) => {
      return state.balances[denom]
    },
  },
  actions: {
    async fetchBalance

    () {

     
