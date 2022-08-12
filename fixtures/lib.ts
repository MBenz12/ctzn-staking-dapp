import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NftStaking } from "../target/types/nft_staking";
import { Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { Mint } from "./mint";
import { ItemType, Vault } from "./vault";
import { WalletContextState } from '@solana/wallet-adapter-react';

const VAULT_CTZN_REWARD_SEED = "vault_ctzn_reward";
const VAULT_ALIEN_REWARD_SEED = "vault_alien_reward";
const VAULT_GOD_REWARD_SEED = "vault_god_reward";
const VAULT_CTZN_USER_SEED = "vault_ctzn_user";
const VAULT_ALIEN_USER_SEED = "vault_alien_user";
const VAULT_STAKE_SEED = "vault_stake";

export function toPublicKey<T extends PublicKey | Keypair>(val: T): PublicKey {
  if ("publicKey" in val) {
    return val.publicKey;
  } else {
    return val;
  }
}

export async function getRewardAddress(
  source: PublicKey,
  program: Program<NftStaking>,
  userType: number
): Promise<[PublicKey, number]> {
  let seed_prefix;
  switch (userType) {
    case 0: seed_prefix = VAULT_CTZN_REWARD_SEED; break;
    case 1: seed_prefix = VAULT_ALIEN_REWARD_SEED; break;
    case 2: seed_prefix = VAULT_GOD_REWARD_SEED; break;
    default: break;
  }
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(seed_prefix),
      source.toBuffer()
    ],
    program.programId
  );
}

export async function getUserAddress(
  vault: PublicKey,
  authority: PublicKey,
  program: Program<NftStaking>,
  userType: number
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(userType === 0 ? VAULT_CTZN_USER_SEED : VAULT_ALIEN_USER_SEED),
      vault.toBuffer(),
      authority.toBuffer()
    ],
    program.programId
  );
}

export async function getStakeAddress(
  vault: PublicKey,
  authority: PublicKey,
  stakeAccount: PublicKey,
  program: Program<NftStaking>,
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(VAULT_STAKE_SEED),
      vault.toBuffer(),
      authority.toBuffer(),
      stakeAccount.toBuffer(),
    ],
    program.programId
  );
}

export async function getBlockTime(program: Program<NftStaking>): Promise<number> {
  const slot = await program.provider.connection.getSlot();
  const timestamp = await program.provider.connection.getBlockTime(slot);
  return timestamp;
}

export async function spawnMoney(
  program: anchor.Program<NftStaking>,
  to: PublicKey,
  sol: number
): Promise<anchor.web3.TransactionSignature> {
  const lamports = sol * anchor.web3.LAMPORTS_PER_SOL;
  const transaction = new anchor.web3.Transaction();
  transaction.add(
    anchor.web3.SystemProgram.transfer({
      // @ts-ignore 
      fromPubkey: program.provider.wallet.publicKey,
      lamports,
      toPubkey: to,
    })
  );
  return await program.provider.sendAndConfirm(transaction, [], {
    commitment: "confirmed",
  });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTokenAmounts(
  program: Program<NftStaking>,
  owner: PublicKey,
  tokenAccount: PublicKey
): Promise<number> {
  const { value: accounts } =
    await program.provider.connection.getParsedTokenAccountsByOwner(owner, {
      programId: new PublicKey(TOKEN_PROGRAM_ID),
    });

  const checkedAccounts = accounts.filter(
    (t) => t.pubkey.toString() === tokenAccount.toString()
  );

  if (checkedAccounts.length > 0) {
    // console.log(checkedAccounts[0].account.data.parsed.info.tokenAmount);
    return checkedAccounts[0].account.data.parsed.info.tokenAmount.amount as number;
  }

  return 0;
}

export async function checkTokenAccounts(
  program: Program<NftStaking>,
  owner: PublicKey,
  tokenAccount: PublicKey
): Promise<boolean> {
  const { value: accounts } =
    await program.provider.connection.getParsedTokenAccountsByOwner(owner, {
      programId: new PublicKey(TOKEN_PROGRAM_ID),
    });

  const checkedAccounts = accounts.filter(
    (t) => t.pubkey.toString() === tokenAccount.toString()
  );

  return checkedAccounts.length > 0;
}

export async function createVault(program: Program<NftStaking>, wallet: WalletContextState): Promise<{
  mint: Mint;
  vault: Vault;
}> {
  
  // create reward token
  let mint;
  if (process.env.NEXT_PUBLIC_FLWR_MINT) {
    mint = new Mint(
      new PublicKey(process.env.NEXT_PUBLIC_FLWR_MINT),
      null,
      program,
      2
    );
  }
  else {
    mint = await Mint.create(program, wallet);
  }
  console.log('mint', mint.key.toString());
  const tokenAccount = await mint.createAssociatedAccount(
    wallet.publicKey
  );
  await mint.mintTokens(tokenAccount, 1000000);

  console.log('tokenAccount', tokenAccount.key.toString());
  // create vault
  const { vault } = await Vault.create({
    authority: wallet,
    program,
    mint,
  });

  return {
    mint,
    vault,
  };
}

export async function getVault(program: Program<NftStaking>): Promise<Vault | null> {
  if (!process.env.NEXT_PUBLIC_VAULT_KEY || !process.env.NEXT_PUBLIC_FLWR_MINT) return null;
  
  const vaultKey = new PublicKey(process.env.NEXT_PUBLIC_VAULT_KEY);
  const mint = new Mint(
    new PublicKey(process.env.NEXT_PUBLIC_FLWR_MINT),
    null,
    program,
    2
  );
  const [ctznsPool] = await getRewardAddress(
    vaultKey,
    program,
    0
  );
  const [aliensPool] = await getRewardAddress(
    vaultKey,
    program,
    1
  );
  const [godsPool] = await getRewardAddress(
    vaultKey,
    program,
    2
  );
  const ctznsPoolAccount = await mint.getAssociatedTokenAddress(ctznsPool);
  const aliensPoolAccount = await mint.getAssociatedTokenAddress(aliensPool);
  const godsPoolAccount = await mint.getAssociatedTokenAddress(godsPool);
  return new Vault(
    program,
    vaultKey,
    mint,
    ctznsPool,
    aliensPool,
    godsPool,
    ctznsPoolAccount,
    aliensPoolAccount,
    godsPoolAccount,
    0,
    0,
    0
  );
}

function wallet(program: Program<NftStaking>, wallet: any): any {
  throw new Error("Function not implemented.");
}
