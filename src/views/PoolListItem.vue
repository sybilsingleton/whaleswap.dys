<script>
import DenomUnitConverter from "../components/DenomUnitConverter.vue"

export default {
  emits: ["swap", "join", "exit"],
  props: ["pool", "account"],
  data() {
    return {}
  },
  computed: {
    address() {
      return this.account?.bech32Address
    },
  },
  components: {
    DenomUnitConverter,
  },
  methods: {
    convertPool(pool) {
      if (!pool || !pool.denom || !pool.balance) return pool
      try {
        const { denom, amount: price } = convertToDisplay(pool.denom, pool.price)
        return { ...pool, denom, price }
      } catch (error) {
        console.error("Error converting pool:", error)
        return pool
      }
    },
  },
  created() {},
}
</script>

<template>
  <div class="flex">
    <div class="grow">
      <div class="">Pool: {{ pool.pool_id }}</div>
      <div class="stats shadow stats-vertical xl:stats-horizontal bg-base-200 grow w-full">
        <div class="stat">

          <DenomUnitConverter :internalDenom="pool.base.denom">
            <template v-slot="{ displayDenom }">
                <div class="stat-value">{{ displayDenom }}</div>
            </template>
          </DenomUnitConverter>
          <div class="stat-actions">
            <button class="btn btn-primary" @click="$emit('swap', pool)" :disabled="!account">
              Swap
            </button>
            <button class="btn btn-primary" @click="$emit('join', pool)" :disabled="!account">
              Join Pool
            </button>
            <button class="btn btn-primary" @click="$emit('exit', pool)" :disabled="!account">
              Exit Pool
            </button>
          </div>
        </div>
        <div class="stat">
          <DenomUnitConverter :internalDenom="pool.base.denom">
            <template v-slot="{ displayDenom, displayAmount }">
              <div class="stat-title">1 {{ displayDenom }} ≃</div>
            </template>
          </DenomUnitConverter>
          <DenomUnitConverter :internalDenom="pool.quote.denom" :internalAmount="pool.base.price">
            <template v-slot="{ displayAmount }">
              <div class="stat-value truncate">
                {{
                  parseFloat(displayAmount).toLocaleString(undefined, {
                    maximumFractionDigits: 5,
                    minimumFractionDigits: 0,
                  })
                }}
              </div>
            </template>
          </DenomUnitConverter>

          <DenomUnitConverter :internalDenom="pool.quote.denom">
            <template v-slot="{ displayDenom }">
                <div class="stat-title">{{ displayDenom }}</div>
            </template>
          </DenomUnitConverter>
          <div class="stat-desc text-secondary">
            Pool liquidity: {{ pool.quote.balance }} {{ pool.quote.denom }}
          </div>
        </div>

        <div class="stat">
          <DenomUnitConverter :internalDenom="pool.quote.denom">
            <template v-slot="{ displayDenom, displayAmount }">
              <div class="stat-title">1 {{ displayDenom }} ≃</div>
            </template>
          </DenomUnitConverter>
          <DenomUnitConverter :internalDenom="pool.base.denom" :internalAmount="pool.quote.price">
            <template v-slot="{ displayAmount }">
              <div class="stat-value truncate">
                {{
                  parseFloat(displayAmount).toLocaleString(undefined, {
                    maximumFractionDigits: 5,
                    minimumFractionDigits: 0,
                  })
                }}
              </div>
            </template>
          </DenomUnitConverter>

          <DenomUnitConverter :internalDenom="pool.base.denom">
            <template v-slot="{ displayDenom }">
                <div class="stat-title">{{ displayDenom }}</div>
            </template>
          </DenomUnitConverter>
          <DenomUnitConverter :internalDenom="pool.base.denom" :internalAmount="pool.base.balance">
            <template v-slot="{ displayDenom, displayAmount }">
              <div class="stat-desc text-secondary">
                Pool liquidity: {{ displayAmount }} {{ displayDenom }}
              </div>
            </template>
          </DenomUnitConverter>
        </div>

      </div>
    </div>
  </div>
</template>
