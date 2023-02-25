import * as fcl from "@onflow/fcl"
import TRANSFER_TOKENS_TRANSACTION from "cadence/transactions/transfer_fictitious_tokens.cdc"
import {useRouter} from "next/dist/client/router"
import {useEffect, useState} from "react"
import useTransactionsContext from "src/components/Transactions/useTransactionsContext"
import {isSealed, isSuccessful} from "src/components/Transactions/utils"
import {paths} from "src/global/constants"
import {useSWRConfig} from "swr"
import useAppContext from "./useAppContext"
import analytics from "src/global/analytics"

export default function useTokensTransfer(itemID) {
  const router = useRouter()
  const {currentUser} = useAppContext()
  const {addTransaction, transactionsById} = useTransactionsContext()
  const {mutate, cache} = useSWRConfig()
  const [txId, setTxId] = useState()
  const tx = transactionsById[txId]?.data

  const transferTokens = async (amount, recipient) => {
    if (!amount) throw new Error("Missing amount")
    if (!recipient) throw new Error("Missing recipient")
    const newTxId = await fcl.mutate({
      cadence: TRANSFER_TOKENS_TRANSACTION,
      args: (arg, t) => [
        arg(amount.toString(), t.UFix64),
        arg(recipient, t.Address),
      ],
      limit: 1000,
    })
    setTxId(newTxId)
    addTransaction({
      id: newTxId,
      title: `Transfered #${amount} to ${recipient}`,
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

  return [transferTokens, tx]
}
