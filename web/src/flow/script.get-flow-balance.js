import * as fcl from "@onflow/fcl"

export function fetchFLOWBalance(address) {
  if (address == null) return Promise.resolve(null)
  return fcl.account(address).then(d => {
    console.log("flow balance not fictitious => ", d.balance, d)
    return d.balance
  })
}
