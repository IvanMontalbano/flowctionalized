import FungibleToken from "./FungibleToken.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import KittyItems from "./KittyItems.cdc"

pub contract FlowTokenFictitious: FungibleToken {

    // Total supply of Flow tokens in existence
    pub var totalSupply: UFix64

    // Defines token vault storage path
    pub let TokenStoragePath: StoragePath

    // Defines token vault public balance path
    pub let TokenPublicBalancePath: PublicPath

    // Defines token vault public receiver path
    pub let TokenPublicReceiverPath: PublicPath

    // Defines token minter storage path
    pub let TokenMinterStoragePath: StoragePath

    // Dictionary to keep track of tokens and their NFT of origin
    pub var fractionsBalance: @{UInt64: Vault}

    // Event that is emitted when the contract is created
    pub event TokensInitialized(initialSupply: UFix64)

    // Event that is emitted when tokens are withdrawn from a Vault
    pub event TokensWithdrawn(amount: UFix64, from: Address?)

    // Event that is emitted when tokens are deposited to a Vault
    pub event TokensDeposited(amount: UFix64, to: Address?)

    // Event that is emitted when new tokens are minted
    pub event TokensMinted(amount: UFix64)

    // Event that is emitted when tokens are destroyed
    pub event TokensBurned(amount: UFix64)

    // Event that is emitted when a new minter resource is created
    pub event MinterCreated(allowedAmount: UFix64)

    // Event that is emitted when a new burner resource is created
    pub event BurnerCreated()
    
    // Vault
    //
    // Each user stores an instance of only the Vault in their storage
    // The functions in the Vault and governed by the pre and post conditions
    // in FungibleToken when they are called.
    // The checks happen at runtime whenever a function is called.
    //
    // Resources can only be created in the context of the contract that they
    // are defined in, so there is no way for a malicious user to create Vaults
    // out of thin air. A special Minter resource needs to be defined to mint
    // new tokens.
    //
    pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance {

        // holds the balance of a users tokens
        pub var balance: UFix64

        // initialize the balance at resource creation time
        init(balance: UFix64) {
            self.balance = balance
        }

        // withdraw
        //
        // Function that takes an integer amount as an argument
        // and withdraws that amount from the Vault.
        // It creates a new temporary Vault that is used to hold
        // the money that is being transferred. It returns the newly
        // created Vault to the context that called so it can be deposited
        // elsewhere.
        //
        pub fun withdraw(amount: UFix64): @FungibleToken.Vault {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }

        // deposit
        //
        // Function that takes a Vault object as an argument and adds
        // its balance to the balance of the owners Vault.
        // It is allowed to destroy the sent Vault because the Vault
        // was a temporary holder of the tokens. The Vault's balance has
        // been consumed and therefore can be destroyed.
        pub fun deposit(from: @FungibleToken.Vault) {
            let vault <- from as! @FlowTokenFictitious.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            vault.balance = 0.0
            destroy vault
        }

        destroy() {
            FlowTokenFictitious.totalSupply = FlowTokenFictitious.totalSupply - self.balance
        }
    }

    // createEmptyVault
    //
    // Function that creates a new Vault with a balance of zero
    // and returns it to the calling context. A user must call this function
    // and store the returned Vault in their storage in order to allow their
    // account to be able to receive deposits of this token type.
    //
    pub fun createEmptyVault(): @FungibleToken.Vault {
        return <-create Vault(balance: 0.0)
    }

    pub resource Administrator {
        // createNewMinter
        //
        // Function that creates and returns a new minter resource
        //
        pub fun createNewMinter(allowedAmount: UFix64): @Minter {
            emit MinterCreated(allowedAmount: allowedAmount)
            return <-create Minter(allowedAmount: allowedAmount)
        }

        // createNewBurner
        //
        // Function that creates and returns a new burner resource
        //
        pub fun createNewBurner(): @Burner {
            emit BurnerCreated()
            return <-create Burner()
        }
    }

    // Minter
    //
    // Resource object that token admin accounts can hold to mint new tokens.
    //
    pub resource Minter {

        // the amount of tokens that the minter is allowed to mint
        pub var allowedAmount: UFix64

        // fractionalizeNFT
        //
        // Function that trasnfer a NFT to the contract owner, mints new tokens, adds them to the total supply, and transfer them to the caller vault.
        //
        pub fun fractionalizeNFT(amount: UFix64, nft: @NonFungibleToken.NFT, recipientRef: &{FungibleToken.Receiver})/*: @FlowTokenFictitious.Vault*/ {
            pre {
                amount > UFix64(0): "Amount minted must be greater than zero"
                amount <= self.allowedAmount: "Amount minted must be less than the allowed amount"
                nft != nil: "NFT must exist"
                recipientRef != nil: "Valid capability to user's vault who want to fractionalize a NFT"
            }
            let receiver = getAccount(FlowTokenFictitious.account.address)

            let collectionCapability = receiver.getCapability(KittyItems.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic}>() ?? panic("[Collection] Could not borrow a receiver reference to the colleciton")
            collectionCapability.deposit(token: <- nft);

            FlowTokenFictitious.totalSupply = FlowTokenFictitious.totalSupply + amount
            self.allowedAmount = self.allowedAmount - amount
            emit TokensMinted(amount: amount)
            
            //let recipientRef = recipientTokens.borrow() ?? panic("[Vault] Could not borrow a receiver reference to the vault")
            recipientRef.deposit(from: <-create Vault(balance: amount))
            //self.account.save(<-nft, to: /storage/kittyItemsCollectionV14/id)
            /*FlowTokenFictitious.totalSupply = FlowTokenFictitious.totalSupply + amount
            self.allowedAmount = self.allowedAmount - amount
            emit TokensMinted(amount: amount)*/
            //return <-create Vault(balance: amount)
        }

        init(allowedAmount: UFix64) {
            self.allowedAmount = allowedAmount
        }
    }

    // Burner
    //
    // Resource object that token admin accounts can hold to burn tokens.
    //
    pub resource Burner {

        // burnTokens
        //
        // Function that destroys a Vault instance, effectively burning the tokens.
        //
        // Note: the burned tokens are automatically subtracted from the
        // total supply in the Vault destructor.
        //
        pub fun burnTokens(from: @FungibleToken.Vault) {
            let vault <- from as! @FlowTokenFictitious.Vault
            let amount = vault.balance
            destroy vault
            emit TokensBurned(amount: amount)
        }
    }

    init() {
        self.totalSupply = 0.0
        self.fractionsBalance <- {}

        self.TokenStoragePath = /storage/flowTokenFictitiousVault
        self.TokenPublicReceiverPath = /public/flowTokenFictitiousReceiver
        self.TokenPublicBalancePath = /public/flowTokenFictitiousBalance
        self.TokenMinterStoragePath = /storage/flowTokenFictitiousMinter

        // Create the Vault with the total supply of tokens and save it in storage
        //
        let vault <- create Vault(balance: self.totalSupply)
        self.account.save(<-vault, to: self.TokenStoragePath)

        // Create a public capability to the stored Vault that only exposes
        // the `deposit` method through the `Receiver` interface
        //
        self.account.link<&FlowTokenFictitious.Vault{FungibleToken.Receiver}>(
            self.TokenPublicReceiverPath,
            target: self.TokenStoragePath
        )

        // Create a public capability to the stored Vault that only exposes
        // the `balance` field through the `Balance` interface
        //
        self.account.link<&FlowTokenFictitious.Vault{FungibleToken.Balance}>(
            self.TokenPublicBalancePath,
            target: self.TokenStoragePath
        )

        // Create the Administrator resource
        let admin <- create Administrator()
        self.account.save(<-admin, to: /storage/flowTokenFictitiousAdmin)

        // Create a public capability to the stored Minter that only allows to mint new tokens provided
        // that a NFT is transferred
        self.account.link<&FlowTokenFictitious.Administrator>(
            /public/flowTokenFictitiousAdmin,
            target: /storage/flowTokenFictitiousAdmin
        )

        // Emit an event that shows that the contract was initialized
        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}
 