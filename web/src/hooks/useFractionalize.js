import * as fcl from "@onflow/fcl"
import FRACTIONALIZE_AND_MINT_FICTITIOUS from "cadence/transactions/fractionalize_and_mint_fictitious.cdc"
import {useRouter} from "next/dist/client/router"
import {useEffect, useState} from "react"
import useTransactionsContext from "src/components/Transactions/useTransactionsContext"
import {isSealed, isSuccessful} from "src/components/Transactions/utils"
import {paths} from "src/global/constants"
import {useSWRConfig} from "swr"
import useAppContext from "./useAppContext"
import analytics from "src/global/analytics"

export default function useFractionalize(itemID) {
  const router = useRouter()
  const {currentUser} = useAppContext()
  const {addTransaction, transactionsById} = useTransactionsContext()
  const {mutate, cache} = useSWRConfig()
  const [txId, setTxId] = useState()
  const tx = transactionsById[txId]?.data

  const fractionalize = async (withdrawID, itemName, amount) => {
    if (withdrawID === undefined) throw new Error("Missing withdrawID")
    if (!amount) throw new Error("Missing amount")

    const newTxId = await fcl.mutate({
      cadence: FRACTIONALIZE_AND_MINT_FICTITIOUS,
      args: (arg, t) => [
        arg(withdrawID.toString(), t.UInt64),
        arg(amount.toString(), t.UFix64),
      ],
      limit: 1000,
    })
    setTxId(newTxId)
    addTransaction({
      id: newTxId,
      title: `Fractionalized ${itemName} #${itemID} for ${amount} of fictitious tokens`,
    })
  }

  useEffect(() => {
    if (!!currentUser && isSuccessful(tx)) {
      analytics.track("kitty-items-item-sale-primary", {params: {itemID}})
      mutate(currentUser.addr)
      cache.delete(paths.apiListing(itemID))
      router.push(paths.profileItem(currentUser.addr, itemID))
    } else if (isSealed(tx)) {
      setTxId(null)
    }
  }, [cache, currentUser, itemID, mutate, router, tx])

  return [fractionalize, tx]
}
