import * as fclFict from "@onflow/fcl"
import {Address} from "@onflow/types"
import GET_ACCOUNT_FICTITIOUS_BALANCE from "cadence/scripts/get_balance_fictitious.cdc"

export function fetchFLOWFictitiousBalance(address) {
  if (address == null) return Promise.resolve(null)

  return fclFict
    .send([
      fclFict.script(GET_ACCOUNT_FICTITIOUS_BALANCE),
      fclFict.args([fclFict.arg(address, Address)]),
    ])
    .then(result => {
      console.log("result => ", result.encodedData.value, fclFict.decode)
      return result.encodedData.value*100000000
    })

  /*return fcl.account(address).then(d => {
    console.log("balance => ", d.balance, d)
    return d.balance
  })*/
}
