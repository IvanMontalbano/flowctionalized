import * as fcl from "@onflow/fcl"
import SETUP_ACCOUNT_TRANSACTION from "cadence/transactions/setup_account.cdc"
import {useRouter} from "next/dist/client/router"
import {useEffect, useState} from "react"
import useTransactionsContext from "src/components/Transactions/useTransactionsContext"
import {isSealed, isSuccessful} from "src/components/Transactions/utils"
import {paths} from "src/global/constants"
import {useSWRConfig} from "swr"
import useAppContext from "./useAppContext"
import analytics from "src/global/analytics"

export default function useSetUpVault(itemID) {
  const router = useRouter()
  const {currentUser} = useAppContext()
  const {addTransaction, transactionsById} = useTransactionsContext()
  const {mutate, cache} = useSWRConfig()
  const [txId, setTxId] = useState()
  const tx = transactionsById[txId]?.data

  const setUpVault = async (recipient) => {
    if (!recipient) throw new Error("Missing recipient")
    const newTxId = await fcl.mutate({
      cadence: SETUP_ACCOUNT_TRANSACTION,
      args: (arg, t) => [
      ],
      limit: 1000,
    })
    setTxId(newTxId)
    addTransaction({
      id: newTxId,
      title: `Vault set up for ${recipient}`,
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

  return [setUpVault, tx]
}
