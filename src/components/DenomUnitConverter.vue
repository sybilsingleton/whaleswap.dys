<template>
  <!-- Render the slot with the display values as inputs -->
  <slot
    :displayAmount="displayAmount"
    :displayDenom="displayDenom"
    :displayName="displayName"
    :displaySymbol="displaySymbol"
    :displayDescription="displayDescription"
    :handleDisplayChange="handleDisplayChange"
  />
</template>

<script>
import { convertToInternal, convertToDisplay } from "../components/denomunitconverter.js"

export default {
  props: {
    internalAmount: {
      type: [Number, Object, String],
      required: false,
      default: 0,
    },
    internalDenom: {
      type: String,
      required: true,
    },
  },
  emits: ["update:internalAmount", "update:internalDenom"],
  data() {
    return {
      displayAmount: "0",
      displayDenom: "",
      displayName: "",
      displaySymbol: "",
      displayDescription: "",
    }
  },
  watch: {
    // When internal values change, update the display values
    internalAmount(val) {
      const display = convertToDisplay(this.internalDenom, val)
      this.displayAmount = display.amount
    },
    internalDenom(val) {
      const display = convertToDisplay(val, this.internalAmount)
      this.displayName = display.name
      this.displayAmount = display.amount
      this.displayDenom = display.denom
      this.displaySymbol = display.symbol
      this.displayDescription = display.description
    },
  },
  mounted() {
    // Initialize display values when the component is mounted
    const display = convertToDisplay(this.internalDenom, this.internalAmount)
    this.displayName = display.name
    this.displayAmount = display.amount
    this.displayDenom = display.denom
    this.displaySymbol = display.symbol
    this.displayDescription = display.description
  },
  methods: {
    // When display values change, update the internal values and emit the change event
    handleDisplayChange(displayDenom, displayAmount) {
      const internal = convertToInternal(displayDenom, displayAmount)

      this.$emit("update:internalAmount", internal.amount)
      this.$emit("update:internalDenom", internal.denom)
    },
  },
}
</script>
