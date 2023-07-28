import assetList from "./assetlist.json"
import Decimal from "decimal.js"

// Helper function to find an asset based on its denom
function findAsset(denom) {
  return assetList.assets.find((asset) => asset.denom_units.some((unit) => unit.denom === denom))
}

// Convert internal representation to display representation
export function convertToDisplay(internalDenom, internalAmount) {
  let asset = findAsset(internalDenom)
  if (!asset) return { denom: internalDenom, amount: internalAmount }

  console.log("convertToDisplay", asset)

  let internalUnit = asset.denom_units.find((unit) => unit.denom === internalDenom)
  let displayUnit = asset.denom_units.find((unit) => unit.denom === asset.display)

  let displayAmount = new Decimal(internalAmount || "0").div(
    new Decimal(10).pow(displayUnit.exponent),
  )
  let displayDenom = asset.display

  return { denom: displayDenom, amount: displayAmount, name: asset.name, symbol: asset.symbol }
}

// Convert display representation to internal representation
export function convertToInternal(displayDenom, displayAmount) {
  let asset = findAsset(displayDenom)
  if (!asset) return { denom: displayDenom, amount: displayAmount }
  console.log("convertToInternal", asset)

  let displayUnit = asset.denom_units.find((unit) => unit.denom === displayDenom)
  let internalUnit = asset.denom_units.find((unit) => unit.denom === asset.base)

  let internalAmount = new Decimal(displayAmount || "0").mul(
    new Decimal(10).pow(displayUnit.exponent),
  )
  let internalDenom = asset.base

  return { denom: internalDenom, amount: internalAmount }
}
