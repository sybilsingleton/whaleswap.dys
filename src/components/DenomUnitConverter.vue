<template>
  <div>
    <!-- Render the slot with the display values as inputs -->
    <slot
      :displayAmount="displayAmount"
      :displayDenom="displayDenom"
      :displayName="displayName"
      :handleDisplayChange="handleDisplayChange"
    />
  </div>
</template>

<script>
import { convertToInternal, convertToDisplay } from "../components/denomunitconverter.js"

export default {
  props: {
    internalAmount: {
      type: Number,
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
      this.displayDenom = display.denom
    },
  },
  mounted() {
    // Initialize display values when the component is mounted
    const display = convertToDisplay(this.internalDenom, this.internalAmount)
    this.displayName = display.name
    this.displayAmount = display.amount
    this.displayDenom = display.denom
  },
  methods: {
    // When display values change, update the internal values and emit the change event
    handleDisplayChange(displayDenom, displayAmount) {
      // if the displayAmount is flalsey, set it to 0
      if (!displayAmount) {
        return
      }
      const internal = convertToInternal(displayDenom, displayAmount)

      console.log("handleDisplayChange", displayAmount, displayDenom, internal)
      this.$emit("update:internalAmount", internal.amount)
      this.$emit("update:internalDenom", internal.denom)
    },
  },
}
</script>
