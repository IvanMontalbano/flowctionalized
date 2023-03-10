// This script returns the balance of an account's FLOW Fictitious vault.
//
// Parameters:
// - address: The address of the account holding the FLOW Fictitious vault.

import FungibleToken from 0xFungibleToken
import FlowTokenFictitious from 0x1e66c93eb4679497

pub fun main(account: Address): UFix64 {
    if let vaultRef = getAccount(account).getCapability(/public/flowTokenFictitiousBalance)!.borrow<&FlowTokenFictitious.Vault{FungibleToken.Balance}>() {
        return vaultRef.balance
    }
    return 0.0
}
