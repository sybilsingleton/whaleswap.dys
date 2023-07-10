<script>
export default {
  emits: ['swap', 'join', 'exit'],
  props: ['pool', 'account'],
  data() {
    return {}
  },
  computed: {
    address() {
      return this.account?.bech32Address
    },
  },
  components: {},
  methods: {},
  created() {},
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="card-title">Pool: {{ pool.pool_id }}</div>
      <div class="stats shadow stats-vertical lg:stats-horizontal bg-base-200">
        <div class="stat">
          <div class="stat-value">{{ pool.base.denom }}</div>
          <div class="stat-actions justify-end">
            <div class="join">
              <button
                class="btn btn-primary join-item"
                @click="$emit('swap', pool)"
                :disabled="!account"
              >
                Swap
              </button>
              <button
                class="btn btn-primary join-item"
                @click="$emit('join', pool)"
                :disabled="!account"
              >
                Join Pool
              </button>
              <button
                class="btn btn-primary join-item"
                @click="$emit('exit', pool)"
                :disabled="!account"
              >
                Exit Pool
              </button>
            </div>
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">1 {{ pool.base.denom }} ≃</div>
          <div class="stat-value truncate">
            {{ pool.base.price.toPrecision(5) }}
          </div>
          <div class="stat-title">{{ pool.quote.denom }}</div>
          <div class="stat-desc text-secondary">
            Pool liquidity: {{ pool.quote.balance }} {{ pool.quote.denom }}
          </div>
        </div>

        <div class="stat">
          <div class="stat-title">1 {{ pool.quote.denom }} ≃</div>
          <div class="stat-value truncate">
            {{ pool.quote.price.toPrecision(5) }}
          </div>
          <div class="stat-title">{{ pool.base.denom }}</div>
          <div class="stat-desc text-secondary">
            Pool liquidity: {{ pool.base.balance }} {{ pool.base.denom }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
