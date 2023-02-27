import FungibleToken from 0xFungibleToken
import FlowTokenFictitious from 0xf8d6e0586b0a20c7

transaction(amount: UFix64, recipient: Address) {

    // The Vault resource that holds the tokens that are being transfered
    let sentVault: @FungibleToken.Vault

    prepare(signer: AuthAccount) {
        // Get a reference to the signer's stored vault
        let vaultRef = signer.borrow<&FlowTokenFictitious.Vault>(from: FlowTokenFictitious.TokenStoragePath)
            ?? panic("Could not borrow reference to the owner's Vault!")

        // Withdraw tokens from the signer's stored vault
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        // Get the recipient's public account object
        let recipientAccount = getAccount(recipient)

        // Get a reference to the recipient's Receiver
        let receiverRef = recipientAccount.getCapability(FlowTokenFictitious.TokenPublicReceiverPath)!
            .borrow<&FlowTokenFictitious.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")

        // Deposit the withdrawn tokens in the recipient's receiver
        receiverRef.deposit(from: <-self.sentVault)
    }
}
 