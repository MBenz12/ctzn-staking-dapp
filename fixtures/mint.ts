import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NftStaking } from "../target/types/nft_staking";
import { spawnMoney, toPublicKey } from "./lib";
import { TokenAccount } from "./token-account";

import {
  createMint,
  mintTo,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount
} from "@solana/spl-token";

class Mint {
  constructor(
    public key: anchor.web3.PublicKey,
    public authority: anchor.web3.Keypair,
    public program: Program<NftStaking>
  ) {}

  static async create(
    program: Program<NftStaking>,
    authority: anchor.web3.Keypair = anchor.web3.Keypair.generate(),
    freezeAuthority: anchor.web3.PublicKey | null = null
  ): Promise<Mint> {
    console.log("creating mint...");
    await spawnMoney(program, authority.publicKey, 1);
    console.log('request airdrop 1 sol ');
    let mint = await createMint(
      program.provider.connection, 
      authority, 
      authority.publicKey,
      freezeAuthority, 
      2,
    );
    console.log("Mint created successfully!");
    return new Mint(mint, authority, program);
  }

  async mintTokens<T extends anchor.web3.PublicKey | anchor.web3.Keypair>(
    to: TokenAccount<T>,
    amount: number
  ) {
    await mintTo(
      this.program.provider.connection,
      this.authority,
      this.key,
      to.key,
      this.authority.publicKey,
      amount,
    );
  }

  async getAssociatedTokenAddress<
    T extends anchor.web3.PublicKey | anchor.web3.Keypair
  >(owner: T): Promise<anchor.web3.PublicKey> {
    return await getAssociatedTokenAddress(
      this.key,
      toPublicKey(owner),
      true
    );
  }

  async createAssociatedAccount<
    T extends anchor.web3.PublicKey | anchor.web3.Keypair
  >(owner: T): Promise<TokenAccount<T>> {
    const tokenAccount = await createAssociatedTokenAccount(
      this.program.provider.connection,
      this.authority,
      this.key,
      toPublicKey(owner),
    );
    return new TokenAccount(this.program, tokenAccount, this, owner);
  }
}

const MINT_SIZE = 4 + 32 + 8 + 1 + 1 + 4 + 32;

export { Mint, MINT_SIZE };