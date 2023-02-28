// This script returns the balance of an account's FLOW Fictitious vault.
//
// Parameters:
// - address: The address of the account holding the FLOW Fictitious vault.

import FungibleToken from "../../contracts/NonFungibleToken.cdc"
import FlowTokenFictitious from "../../contracts/FlowTokenFictitious.cdc"

pub fun main(address: Address): UFix64 {
    let account = getAccount(address)

    let vaultRef = account.getCapability(/public/flowTokenFictitiousBalance)!
        .borrow<&FlowTokenFictitious.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow reference to the vault balance")

    return vaultRef.balance
}
