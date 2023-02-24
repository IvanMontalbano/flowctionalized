import FungibleToken from "../../contracts/FungibleToken.cdc"
import FlowTokenFictitious from "../../contracts/FlowTokenFictitious.cdc"

// This transaction configures an account to hold Kitty Items.

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&FlowTokenFictitious.Vault>(from: /storage/flowTokenFictitiousVault) == nil {

            // create a new empty collection
            let vault <- FlowTokenFictitious.createEmptyVault()
            
            // save it to the account
            signer.save(<-vault, to: /storage/flowTokenFictitiousVault)

            // create a public capability for the collection
            signer.link<&FlowTokenFictitious.Vault{FungibleToken.Receiver, FungibleToken.Balance}>(/public/flowTokenFictitiousReceiver, target: /storage/flowTokenFictitiousVault)
        }
    }
}
