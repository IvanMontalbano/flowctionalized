import useAppContext from "src/hooks/useAppContext"
import {useState, useEffect} from "react"
import {listItemsRootClasses} from "src/components/ListItems"
import {formattedCurrency} from "src/util/currency"
import * as fcl from "@onflow/fcl"

export default function TokensListings() {
  const {currentUser} = useAppContext()
  const [flowFictitiousBalance, setflowFictitiousBalance] = useState("0.0")

  /*const {dataFict: flowFictitiousBalance, isLoading} = useFLOWFictitiousBalance(
    currentUser?.addr
  )*/

  useEffect(() => {
    getBalance()
  }, [])

  async function getBalance() {
    const result = await fcl.query({
      cadence: `
      import FungibleToken from 0xFungibleToken
      import FlowTokenFictitious from 0xf8d6e0586b0a20c7
      pub fun main(account: Address): UFix64 {
          let vaultRef = getAccount(account).getCapability(FlowTokenFictitious.TokenPublicBalancePath)
                          .borrow<&FlowTokenFictitious.Vault{FungibleToken.Balance}>()
                          ?? panic("Could not borrow Balance reference to the Vault")
          return vaultRef.balance
      }
      `,
      args: (arg, t) => [arg(currentUser?.addr, t.Address)],
    })
    console.log("result => ", result)

    setflowFictitiousBalance(result)
  }

  return (
    <div>
      <div className={listItemsRootClasses}>
        <div className="mr-10 text-gray">FLOW Fictitious</div>
        <div className="font-mono">
          {formattedCurrency(flowFictitiousBalance)}
        </div>
      </div>
    </div>
  )
}
