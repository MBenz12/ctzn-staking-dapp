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

export async function createMints(metadatas: string[], program: Program<NftStaking>, wallet: WalletContextState) {
  let tx = new Transaction();
  for (const metadata of metadatas) {
    const mint = Keypair.generate();
    tx.add(
      // create mint account
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: await getMinimumBalanceForRentExemptMint(program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      createInitializeMintInstruction(
        mint.publicKey, // mint pubkey
        0, // decimals
        wallet.publicKey, // mint authority
        wallet.publicKey // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      )
    );
    
  }

  await wallet.sendTransaction(tx, program.provider.connection);
}