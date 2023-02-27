import NonFungibleToken from 0xNonFungibleToken
import FlowTokenFictitious from 0xf8d6e0586b0a20c7
import FungibleToken from 0xFungibleToken
import KittyItems from 0xKittyItems

// This transaction transfers a Kitty Item from one account to another.

transaction(withdrawID: UInt64, amount: UFix64) {
    let nftToFractionalize: @NonFungibleToken.NFT
    let receiverRef: &{FungibleToken.Receiver}
    let minterRef: &FlowTokenFictitious.Administrator
    prepare(signer: AuthAccount) {
        //amount: UFix64, nft: @KittyItems.NFT, recipientTokens: Capability<&{FungibleToken.Receiver}>
        // get the recipients public account object
        let contractOwner = getAccount(0xKittyItems)

        // borrow a reference to the signer's NFT collection
        let collectionRef = signer.borrow<&KittyItems.Collection>(from: KittyItems.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the owner's collection")

        // borrow a public reference to the receivers collection
        //let depositRef = recipient.getCapability(KittyItems.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic}>()!

        // withdraw the NFT from the owner's collection
        self.nftToFractionalize <- collectionRef.withdraw(withdrawID: withdrawID)

        self.receiverRef = signer.getCapability(/public/flowTokenFictitiousReceiver)!.borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        
        self.minterRef = contractOwner.getCapability(/public/flowTokenFictitiousAdmin)!.borrow<&FlowTokenFictitious.Administrator>()
            ?? panic("Could not borrow admin reference to the contract owner's public storage")

    }
    execute {
        let minter <- self.minterRef.createNewMinter(allowedAmount: amount)
        minter.fractionalizeNFT(amount: amount, nft: <- self.nftToFractionalize, recipientRef: self.receiverRef)

        destroy minter
    }
}
 