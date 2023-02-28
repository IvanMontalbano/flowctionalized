import FungibleToken from 0xFungibleToken
import FlowTokenFictitious from 0x1e66c93eb4679497
// This transaction configures an account to hold Kitty Items.

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&FlowTokenFictitious.Vault>(from: FlowTokenFictitious.TokenStoragePath) == nil {
            
            // save it to the account
            signer.save(<-FlowTokenFictitious.createEmptyVault(), to: FlowTokenFictitious.TokenStoragePath)

            // create a public capability for the collection
            signer.link<&FlowTokenFictitious.Vault{FungibleToken.Receiver}> (
                FlowTokenFictitious.TokenPublicReceiverPath,
                target: FlowTokenFictitious.TokenStoragePath
            )
            
            signer.link<&FlowTokenFictitious.Vault{FungibleToken.Balance}>(
                FlowTokenFictitious.TokenPublicBalancePath,
                target: FlowTokenFictitious.TokenStoragePath
            )
        }
    }



    // Create a new empty Vault object
    /*let vaultA <- FlowTokenFictitious.createEmptyVault() as! @FlowTokenFictitious.Vault
        
    // Store the vault in the account storage
    signer.save<@FlowTokenFictitious.Vault>(<-vaultA, to: FlowTokenFictitious.TokenStoragePath)

    log("Empty Vault stored")
    log(FlowTokenFictitious.TokenStoragePath)

    // Create a public Receiver capability to the Vault
        let ReceiverRef = signer.link<&FlowTokenFictitious.Vault{FungibleToken.Receiver, FungibleToken.Balance}>(FlowTokenFictitious.TokenPublicReceiverPath, target: FlowTokenFictitious.TokenStoragePath)

    log("References created")
    }

    post {
        // Check that the capabilities were created correctly
        getAccount(0xf8d6e0586b0a20c7).getCapability<&FlowTokenFictitious.Vault{FungibleToken.Receiver}>(FlowTokenFictitious.TokenPublicReceiverPath)
                        .check():  
                        "Vault Receiver Reference was not created correctly"
    }*/
}
