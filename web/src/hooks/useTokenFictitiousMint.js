import * as fcl from "@onflow/fcl"
import MINT_TOKEN_TRANSACTION from "cadence/transactions/mint_tokens.cdc"
import {useRouter} from "next/dist/client/router"
import {useEffect, useState} from "react"
import useTransactionsContext from "src/components/Transactions/useTransactionsContext"
import {isSealed, isSuccessful} from "src/components/Transactions/utils"
import {paths} from "src/global/constants"
import {useSWRConfig} from "swr"
import useAppContext from "./useAppContext"
import analytics from "src/global/analytics"

export default function useTokenFictitiousMint(itemID) {
  const router = useRouter()
  const {currentUser} = useAppContext()
  const {addTransaction, transactionsById} = useTransactionsContext()
  const {mutate, cache} = useSWRConfig()
  const [txId, setTxId] = useState()
  const tx = transactionsById[txId]?.data

  const mint = async (recipient, amount) => {
    if (!recipient) throw new Error("Missing recipient")
    if (!amount) throw new Error("Missing amount")

    const newTxId = await fcl.mutate({
      cadence: MINT_TOKEN_TRANSACTION,
      args: (arg, t) => [
        arg(recipient, t.Address),
        arg(amount.toString(), t.UInt64),
      ],
      limit: 1000,
    })
    setTxId(newTxId)
    addTransaction({
      id: newTxId,
      title: `Mint ${amount} fictitious tokens and sent to ${recipient}`,
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

  return [mint, tx]
}
