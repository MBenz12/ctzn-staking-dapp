import { Program } from "@project-serum/anchor";
import { NftStaking } from "../target/types/nft_staking";
import { spawnMoney, toPublicKey } from "./lib";
import { TokenAccount } from "./token-account";

import {
  createMint,
  mintTo,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  createAssociatedTokenAccountInstruction
} from "@solana/spl-token";
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Transaction,
  SystemProgram,
  PublicKey, 
  Keypair
} from "@solana/web3.js";

class Mint {
  constructor(
    public key: PublicKey,
    public authority: Keypair | WalletContextState,
    public program: Program<NftStaking>,
    public decimals: number
  ) { }

  static async create(
    program: Program<NftStaking>,
    authority: Keypair | WalletContextState = Keypair.generate(),
    freezeAuthority: PublicKey | null = null,
    decimals: number = 2,
  ): Promise<Mint> {
    console.log("creating mint...");
    await spawnMoney(program, authority.publicKey, 1);
    console.log('request airdrop 1 sol ');
    let mint: Keypair | PublicKey = Keypair.generate();
    if (typeof authority === typeof Keypair) {
      mint = await createMint(
        program.provider.connection,
        authority as Keypair,
        authority.publicKey,
        freezeAuthority,
        decimals,
      );
    } else {
      let tx = new Transaction().add(
        // create mint account
        SystemProgram.createAccount({
          fromPubkey: authority.publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports: await getMinimumBalanceForRentExemptMint(program.provider.connection),
          programId: TOKEN_PROGRAM_ID,
        }),
        // init mint account
        createInitializeMintInstruction(
          mint.publicKey, // mint pubkey
          decimals, // decimals
          authority.publicKey, // mint authority
          authority.publicKey // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
        )
      );

      const txSignature = await (authority as Keypair).sendTransaction(tx, program.provider.connection, { signers: [mint] });
      await program.provider.connection.confirmTransaction(txSignature, "confirmed");
    }
    console.log("Mint created successfully!");
    return new Mint(mint, authority, program, decimals);
  }

  async mintTokens<T extends PublicKey | Keypair>(
    to: TokenAccount<T>,
    amount: number
  ) {
    if (typeof this.authority === typeof Keypair) {
      await mintTo(
        this.program.provider.connection,
        this.authority,
        this.key,
        to.key,
        this.authority.publicKey,
        amount,
      );
    } else {
      let tx = new Transaction().add(
        createMintToCheckedInstruction(
          this.key,
          to.key,
          this.authority.publicKey,
          amount,
          this.decimals
        )
      );

      const txSignature = await (this.authority as Keypair).sendTransaction(tx, this.program.provider.connection);
      await this.program.provider.connection.confirmTransaction(txSignature, "confirmed");
    }
  }

  async getAssociatedTokenAddress<
    T extends PublicKey | Keypair
  >(owner: T): Promise<PublicKey> {
    return await getAssociatedTokenAddress(
      this.key,
      toPublicKey(owner),
      true
    );
  }

  async createAssociatedAccount<
    T extends PublicKey | Keypair
  >(owner: T): Promise<TokenAccount<T>> {
    let tokenAccount;
    if (typeof this.authority === typeof Keypair) {
      tokenAccount = await createAssociatedTokenAccount(
        this.program.provider.connection,
        this.authority,
        this.key,
        toPublicKey(owner),
      );
    } else {
      tokenAccount = await getAssociatedTokenAddress(
        this.key,
        toPublicKey(owner)
      );
      let tx = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          this.authority.publicKey,
          tokenAccount,
          toPublicKey(owner),
          this.key,
        )
      );
      const txSignature = await (this.authority as Keypair).sendTransaction(tx, this.program.provider.connection);
      await this.program.provider.connection.confirmTransaction(txSignature, "confirmed");
    }
    return new TokenAccount(this.program, tokenAccount, this, owner);
  }
}

export { Mint };