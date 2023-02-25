import * as fcl from "@onflow/fcl"
import TRANSFER_NFT_TRANSACTION from "cadence/transactions/transfer_kitty_item.cdc"
import {useRouter} from "next/dist/client/router"
import {useEffect, useState} from "react"
import useTransactionsContext from "src/components/Transactions/useTransactionsContext"
import {isSealed, isSuccessful} from "src/components/Transactions/utils"
import {paths} from "src/global/constants"
import {useSWRConfig} from "swr"
import useAppContext from "./useAppContext"
import analytics from "src/global/analytics"

export default function useItemTransfer(itemID) {
  const router = useRouter()
  const {currentUser} = useAppContext()
  const {addTransaction, transactionsById} = useTransactionsContext()
  const {mutate, cache} = useSWRConfig()
  const [txId, setTxId] = useState()
  const tx = transactionsById[txId]?.data

  const transfer = async (withdrawID, itemName, recipient) => {
    if (withdrawID === undefined) throw new Error("Missing withdrawID")
    if (!recipient) throw new Error("Missing recipient")

    const newTxId = await fcl.mutate({
      cadence: TRANSFER_NFT_TRANSACTION,
      args: (arg, t) => [
        arg(recipient, t.Address),
        arg(withdrawID.toString(), t.UInt64),
      ],
      limit: 1000,
    })
    setTxId(newTxId)
    addTransaction({
      id: newTxId,
      title: `Transfered ${itemName} #${itemID} to ${recipient}`,
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

  return [transfer, tx]
}
