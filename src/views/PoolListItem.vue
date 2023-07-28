<script>
import DenomUnitConverter from "../components/DenomUnitConverter.vue"

export default {
  emits: ["join", "exit"],
  props: ["pool", "account"],
  computed: {
    address() {
      return this.account?.bech32Address
    },
  },
  components: {
    DenomUnitConverter,
  },
}
</script>

<template>
  <DenomUnitConverter :internalDenom="pool.base.denom" :internalAmount="pool.base.balance">
    <template v-slot="{ displayDenom: baseDisplayDenom, displayAmount: baseDisplayAmount }">
      <DenomUnitConverter :internalDenom="pool.quote.denom" :internalAmount="pool.quote.balance">
        <template v-slot="{ displayDenom: quoteDisplayDenom, displayAmount: quoteDisplayAmount }">
          <div class="flex">
            <div class="grow">
              <div class="">Pool: {{ pool.pool_id }}</div>
              <div class="stats shadow stats-vertical xl:stats-horizontal bg-base-200 grow w-full">
                <div class="stat">
                  <div class="stat-value uppercase">{{ baseDisplayDenom }}</div>
                  <div class="stat-actions join ">
                    <button
                      class="btn btn-primary btn-sm join-item"
                      @click="$emit('join', pool)"
                      :disabled="!account"
                    >
                      Join Pool
                    </button>
                    <button
                      class="btn btn-primary btn-sm join-item"
                      @click="$emit('exit', pool)"
                      :disabled="!account"
                    >
                      Exit Pool
                    </button>
                  </div>
                </div>
                <div class="stat">
                  <div class="stat-title uppercase">1 {{ quoteDisplayDenom }} ≃</div>
                  <div class="stat-value truncate">
                    {{
                      (baseDisplayAmount / quoteDisplayAmount)
                        .toPrecision(3)
                        .toLocaleString(undefined, {
                        notation: 'standard',
                        maximumSignificantDigits: 3,
                        })
                    }}
                  </div>
                  <div class="stat-title uppercase">{{ baseDisplayDenom }}</div>
                  <div class="stat-desc text-secondary">
                    Pool liquidity: {{ quoteDisplayAmount }} {{ quoteDisplayDenom }}
                  </div>
                </div>

                <div class="stat">
                  <div class="stat-title uppercase">1 {{ baseDisplayDenom }} ≃</div>
                  <div class="stat-value truncate">
                    {{
                      (quoteDisplayAmount / baseDisplayAmount).toLocaleString(undefined, {
                        notation: 'standard',
                        maximumSignificantDigits: 3,
                      })
                    }}
                  </div>
                  <div class="stat-title uppercase">{{ quoteDisplayDenom }}</div>
                  <div class="stat-desc text-secondary">
                    Pool liquidity: {{ baseDisplayAmount }} {{ baseDisplayDenom }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DenomUnitConverter>
    </template>
  </DenomUnitConverter>
</template>
