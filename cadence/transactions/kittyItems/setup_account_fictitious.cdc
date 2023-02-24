import FungibleToken from "../../contracts/FungibleToken.cdc"
import FlowTokenFictitious from "../../contracts/FlowTokenFictitious.cdc"

// This transaction configures an account to hold Kitty Items.

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&FlowTokenFictitious.Vault>(from: FlowTokenFictitious.TokenStoragePath) != nil {
            return 
        }
            
        // save it to the account
        signer.save(<-FlowTokenFictitious.createEmptyVault(), to: FlowTokenFictitious.TokenStoragePath)

        // create a public capability for the collection
        signer.link<&FlowTokenFictitious.Vault{FungibleToken.Receiver}> (
            FlowTokenFictitious.TokenPublicReceiverPath,
            target: FlowTokenFictitious.TokenStoragePath
        )
        
        signer.link<&FlowTokenFictitious.Vault{FungibleToken.Balance}>(
            FlowTokenFictitious.TokenPublicReceiverPath,
            target: FlowTokenFictitious.TokenStoragePath
        )

    }
}
