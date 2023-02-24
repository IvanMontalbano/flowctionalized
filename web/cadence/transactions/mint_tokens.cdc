import FungibleToken from 0xFungibleToken
import FlowTokenFictitious from "../../../cadence/contracts/FlowTokenFictitious.cdc"

transaction(recipient: Address, amount: UFix64) {

    // Local variable for storing the reference to the minter resource
    let mintingRef: &FlowTokenFictitious.Minter
    // Local variable for storing the reference to the Vault of
    // the account that will receive the newly minted tokens
    var tokenReceiver: Capability<&FlowTokenFictitious.Vault{FlowTokenFictitious.Receiver}>

    prepare(signer: AuthAccount) {
        // Borrow a reference to the stored, private minter resource
        self.mintingRef = signer.borrow<&FlowTokenFictitious.Minter>(from: /storage/flowTokenFictitiousMinter)
            ?? panic("Could not borrow a reference to the minter")
        
        // Get the public account object for account 0x03
        let recipient = getAccount(0xf8d6e0586b0a20c7)

        // Get their public receiver capability
        self.receiver = recipient.getCapability<&FlowTokenFictitious.Vault{FlowTokenFictitious.Receiver}>
        (/public/flowTokenFictitiousReceiver)
    }
    
    execute {
        // Mint 30 tokens and deposit them into the recipient's Vault
        self.mintingRef.mintTokens(amount: amount, recipient: recipient)

        log("100 tokens minted and deposited to account")
    }
}
